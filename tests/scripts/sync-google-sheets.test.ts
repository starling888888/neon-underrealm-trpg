import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GOOGLE_FOLDER_MIME_TYPE,
  GOOGLE_SPREADSHEET_MIME_TYPE,
  XLSX_MIME_TYPE,
} from "../../scripts/sync-google-sheets/lib";

const {
  driveMock,
  exportMock,
  jwtMock,
  listMock,
  loadEnvFileMock,
  writeFileMock,
} = vi.hoisted(() => ({
  driveMock: vi.fn(),
  exportMock: vi.fn(),
  jwtMock: vi.fn(),
  listMock: vi.fn(),
  loadEnvFileMock: vi.fn(),
  writeFileMock: vi.fn(),
}));

vi.mock("node:fs/promises", async (importOriginal) => {
  const actual = await importOriginal<typeof import("node:fs/promises")>();
  return { ...actual, writeFile: writeFileMock };
});

vi.mock("node:process", () => ({ loadEnvFile: loadEnvFileMock }));

vi.mock("googleapis", () => ({
  google: {
    auth: { JWT: jwtMock },
    drive: driveMock,
  },
}));

import { runGoogleSheetsSync } from "../../scripts/sync-google-sheets/runtime";

describe("Google Spreadsheet sync runtime", () => {
  beforeEach(async () => {
    const { writeFile } =
      await vi.importActual<typeof import("node:fs/promises")>(
        "node:fs/promises",
      );
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID = "root";
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "sync@example.test";
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = "line-one\\nline-two";
    driveMock.mockReturnValue({
      files: { export: exportMock, list: listMock },
    });
    writeFileMock.mockImplementation(writeFile);
  });

  afterEach(() => {
    delete process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    vi.clearAllMocks();
  });

  it("uses the official client, paginates, recurses, and exports only spreadsheets", async () => {
    await using fixture = await createFixture();
    listMock
      .mockResolvedValueOnce({
        data: {
          files: [folder("data", "data")],
          nextPageToken: "next-page",
        },
      })
      .mockResolvedValueOnce({
        data: {
          files: [
            sheet("release-notes", "release-notes"),
            file(
              "document",
              "contents",
              "application/vnd.google-apps.document",
            ),
          ],
        },
      })
      .mockResolvedValueOnce({
        data: { files: [sheet("skills", "skills")] },
      });
    exportMock
      .mockResolvedValueOnce({ data: Buffer.from("skills-xlsx") })
      .mockResolvedValueOnce({ data: Buffer.from("release-notes-xlsx") });
    const log = vi.fn();
    const error = vi.fn();

    const exitCode = await runGoogleSheetsSync({
      error,
      log,
      outputRoot: fixture.outputRoot,
    });

    expect(exitCode).toBe(0);
    expect(loadEnvFileMock).toHaveBeenCalledOnce();
    expect(jwtMock).toHaveBeenCalledWith({
      email: "sync@example.test",
      key: "line-one\nline-two",
      scopes: ["https://www.googleapis.com/auth/drive.readonly"],
    });
    expect(driveMock).toHaveBeenCalledOnce();
    expect(listMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        pageToken: undefined,
        q: "'root' in parents and trashed = false",
      }),
    );
    expect(listMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        pageToken: "next-page",
        q: "'root' in parents and trashed = false",
      }),
    );
    expect(listMock).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        pageToken: undefined,
        q: "'data' in parents and trashed = false",
      }),
    );
    expect(exportMock).toHaveBeenCalledTimes(2);
    expect(exportMock).toHaveBeenCalledWith(
      { fileId: "skills", mimeType: XLSX_MIME_TYPE },
      { responseType: "arraybuffer" },
    );
    expect(exportMock).toHaveBeenCalledWith(
      { fileId: "release-notes", mimeType: XLSX_MIME_TYPE },
      { responseType: "arraybuffer" },
    );
    expect(
      await readFile(join(fixture.outputRoot, "release-notes.xlsx"), "utf8"),
    ).toBe("release-notes-xlsx");
    expect(
      await readFile(join(fixture.outputRoot, "data", "skills.xlsx"), "utf8"),
    ).toBe("skills-xlsx");
    expect(log).toHaveBeenCalledWith("Exported 2 spreadsheet(s).");
    expect(error).not.toHaveBeenCalled();
  });

  it("reports export failures after continuing with later spreadsheets", async () => {
    await using fixture = await createFixture();
    listMock.mockResolvedValueOnce({
      data: { files: [sheet("bad", "bad"), sheet("good", "good")] },
    });
    exportMock
      .mockRejectedValueOnce(new Error("cannot export bad"))
      .mockResolvedValueOnce({ data: Buffer.from("good-xlsx") });
    const error = vi.fn();

    const exitCode = await runGoogleSheetsSync({
      error,
      outputRoot: fixture.outputRoot,
    });

    expect(exitCode).toBe(1);
    expect(await readFile(join(fixture.outputRoot, "good.xlsx"), "utf8")).toBe(
      "good-xlsx",
    );
    expect(error).toHaveBeenCalledWith("[sync error] bad: cannot export bad");
    expect(error).toHaveBeenCalledWith("Completed with 1 error(s).");
  });

  it("reports child listing failures after continuing with later spreadsheets", async () => {
    await using fixture = await createFixture();
    listMock
      .mockResolvedValueOnce({
        data: { files: [folder("broken", "broken"), sheet("good", "good")] },
      })
      .mockRejectedValueOnce(new Error("cannot list broken"));
    exportMock.mockResolvedValueOnce({ data: Buffer.from("good-xlsx") });
    const error = vi.fn();

    const exitCode = await runGoogleSheetsSync({
      error,
      outputRoot: fixture.outputRoot,
    });

    expect(exitCode).toBe(1);
    expect(await readFile(join(fixture.outputRoot, "good.xlsx"), "utf8")).toBe(
      "good-xlsx",
    );
    expect(error).toHaveBeenCalledWith(
      "[sync error] broken: cannot list broken",
    );
  });

  it("reports write failures after continuing with later spreadsheets", async () => {
    await using fixture = await createFixture();
    listMock.mockResolvedValueOnce({
      data: { files: [sheet("bad", "bad"), sheet("good", "good")] },
    });
    exportMock
      .mockResolvedValueOnce({ data: Buffer.from("bad-xlsx") })
      .mockResolvedValueOnce({ data: Buffer.from("good-xlsx") });
    writeFileMock.mockRejectedValueOnce(new Error("cannot write bad"));
    const error = vi.fn();

    const exitCode = await runGoogleSheetsSync({
      error,
      outputRoot: fixture.outputRoot,
    });

    expect(exitCode).toBe(1);
    expect(await readFile(join(fixture.outputRoot, "good.xlsx"), "utf8")).toBe(
      "good-xlsx",
    );
    expect(error).toHaveBeenCalledWith("[sync error] bad: cannot write bad");
  });

  it("keeps output paths safe and rejects every kind of path collision", async () => {
    await using fixture = await createFixture();
    listMock
      .mockResolvedValueOnce({
        data: {
          files: [
            folder("folder-one", "directory"),
            folder("folder-two", "directory"),
            folder("folder-cross", "data.xlsx"),
            sheet("sheet-cross", "data"),
            sheet("sheet-one", "skill"),
            sheet("sheet-two", "skill.xlsx"),
            sheet("unsafe", ".."),
            sheet("good", "good"),
          ],
        },
      })
      .mockResolvedValueOnce({ data: { files: [] } })
      .mockResolvedValueOnce({ data: { files: [] } });
    exportMock
      .mockResolvedValueOnce({ data: Buffer.from("skill-xlsx") })
      .mockResolvedValueOnce({ data: Buffer.from("good-xlsx") });
    const error = vi.fn();

    const exitCode = await runGoogleSheetsSync({
      error,
      outputRoot: fixture.outputRoot,
    });

    expect(exitCode).toBe(1);
    expect(await readFile(join(fixture.outputRoot, "skill.xlsx"), "utf8")).toBe(
      "skill-xlsx",
    );
    expect(await readFile(join(fixture.outputRoot, "good.xlsx"), "utf8")).toBe(
      "good-xlsx",
    );
    expect(error).toHaveBeenCalledWith(
      "[sync error] directory: Another Drive item resolves to the same output path.",
    );
    expect(error).toHaveBeenCalledWith(
      "[sync error] data: Another Drive item resolves to the same output path.",
    );
    expect(error).toHaveBeenCalledWith(
      "[sync error] skill.xlsx: Another Drive item resolves to the same output path.",
    );
    expect(error).toHaveBeenCalledWith(
      "[sync error] ..: Spreadsheet name is unsafe.",
    );
  });

  it("returns a configuration failure before calling the Google client", async () => {
    loadEnvFileMock.mockImplementationOnce(() => {
      throw new Error(".env is missing");
    });
    const error = vi.fn();

    const exitCode = await runGoogleSheetsSync({ error });

    expect(exitCode).toBe(1);
    expect(driveMock).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledWith(
      "Google Spreadsheet sync failed: .env is missing",
    );
  });
});

function file(id: string, name: string, mimeType: string) {
  return { id, mimeType, name };
}

function folder(id: string, name: string) {
  return file(id, name, GOOGLE_FOLDER_MIME_TYPE);
}

function sheet(id: string, name: string) {
  return file(id, name, GOOGLE_SPREADSHEET_MIME_TYPE);
}

async function createFixture(): Promise<
  AsyncDisposable & { outputRoot: string }
> {
  const directory = await mkdtemp(join(tmpdir(), "neon-google-sheets-sync-"));
  return {
    outputRoot: join(directory, ".raw"),
    async [Symbol.asyncDispose]() {
      await rm(directory, { force: true, recursive: true });
    },
  };
}

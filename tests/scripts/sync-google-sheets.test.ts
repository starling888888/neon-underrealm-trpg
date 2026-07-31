import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  GOOGLE_FOLDER_MIME_TYPE,
  GOOGLE_SPREADSHEET_MIME_TYPE,
  XLSX_MIME_TYPE,
} from "../../scripts/sync-google-sheets/lib";

const { driveMock, exportMock, jwtMock, listMock, loadEnvFileMock } =
  vi.hoisted(() => ({
    driveMock: vi.fn(),
    exportMock: vi.fn(),
    jwtMock: vi.fn(),
    listMock: vi.fn(),
    loadEnvFileMock: vi.fn(),
  }));

vi.mock("node:process", () => ({ loadEnvFile: loadEnvFileMock }));

vi.mock("googleapis", () => ({
  google: {
    auth: { JWT: jwtMock },
    drive: driveMock,
  },
}));

import { runGoogleSheetsSync } from "../../scripts/sync-google-sheets/runtime";

describe("Google Spreadsheet sync runtime", () => {
  beforeEach(() => {
    process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID = "root";
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL = "sync@example.test";
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = "line-one\\nline-two";
    driveMock.mockReturnValue({
      files: { export: exportMock, list: listMock },
    });
  });

  afterEach(() => {
    delete process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    delete process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;
    vi.clearAllMocks();
  });

  it("uses the official client, paginates, recurses, and exports spreadsheets", async () => {
    await using fixture = await createFixture();
    listMock
      .mockResolvedValueOnce({
        data: {
          files: [folder("data", "data")],
          nextPageToken: "next-page",
        },
      })
      .mockResolvedValueOnce({
        data: { files: [sheet("release-notes", "release-notes")] },
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
    expect(listMock).toHaveBeenCalledTimes(3);
    expect(exportMock).toHaveBeenCalledWith(
      { fileId: "skills", mimeType: XLSX_MIME_TYPE },
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

  it("reports individual export failures after continuing with later files", async () => {
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

function folder(id: string, name: string) {
  return { id, mimeType: GOOGLE_FOLDER_MIME_TYPE, name };
}

function sheet(id: string, name: string) {
  return { id, mimeType: GOOGLE_SPREADSHEET_MIME_TYPE, name };
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

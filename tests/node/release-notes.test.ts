import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { strToU8, zipSync } from "fflate";
import releaseNotesJson from "../../data/generated/release-notes.json";
import {
  convertReleaseNotes,
  formatDateTimeJst,
} from "../../scripts/convert-release-notes/lib";
import {
  getLatestReleaseNotes,
  getReleaseNoteBody,
  getReleaseNotes,
  getReleaseNotesJson,
} from "../../src/lib/data/release-notes";
import {
  assertReleaseNotesJson,
  parseReleaseNotesJson,
  type ReleaseNotesJson,
} from "../../src/lib/schemas/release-notes";

describe("release notes conversion", () => {
  it("converts release notes, preserves line breaks, and sorts latest first", async () => {
    await using fixture = await createFixture();
    await writeWorkbook(fixture.inputPath, [
      ["更新日", "概要", "本文"],
      ["2026-07-01", "初回", ""],
      ["2026-07-07", "同日1", "本文1\r\n次行"],
      ["2026-07-07", "同日2", "本文2"],
    ]);

    const result = await convertReleaseNotes({
      inputPath: fixture.inputPath,
      outputPath: fixture.outputPath,
      now: new Date("2026-07-08T03:04:05Z"),
    });

    assert.equal(result.dataName, "release-notes");
    assert.equal(result.updatedAt, "2026-07-08T12:04:05+09:00");
    assert.deepEqual(
      result.data.map((note) => note.id),
      ["2026-07-07-002", "2026-07-07-001", "2026-07-01-001"],
    );
    assert.equal(result.data[1]?.body, "本文1\n次行");
    assert.equal(result.data[2]?.body, null);

    const written = JSON.parse(await readFile(fixture.outputPath, "utf8"));
    assert.doesNotThrow(() => parseReleaseNotesJson(written));
  });

  it("keeps updatedAt when generated data is unchanged", async () => {
    await using fixture = await createFixture();
    await writeWorkbook(fixture.inputPath, [
      ["更新日", "概要", "本文"],
      ["2026-07-07", "仮公開しました。", "仮公開しました。\n現在作成中です。"],
    ]);
    await writeExistingJson(fixture.outputPath, {
      dataName: "release-notes",
      updatedAt: "2026-07-07T00:00:00+09:00",
      data: [
        {
          id: "2026-07-07-001",
          date: "2026-07-07",
          summary: "仮公開しました。",
          body: "仮公開しました。\n現在作成中です。",
          sourceOrder: 1,
        },
      ],
    });

    const result = await convertReleaseNotes({
      inputPath: fixture.inputPath,
      outputPath: fixture.outputPath,
      now: new Date("2026-07-08T03:04:05Z"),
    });

    assert.equal(result.updatedAt, "2026-07-07T00:00:00+09:00");
  });

  it("updates updatedAt when generated data changes", async () => {
    await using fixture = await createFixture();
    await writeWorkbook(fixture.inputPath, [
      ["更新日", "概要", "本文"],
      ["2026-07-07", "変更後", ""],
    ]);
    await writeExistingJson(fixture.outputPath, {
      dataName: "release-notes",
      updatedAt: "2026-07-07T00:00:00+09:00",
      data: [
        {
          id: "2026-07-07-001",
          date: "2026-07-07",
          summary: "変更前",
          body: null,
          sourceOrder: 1,
        },
      ],
    });

    const result = await convertReleaseNotes({
      inputPath: fixture.inputPath,
      outputPath: fixture.outputPath,
      now: new Date("2026-07-08T03:04:05Z"),
    });

    assert.equal(result.updatedAt, "2026-07-08T12:04:05+09:00");
  });

  it("rejects invalid headers", async () => {
    await using fixture = await createFixture();
    await writeWorkbook(fixture.inputPath, [
      ["更新日", "かんたんな説明", "全文"],
      ["2026-07-07", "仮公開しました。", ""],
    ]);

    await assert.rejects(
      () =>
        convertReleaseNotes({
          inputPath: fixture.inputPath,
          outputPath: fixture.outputPath,
        }),
      /Invalid release notes headers/,
    );
  });

  it("rejects blank rows in the middle of data", async () => {
    await using fixture = await createFixture();
    await writeWorkbook(fixture.inputPath, [
      ["更新日", "概要", "本文"],
      ["2026-07-01", "初回", ""],
      ["", "", ""],
      ["2026-07-07", "次回", ""],
    ]);

    await assert.rejects(
      () =>
        convertReleaseNotes({
          inputPath: fixture.inputPath,
          outputPath: fixture.outputPath,
        }),
      /Blank row found/,
    );
  });

  it("rejects descending source dates", async () => {
    await using fixture = await createFixture();
    await writeWorkbook(fixture.inputPath, [
      ["更新日", "概要", "本文"],
      ["2026-07-07", "新しい", ""],
      ["2026-07-01", "古い", ""],
    ]);

    await assert.rejects(
      () =>
        convertReleaseNotes({
          inputPath: fixture.inputPath,
          outputPath: fixture.outputPath,
        }),
      /must be ascending/,
    );
  });

  it("returns summary when body is null or blank", () => {
    assert.equal(
      getReleaseNoteBody({
        id: "2026-07-07-001",
        date: "2026-07-07",
        summary: "概要",
        body: null,
        sourceOrder: 1,
      }),
      "概要",
    );
    assert.equal(
      getReleaseNoteBody({
        id: "2026-07-07-001",
        date: "2026-07-07",
        summary: "概要",
        body: "  ",
        sourceOrder: 1,
      }),
      "概要",
    );
  });

  it("loads generated release notes through the data access layer", () => {
    assert.equal(getReleaseNotesJson().dataName, "release-notes");
    assert.equal(getReleaseNotes().length, 1);
    assert.deepEqual(getLatestReleaseNotes(1), getReleaseNotes().slice(0, 1));
  });

  it("validates the committed generated release notes JSON contract", () => {
    assert.doesNotThrow(() => assertReleaseNotesJson(releaseNotesJson));
  });

  it("rejects duplicate ids in generated JSON", () => {
    assert.throws(
      () =>
        parseReleaseNotesJson({
          dataName: "release-notes",
          updatedAt: "2026-07-07T00:00:00+09:00",
          data: [
            {
              id: "2026-07-07-001",
              date: "2026-07-07",
              summary: "概要1",
              body: null,
              sourceOrder: 2,
            },
            {
              id: "2026-07-07-001",
              date: "2026-07-07",
              summary: "概要2",
              body: null,
              sourceOrder: 1,
            },
          ],
        }),
      /Duplicate release note id/,
    );
  });

  it("formats updatedAt in JST", () => {
    assert.equal(
      formatDateTimeJst(new Date("2026-07-07T15:30:00Z")),
      "2026-07-08T00:30:00+09:00",
    );
  });
});

async function writeWorkbook(
  filePath: string,
  rows: Array<Array<string | Date>>,
): Promise<void> {
  const files = {
    "[Content_Types].xml": xml(`<?xml version="1.0" encoding="UTF-8"?>
      <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
        <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
        <Default Extension="xml" ContentType="application/xml"/>
        <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
        <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
      </Types>`),
    "_rels/.rels": xml(`<?xml version="1.0" encoding="UTF-8"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
      </Relationships>`),
    "xl/workbook.xml": xml(`<?xml version="1.0" encoding="UTF-8"?>
      <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
        <sheets>
          <sheet name="release-notes" sheetId="1" r:id="rId1"/>
        </sheets>
      </workbook>`),
    "xl/_rels/workbook.xml.rels": xml(`<?xml version="1.0" encoding="UTF-8"?>
      <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
        <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
      </Relationships>`),
    "xl/worksheets/sheet1.xml": createSheetXml(rows),
  };

  await writeFile(filePath, zipSync(files));
}

async function writeExistingJson(
  filePath: string,
  value: ReleaseNotesJson,
): Promise<void> {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function createFixture(): Promise<AsyncDisposableFixture> {
  const directory = await mkdtemp(join(tmpdir(), "release-notes-"));
  return {
    inputPath: join(directory, "release-notes.xlsx"),
    outputPath: join(directory, "release-notes.json"),
    async [Symbol.asyncDispose]() {
      await rm(directory, { force: true, recursive: true });
    },
  };
}

interface AsyncDisposableFixture {
  inputPath: string;
  outputPath: string;
  [Symbol.asyncDispose](): Promise<void>;
}

function createSheetXml(rows: Array<Array<string | Date>>): Uint8Array {
  const lastColumn = rows.reduce((max, row) => Math.max(max, row.length), 1);
  const dimension = `A1:${columnName(lastColumn)}${rows.length}`;
  const rowXml = rows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const cells = row
        .map((value, columnIndex) => {
          if (value === "") {
            return "";
          }

          const cellReference = `${columnName(columnIndex + 1)}${rowNumber}`;
          const cellValue = value instanceof Date ? value.toISOString() : value;
          return `<c r="${cellReference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(
            cellValue,
          )}</t></is></c>`;
        })
        .join("");
      return `<row r="${rowNumber}">${cells}</row>`;
    })
    .join("");

  return xml(`<?xml version="1.0" encoding="UTF-8"?>
    <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
      <dimension ref="${dimension}"/>
      <sheetData>${rowXml}</sheetData>
    </worksheet>`);
}

function xml(source: string): Uint8Array {
  return strToU8(source.trim());
}

function columnName(index: number): string {
  let name = "";
  let current = index;

  while (current > 0) {
    current -= 1;
    name = String.fromCharCode(65 + (current % 26)) + name;
    current = Math.floor(current / 26);
  }

  return name;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { strToU8, zipSync } from "fflate";
import generated from "../../data/generated/ryugi-list.json";
import { convertRyugiList } from "../../scripts/convert-ryugi-index/lib";
import { getRyugiById, getRyugiList } from "../../src/lib/data/ryugi-list";
import { assertRyugiJson } from "../../src/lib/schemas/ryugi";

const groupHeaders = [
  "",
  "",
  "",
  "",
  "補足",
  "",
  "増加値",
  "",
  "基礎能力値",
  "",
  "",
  "",
  "",
  "共通スキルボーナス",
  "",
  "",
];
const headers = [
  "ID",
  "名称",
  "短い説明",
  "説明",
  "補足タイプ",
  "補足本文",
  "体力増加値",
  "精神力増加値",
  "筋力",
  "敏捷",
  "感覚",
  "肉体",
  "精神",
  "2lv",
  "5lv",
  "9lv",
];

describe("ryugi-list conversion", () => {
  it("converts input order, normalizes CRLF, and exposes generated data", async () => {
    await using fixture = await createFixture();
    const emono = row("emono");
    emono[1] = "別流儀";
    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      headers,
      row("kenkaya", "warning", "注意\r\n補足"),
      emono,
    ]);

    const result = await convertRyugiList({
      inputPath: fixture.input,
      outputPath: fixture.output,
      sheetName: "ryugi-list",
      now: new Date("2026-07-15T00:00:00Z"),
    });
    assert.deepEqual(
      result.data.map((ryugi) => [ryugi.id, ryugi.sourceOrder]),
      [
        ["kenkaya", 1],
        ["emono", 2],
      ],
    );
    assert.equal(result.data[0]?.description, "説明\n詳細");
    assert.equal(result.data[0]?.note?.content, "注意\n補足");
    assert.equal(result.data[0]?.commonSkillBonuses.level2, "攻撃+1\n防御+1");
    assert.equal(result.data[1]?.note, null);
    assert.equal(result.updatedAt, "2026-07-15T09:00:00+09:00");
    assert.doesNotThrow(() => assertRyugiJson(result));
    assert.doesNotThrow(() => assertRyugiJson(generated));
    assert.equal(getRyugiList()[0]?.id, "kenkaya");
    assert.equal(getRyugiById("kenkaya")?.id, "kenkaya");
    assert.equal(getRyugiById("unknown"), undefined);
  });

  it("keeps updatedAt for unchanged data", async () => {
    await using fixture = await createFixture();
    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      headers,
      row("kenkaya"),
    ]);
    await writeFile(
      fixture.output,
      JSON.stringify({
        dataName: "ryugi-list",
        updatedAt: "2026-01-01T00:00:00+09:00",
        data: [expectedRyugi("kenkaya", 1)],
      }),
    );
    const result = await convertRyugiList({
      inputPath: fixture.input,
      outputPath: fixture.output,
      sheetName: "ryugi-list",
    });
    assert.equal(result.updatedAt, "2026-01-01T00:00:00+09:00");
  });

  it("rejects existing ryugi changes and allows additions", async () => {
    await using fixture = await createFixture();
    await writeFile(
      fixture.output,
      JSON.stringify({
        dataName: "ryugi-list",
        updatedAt: "2026-01-01T00:00:00+09:00",
        data: [expectedRyugi("kenkaya", 1)],
      }),
    );

    const renamed = row("kenkaya");
    renamed[1] = "改名";
    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      headers,
      renamed,
    ]);
    await assert.rejects(
      () => convert(fixture),
      /name for ID "kenkaya" must not change/,
    );

    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      headers,
      row("kenka-ya"),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /ID must not change from "kenkaya" to "kenka-ya"/,
    );

    const replacement = row("emono");
    replacement[1] = "新規流儀";
    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      headers,
      replacement,
    ]);
    await assert.rejects(
      () => convert(fixture),
      /ID "kenkaya" must not be removed/,
    );

    const added = row("emono");
    added[1] = "新規流儀";
    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      headers,
      row("kenkaya"),
      added,
    ]);
    const result = await convert(fixture);
    assert.equal(result.data.length, 2);
  });

  it("rejects IDs, missing fields, partial rows, note pairs, and numeric values", async () => {
    await using fixture = await createFixture();
    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      headers,
      row("Invalid"),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /ID is invalid at row 3, column A \(ID\)/,
    );

    const missingName = row("kenkaya");
    missingName[1] = "";
    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      headers,
      missingName,
    ]);
    await assert.rejects(
      () => convert(fixture),
      /名称 is required at row 3, column B \(名称\)/,
    );

    const partial = row("kenkaya");
    partial[7] = "";
    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      headers,
      partial,
    ]);
    await assert.rejects(
      () => convert(fixture),
      /精神力増加値 must be a positive integer at row 3, column H \(精神力増加値\)/,
    );

    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      headers,
      row("kenkaya", "warning", ""),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /補足タイプ and 補足本文 must both be set at row 3, column F \(補足本文\)/,
    );

    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      headers,
      row("kenkaya", "unknown", "本文"),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /補足タイプ is invalid at row 3, column E \(補足タイプ\)/,
    );

    const decimal = row("kenkaya");
    decimal[8] = 1.5;
    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      headers,
      decimal,
    ]);
    await assert.rejects(
      () => convert(fixture),
      /筋力 must be a positive integer at row 3, column I \(筋力\)/,
    );

    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      headers,
      row("kenkaya"),
      row("kenkaya"),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /Duplicate ID at row 4, column A \(ID\)/,
    );
  });

  it("rejects header changes, extra cells, and interior blank rows", async () => {
    await using fixture = await createFixture();
    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      [...headers, "余分な列"],
      row("kenkaya"),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /Unexpected header at row 2, column Q: "余分な列"/,
    );

    const invalidGroupHeaders = [...groupHeaders];
    invalidGroupHeaders[8] = "基礎能力";
    await workbook(fixture.input, "ryugi-list", [
      invalidGroupHeaders,
      headers,
      row("kenkaya"),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /Invalid header at row 1, column I: expected "基礎能力値", received "基礎能力"/,
    );

    await workbook(fixture.input, "ryugi-list", [
      groupHeaders,
      headers,
      row("kenkaya"),
      Array(16).fill(""),
      row("emono"),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /Blank row found at row 4, column A \(ID\) before data row 5/,
    );
  });

  it("rejects duplicate IDs, duplicate names, source-order changes, and untrimmed values", () => {
    const duplicateId = structuredClone(generated);
    duplicateId.data[1] = {
      ...duplicateId.data[1],
      id: duplicateId.data[0].id,
    };
    assert.throws(() => assertRyugiJson(duplicateId), /Duplicate ryugi id/);

    const duplicateName = structuredClone(generated);
    duplicateName.data[1] = {
      ...duplicateName.data[1],
      name: duplicateName.data[0].name,
    };
    assert.throws(() => assertRyugiJson(duplicateName), /Duplicate ryugi name/);

    const sourceOrder = structuredClone(generated);
    sourceOrder.data[0].sourceOrder = 2;
    assert.throws(() => assertRyugiJson(sourceOrder), /must match input order/);

    const untrimmedId = structuredClone(generated);
    untrimmedId.data[0].id = "kenkaya\n";
    assert.throws(() => assertRyugiJson(untrimmedId), /Value must be trimmed/);

    const unnormalizedDescription = structuredClone(generated);
    unnormalizedDescription.data[0].description = "説明\r";
    assert.throws(
      () => assertRyugiJson(unnormalizedDescription),
      /Value must be trimmed/,
    );
  });
});

async function convert(fixture: { input: string; output: string }) {
  return convertRyugiList({
    inputPath: fixture.input,
    outputPath: fixture.output,
    sheetName: "ryugi-list",
  });
}

function row(
  id: string,
  noteType = "",
  noteContent = "",
): Array<string | number> {
  return [
    id,
    "流儀名",
    "短い説明",
    "説明\r\n詳細",
    noteType,
    noteContent,
    5,
    2,
    4,
    3,
    2,
    1,
    6,
    "攻撃+1\r\n防御+1",
    "行動+1",
    "達成値+1",
  ];
}

function expectedRyugi(id: string, sourceOrder: number) {
  return {
    id,
    name: "流儀名",
    shortDescription: "短い説明",
    description: "説明\n詳細",
    note: null,
    healthIncrease: 5,
    mindIncrease: 2,
    baseAttributes: {
      strength: 4,
      agility: 3,
      perception: 2,
      body: 1,
      mind: 6,
    },
    commonSkillBonuses: {
      level2: "攻撃+1\n防御+1",
      level5: "行動+1",
      level9: "達成値+1",
    },
    sourceOrder,
  };
}

async function createFixture() {
  const directory = await mkdtemp(join(tmpdir(), "ryugi-list-"));
  return {
    input: join(directory, "ryugi-list.xlsx"),
    output: join(directory, "ryugi-list.json"),
    async [Symbol.asyncDispose]() {
      await rm(directory, { recursive: true, force: true });
    },
  };
}

async function workbook(
  path: string,
  sheetName: string,
  rows: Array<Array<string | number>>,
) {
  const sheet = rows
    .map(
      (row, y) =>
        `<row r="${y + 1}">${row
          .map((value, x) => cell(value, x, y))
          .join("")}</row>`,
    )
    .join("");
  const xml = (value: string) => strToU8(value);
  await writeFile(
    path,
    zipSync({
      "[Content_Types].xml": xml(
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
      ),
      "_rels/.rels": xml(
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
      ),
      "xl/workbook.xml": xml(
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${escapeXml(sheetName)}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
      ),
      "xl/_rels/workbook.xml.rels": xml(
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
      ),
      "xl/worksheets/sheet1.xml": xml(
        `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheet}</sheetData></worksheet>`,
      ),
    }),
  );
}

function cell(value: string | number, x: number, y: number): string {
  if (value === "") return "";
  const reference = `${String.fromCharCode(65 + x)}${y + 1}`;
  if (typeof value === "number")
    return `<c r="${reference}"><v>${value}</v></c>`;
  return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${escapeXml(value)}</t></is></c>`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

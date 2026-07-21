import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { strToU8, zipSync } from "fflate";
import generated from "../../data/generated/ikizama.json";
import { convertIkizama } from "../../scripts/convert-ikizama-index/lib";
import { getIkizamaById, getIkizamaList } from "../../src/lib/data/ikizama";
import { assertIkizamaJson } from "../../src/lib/schemas/ikizama";

const groupHeaders = [
  "",
  "",
  "",
  "",
  "専用アイテム",
  "",
  "補足",
  "",
  "1lv",
  "",
  "4lv以上",
  "",
  "10lv以上",
  "",
  "",
];
const headers = [
  "ID",
  "名称",
  "短い説明",
  "説明",
  "専用アイテムID",
  "専用アイテム名称",
  "補足タイプ",
  "補足本文",
  "体力係数",
  "精神力係数",
  "体力係数",
  "精神力係数",
  "体力係数",
  "精神力係数",
  "能力値ポイント",
];

describe("ikizama conversion", () => {
  it("converts input order, exclusive item mappings, and normalized text", async () => {
    await using fixture = await createFixture();
    const second = row("another");
    second[1] = "別の生き様";
    second[4] = "another-item";
    second[5] = "別の専用アイテム";
    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      row("first", "warning", "注意\r\n補足"),
      second,
    ]);

    const result = await convertIkizama({
      inputPath: fixture.input,
      outputPath: fixture.output,
      sheetName: "ikizama-list",
      now: new Date("2026-07-15T00:00:00Z"),
    });

    assert.deepEqual(
      result.data.map((ikizama) => [ikizama.id, ikizama.sourceOrder]),
      [
        ["first", 1],
        ["another", 2],
      ],
    );
    assert.deepEqual(result.data[0]?.exclusiveItem, {
      id: "exclusive-item",
      name: "専用アイテム",
    });
    assert.equal(result.data[0]?.description, "説明\n詳細");
    assert.equal(result.data[0]?.note?.content, "注意\n補足");
    assert.deepEqual(result.data[0]?.attributePoints, [5, 4, 3, 2]);
    assert.equal(result.updatedAt, "2026-07-15T09:00:00+09:00");
    assert.doesNotThrow(() => assertIkizamaJson(result));
    assert.doesNotThrow(() => assertIkizamaJson(generated));
    assert.equal(getIkizamaList()[0]?.id, "burai");
    assert.equal(getIkizamaById("burai")?.exclusiveItem.id, "omamori");
    assert.equal(getIkizamaById("unknown"), undefined);
  });

  it("keeps updatedAt for unchanged data", async () => {
    await using fixture = await createFixture();
    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      row("first"),
    ]);
    await writeFile(
      fixture.output,
      JSON.stringify({
        dataName: "ikizama",
        updatedAt: "2026-01-01T00:00:00+09:00",
        data: [expectedIkizama("first", 1)],
      }),
    );
    const result = await convert(fixture);
    assert.equal(result.updatedAt, "2026-01-01T00:00:00+09:00");
  });

  it("rejects existing identity changes and allows additions", async () => {
    await using fixture = await createFixture();
    await writeFile(
      fixture.output,
      JSON.stringify({
        dataName: "ikizama",
        updatedAt: "2026-01-01T00:00:00+09:00",
        data: [expectedIkizama("first", 1)],
      }),
    );

    const renamed = row("first");
    renamed[1] = "改名";
    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      renamed,
    ]);
    await assert.rejects(
      () => convert(fixture),
      /name for ID "first" must not change/,
    );

    const changedId = row("changed");
    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      changedId,
    ]);
    await assert.rejects(
      () => convert(fixture),
      /ID must not change from "first" to "changed"/,
    );

    const removed = row("another");
    removed[1] = "別の生き様";
    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      removed,
    ]);
    await assert.rejects(
      () => convert(fixture),
      /Existing ikizama ID "first" must not be removed/,
    );

    const added = row("another");
    added[1] = "別の生き様";
    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      row("first"),
      added,
    ]);
    assert.equal((await convert(fixture)).data.length, 2);
  });

  it("rejects required fields, item mappings, note pairs, and numeric values", async () => {
    await using fixture = await createFixture();
    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      row("Invalid"),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /ID is invalid at row 3, column A \(ID\)/,
    );

    const missingItem = row("first");
    missingItem[4] = "";
    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      missingItem,
    ]);
    await assert.rejects(
      () => convert(fixture),
      /専用アイテムID is required at row 3, column E \(専用アイテムID\)/,
    );

    const missingItemName = row("first");
    missingItemName[5] = "";
    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      missingItemName,
    ]);
    await assert.rejects(
      () => convert(fixture),
      /専用アイテム名称 is required at row 3, column F \(専用アイテム名称\)/,
    );

    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      row("first", "warning", ""),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /補足タイプ and 補足本文 must both be set at row 3, column H \(補足本文\)/,
    );

    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      row("first", "unknown", "本文"),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /補足タイプ is invalid at row 3, column G \(補足タイプ\)/,
    );

    const decimal = row("first");
    decimal[8] = 1.5;
    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      decimal,
    ]);
    await assert.rejects(
      () => convert(fixture),
      /体力係数 must be a positive integer at row 3, column I \(体力係数\)/,
    );

    const invalidPoints = row("first");
    invalidPoints[14] = "5,4,three,2";
    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      invalidPoints,
    ]);
    await assert.rejects(
      () => convert(fixture),
      /能力値ポイント must contain four positive integers at row 3, column O \(能力値ポイント\)/,
    );
  });

  it("rejects duplicate values, header changes, extra cells, and interior blank rows", async () => {
    await using fixture = await createFixture();
    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      row("first"),
      row("first"),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /Duplicate ID at row 4, column A \(ID\)/,
    );

    const duplicateName = row("another");
    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      row("first"),
      duplicateName,
    ]);
    await assert.rejects(
      () => convert(fixture),
      /Duplicate 名称 at row 4, column B \(名称\)/,
    );

    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      [...headers, "余分な列"],
      row("first"),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /Unexpected header at row 2, column P: "余分な列"/,
    );

    const invalidGroupHeaders = [...groupHeaders];
    invalidGroupHeaders[4] = "専用";
    await workbook(fixture.input, "ikizama-list", [
      invalidGroupHeaders,
      headers,
      row("first"),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /Invalid header at row 1, column E: expected "専用アイテム", received "専用"/,
    );

    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers.slice(0, -1),
      row("first"),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /Invalid header at row 2, column O: expected "能力値ポイント", received ""/,
    );

    await workbook(fixture.input, "ikizama-list", [
      groupHeaders,
      headers,
      row("first"),
      Array(15).fill(""),
      row("another"),
    ]);
    await assert.rejects(
      () => convert(fixture),
      /Blank row found at row 4, column A \(ID\) before data row 5/,
    );
  });

  it("rejects invalid generated JSON invariants", () => {
    const duplicateId = structuredClone(generated);
    duplicateId.data[1] = {
      ...duplicateId.data[1],
      id: duplicateId.data[0].id,
    };
    assert.throws(() => assertIkizamaJson(duplicateId), /Duplicate ikizama id/);

    const duplicateName = structuredClone(generated);
    duplicateName.data[1] = {
      ...duplicateName.data[1],
      name: duplicateName.data[0].name,
    };
    assert.throws(
      () => assertIkizamaJson(duplicateName),
      /Duplicate ikizama name/,
    );

    const sourceOrder = structuredClone(generated);
    sourceOrder.data[0].sourceOrder = 2;
    assert.throws(
      () => assertIkizamaJson(sourceOrder),
      /must match input order/,
    );

    const untrimmedItem = structuredClone(generated);
    untrimmedItem.data[0].exclusiveItem.name = "お守り\n";
    assert.throws(
      () => assertIkizamaJson(untrimmedItem),
      /Value must be trimmed/,
    );
  });
});

async function convert(fixture: { input: string; output: string }) {
  return convertIkizama({
    inputPath: fixture.input,
    outputPath: fixture.output,
    sheetName: "ikizama-list",
  });
}

function row(
  id: string,
  noteType = "",
  noteContent = "",
): Array<string | number> {
  return [
    id,
    "生き様名",
    "短い説明",
    "説明\r\n詳細",
    "exclusive-item",
    "専用アイテム",
    noteType,
    noteContent,
    11,
    7,
    12,
    8,
    13,
    9,
    "5, 4, 3, 2",
  ];
}

function expectedIkizama(id: string, sourceOrder: number) {
  return {
    id,
    name: "生き様名",
    shortDescription: "短い説明",
    description: "説明\n詳細",
    exclusiveItem: {
      id: "exclusive-item",
      name: "専用アイテム",
    },
    note: null,
    secondaryAttributeCoefficients: {
      level1: { health: 11, mind: 7 },
      level4: { health: 12, mind: 8 },
      level10: { health: 13, mind: 9 },
    },
    attributePoints: [5, 4, 3, 2],
    sourceOrder,
  };
}

async function createFixture() {
  const directory = await mkdtemp(join(tmpdir(), "ikizama-"));
  return {
    input: join(directory, "ikizama-list.xlsx"),
    output: join(directory, "ikizama.json"),
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

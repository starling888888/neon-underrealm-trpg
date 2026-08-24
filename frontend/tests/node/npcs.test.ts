import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import generated from "../../data/generated/npcs.json";
import { convertNpcs } from "../../scripts/convert-npcs/lib";
import {
  getNpcById,
  getNpcGroups,
  getNpcList,
  getNpcPortraitPath,
} from "../../src/lib/data/npcs";
import { assertNpcJson } from "../../src/lib/schemas/conversion/npcs";

const headers = ["グループ", "ID", "名前", "二つ名", "ルビ", "セリフ", "説明"];

describe("npcs conversion", () => {
  it("converts input order, groups, CRLF, and exposes generated data", async () => {
    await using fixture = await createFixture();
    await workbook(fixture.input, "npcs", [
      headers,
      row("第一勢力", "alpha", "アルファ", "異名", "イミョウ"),
      row("第二勢力", "beta", "ベータ"),
    ]);

    const result = await convert(fixture, new Date("2026-07-22T00:00:00Z"));
    expect(
      result.data.map((npc) => [npc.id, npc.group, npc.sourceOrder]),
    ).toEqual([
      ["alpha", "第一勢力", 1],
      ["beta", "第二勢力", 2],
    ]);
    expect(result.data[0]?.epithet).toEqual({
      text: "異名",
      reading: "イミョウ",
    });
    expect(result.data[1]?.epithet).toBe(null);
    expect(result.data[0]?.description).toBe("説明\n詳細");
    expect(result.updatedAt).toBe("2026-07-22T09:00:00+09:00");
    expect(() => assertNpcJson(result)).not.toThrow();
    expect(() => assertNpcJson(generated)).not.toThrow();
    expect(getNpcList().length).toBe(11);
    expect(getNpcById("sanjai")?.name).toBe("サンジャイ");
    expect(getNpcById("unknown")).toBe(undefined);
    expect(
      getNpcGroups().map(({ group, npcs }) => [group, npcs.length]),
    ).toEqual([
      ["ヤクザ", 4],
      ["企業勢力", 2],
      ["独立勢力", 5],
    ]);
    expect(getNpcPortraitPath("touryou")).toBe("/images/npc/no_image.webp");
  });

  it("keeps updatedAt for unchanged data and rejects identity changes", async () => {
    await using fixture = await createFixture();
    const existing = expectedNpc("alpha", "アルファ", 1);
    await writeFile(
      fixture.output,
      JSON.stringify({
        dataName: "npcs",
        updatedAt: "2026-01-01T00:00:00+09:00",
        data: [existing],
      }),
    );
    await workbook(fixture.input, "npcs", [
      headers,
      row("第一勢力", "alpha", "アルファ"),
    ]);
    const unchanged = await convert(fixture);
    expect(unchanged.updatedAt).toBe("2026-01-01T00:00:00+09:00");

    await workbook(fixture.input, "npcs", [
      headers,
      row("第一勢力", "alpha", "改名"),
    ]);
    await expect(convert(fixture)).rejects.toThrow(
      /Name for ID "alpha" must not change/,
    );

    await workbook(fixture.input, "npcs", [
      headers,
      row("第一勢力", "beta", "ベータ"),
    ]);
    await expect(convert(fixture)).rejects.toThrow(
      /Existing NPC ID "alpha" must not be removed/,
    );
  });

  it("rejects invalid IDs, invalid groups, required fields, partial epithet pairs, headers, and interior blank rows", async () => {
    await using fixture = await createFixture();
    await workbook(fixture.input, "npcs", [
      headers,
      row("勢力", "Invalid", "名前"),
    ]);
    await expect(convert(fixture)).rejects.toThrow(
      /ID is invalid at row 2, column B \(ID\)/,
    );

    await workbook(fixture.input, "npcs", [headers, row("", "alpha", "名前")]);
    await expect(convert(fixture)).rejects.toThrow(
      /グループ is required at row 2, column A \(グループ\)/,
    );

    await workbook(fixture.input, "npcs", [headers, row("勢力", "alpha", "")]);
    await expect(convert(fixture)).rejects.toThrow(
      /名前 is required at row 2, column C \(名前\)/,
    );

    await workbook(fixture.input, "npcs", [
      headers,
      row("勢力", "alpha", "名前", "異名", ""),
    ]);
    await expect(convert(fixture)).rejects.toThrow(
      /二つ名 and ルビ must both be set at row 2, column E \(ルビ\)/,
    );

    await workbook(fixture.input, "npcs", [
      [...headers, "余分な列"],
      row("勢力", "alpha", "名前"),
    ]);
    await expect(convert(fixture)).rejects.toThrow(
      /Unexpected header at row 1, column H: "余分な列"/,
    );

    await workbook(fixture.input, "npcs", [
      headers,
      row("勢力", "alpha", "名前"),
      Array(7).fill(""),
      row("勢力", "beta", "別名"),
    ]);
    await expect(convert(fixture)).rejects.toThrow(
      /Blank row found at row 3, column A \(グループ\) before data row 4/,
    );

    await workbook(fixture.input, "npcs", [
      headers,
      row("第一勢力", "alpha", "名前A"),
      row("第二勢力", "beta", "名前B"),
      row("第一勢力", "gamma", "名前C"),
    ]);
    await expect(convert(fixture)).rejects.toThrow(
      /Group "第一勢力" must be contiguous at row 4, column A \(グループ\)/,
    );

    expect(() =>
      assertNpcJson({
        dataName: "npcs",
        updatedAt: "2026-07-22T09:00:00+09:00",
        data: [
          { ...expectedNpc("alpha", "名前A", 1), group: "第一勢力" },
          { ...expectedNpc("beta", "名前B", 2), group: "第二勢力" },
          { ...expectedNpc("gamma", "名前C", 3), group: "第一勢力" },
        ],
      }),
    ).toThrow(/NPC groups must be contiguous: "第一勢力"/);
  });
});

async function convert(fixture: { input: string; output: string }, now?: Date) {
  return convertNpcs({
    inputPath: fixture.input,
    outputPath: fixture.output,
    sheetName: "npcs",
    now,
  });
}

function row(
  group: string,
  id: string,
  name: string,
  epithet = "",
  reading = "",
): string[] {
  return [group, id, name, epithet, reading, "セリフ", "説明\r\n詳細"];
}

function expectedNpc(id: string, name: string, sourceOrder: number) {
  return {
    group: "第一勢力",
    id,
    name,
    epithet: null,
    quote: "セリフ",
    description: "説明\n詳細",
    sourceOrder,
  };
}

async function createFixture() {
  const directory = await mkdtemp(join(tmpdir(), "npcs-"));
  return {
    input: join(directory, "npcs.xlsx"),
    output: join(directory, "npcs.json"),
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

import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { strToU8, zipSync } from "fflate";
import { describe, expect, it } from "vitest";
import generated from "../../data/generated/items.json";
import { convertDrugs } from "../../scripts/convert-items/drugs";
import { convertItems } from "../../scripts/convert-items/lib";
import { convertNanomachines } from "../../scripts/convert-items/nanomachines";
import type { ItemRows } from "../../scripts/convert-items/shared";
import { convertWeapons } from "../../scripts/convert-items/weapons";
import {
  getCybernetics,
  getItemsData,
  getWeapons,
} from "../../src/lib/data/items";
import {
  assertItemsJson,
  createWeaponId,
} from "../../src/lib/schemas/conversion/item";

const weaponHeaders = [
  "区分",
  "名称",
  "信用",
  "射程",
  "種別",
  "判定",
  "攻撃力",
  "ガード値",
  "装弾数",
  "効果",
];
const armorHeaders = ["名称", "信用", "防御力", "ダメージ軽減", "制限", "効果"];
const omamoriHeaders = ["名称", "信用", "効果"];
const cyberneticHeaders = ["部位", "名称", "信用", "埋め込み点数", "効果"];
const nanomachineHeaders = [
  "名称",
  "信用",
  "埋め込み点数",
  "発動精神力",
  "効果",
];
const drugHeaders = ["名称", "信用", "使用T", "1セット数量", "BT強度", "効果"];

describe("item conversion", () => {
  it("converts all rows from all six sheets into grouped generated data", async () => {
    await using fixture = await createFixture();
    await workbook(fixture.input, fixtureSheets());

    const result = await convertItems({
      inputPath: fixture.input,
      outputPath: fixture.output,
      now: new Date("2026-07-14T00:00:00Z"),
    });

    expect(result.updatedAt).toBe("2026-07-14T09:00:00+09:00");
    expect(result.data.weapons.normal?.kenka?.map(({ name }) => name)).toEqual([
      "武器1",
      "武器2",
    ]);
    expect(result.data.cybernetics.head?.map(({ name }) => name)).toEqual([
      "サイバネ1",
      "サイバネ2",
    ]);
    expect(result.data.armors.map(({ name }) => name)).toEqual([
      "防具1",
      "防具2",
    ]);
    expect(result.data.omamori.map(({ name }) => name)).toEqual([
      "お守り1",
      "お守り2",
    ]);
    expect(result.data.nanomachines.map(({ name }) => name)).toEqual([
      "ナノ1",
      "ナノ2",
    ]);
    expect(result.data.drugs.map(({ name }) => name)).toEqual([
      "ドラッグ1",
      "ドラッグ2",
    ]);
    expect(result.data.weapons.normal?.kenka?.[0]?.id).toBe(
      createWeaponId({ group: "normal", check: "喧嘩", name: "武器1" }),
    );
    expect(() => assertItemsJson(result)).not.toThrow();
    expect(JSON.parse(await readFile(fixture.output, "utf8"))).toEqual(result);
  });

  it("keeps name-hash weapon IDs when rows are reordered", () => {
    const first = weaponRow("刀");
    const second = weaponRow("バット");
    const initial = convertWeapons([weaponHeaders, first, second]);
    const reordered = convertWeapons([weaponHeaders, second, first]);
    const idsByName = (
      items: Array<{ name: string; id: string }> | undefined,
    ) => new Map((items ?? []).map((item) => [item.name, item.id]));

    expect(idsByName(reordered.normal?.kenka)).toEqual(
      idsByName(initial.normal?.kenka),
    );
    expect(reordered.normal?.kenka?.[0]?.sourceOrder).toBe(1);
  });

  it("accepts slash-separated weapon kinds", () => {
    const weapon = weaponRow("複合武器");
    weapon[4] = "近接/特殊";

    expect(
      convertWeapons([weaponHeaders, weapon]).normal?.kenka?.[0]?.kind,
    ).toBe("近接/特殊");
  });

  it("rejects invalid headers, empty weapon ranges, dashes, and enum values", () => {
    expect(() =>
      convertWeapons([[...weaponHeaders, "ID"], weaponRow("刀")]),
    ).toThrow(/Unexpected header at row 1, column K: "ID"/);
    const emptyRange = weaponRow("刀");
    emptyRange[3] = null;
    expect(() => convertWeapons([weaponHeaders, emptyRange])).toThrow(
      /射程 is required at row 2, column D/,
    );
    const dashCredit = weaponRow("刀");
    dashCredit[2] = "-";
    expect(() => convertWeapons([weaponHeaders, dashCredit])).toThrow(
      /信用 must not use "-" at row 2, column C/,
    );
    const invalidCheck = weaponRow("刀");
    invalidCheck[5] = "不正";
    expect(() => convertWeapons([weaponHeaders, invalidCheck])).toThrow(
      /判定 is invalid at row 2, column F/,
    );
    for (const kind of ["近接/不正", "近接//特殊", "近接/近接"]) {
      const invalidKind = weaponRow("刀");
      invalidKind[4] = kind;
      expect(() => convertWeapons([weaponHeaders, invalidKind])).toThrow(
        /種別 is invalid at row 2, column E/,
      );
    }
  });

  it("rejects renamed nanomachine headers, non-numeric values, and invalid drug timing", () => {
    const invalidHeader: ItemRows = [
      ["名称", "信用", "点数", "発動精神力", "効果"],
      ["マシラ", 1, 1, 1, "効果"],
    ];
    expect(() => convertNanomachines(invalidHeader)).toThrow(
      /expected "埋め込み点数", received "点数"/,
    );
    const invalidPoints: ItemRows = [
      nanomachineHeaders,
      ["マシラ", 1, "3", 1, "効果"],
    ];
    expect(() => convertNanomachines(invalidPoints)).toThrow(
      /埋め込み点数 must be a non-negative integer at row 2, column C/,
    );
    const invalidTiming: ItemRows = [
      drugHeaders,
      ["ドラッグ", 1, "M", 1, 1, "効果"],
    ];
    expect(() => convertDrugs(invalidTiming)).toThrow(
      /使用T is invalid at row 2, column C/,
    );
  });

  it("validates generated IDs, source orders, and static data accessors", () => {
    expect(() => assertItemsJson(generated)).not.toThrow();
    expect(getItemsData()).toBe(generated.data);
    expect(getWeapons("normal", "kenka")?.[0]?.name).toBe("刀");
    expect(getWeapons("unknown", "kenka")).toBe(undefined);
    expect(getCybernetics("head")?.[0]?.part).toBe("頭");
    expect(getCybernetics("unknown")).toBe(undefined);
    for (const key of ["toString", "constructor", "__proto__"]) {
      expect(getWeapons("normal", key)).toBe(undefined);
      expect(getWeapons(key, "kenka")).toBe(undefined);
      expect(getCybernetics(key)).toBe(undefined);
    }

    const malformedId = structuredClone(generated);
    malformedId.data.armors[0].id = "item-armor-malformed";
    expect(() => assertItemsJson(malformedId)).toThrow(/does not match/);

    const sourceOrderGap = structuredClone(generated);
    sourceOrderGap.data.nanomachines[0].sourceOrder = 2;
    expect(() => assertItemsJson(sourceOrderGap)).toThrow(/consecutive/);

    const groupMismatch = structuredClone(generated);
    const firstWeapon = groupMismatch.data.weapons.normal?.kenka?.[0];
    expect(firstWeapon).toBeTruthy();
    firstWeapon.group = "cybernetics";
    expect(() => assertItemsJson(groupMismatch)).toThrow(/must be grouped/);
  });
});

function weaponRow(name: string): Array<string | number | null> {
  return ["normal", name, 1, 0, "近接", "喧嘩", 1, 1, null, "効果"];
}

function fixtureSheets(): Record<string, Array<Array<string | number | null>>> {
  return {
    weapons: [
      weaponHeaders,
      ...Array.from({ length: 2 }, (_, index) => weaponRow(`武器${index + 1}`)),
    ],
    armors: [
      armorHeaders,
      ...Array.from({ length: 2 }, (_, index) => [
        `防具${index + 1}`,
        1,
        1,
        0,
        null,
        null,
      ]),
    ],
    omamori: [
      omamoriHeaders,
      ...Array.from({ length: 2 }, (_, index) => [
        `お守り${index + 1}`,
        1,
        "効果",
      ]),
    ],
    cybernetics: [
      cyberneticHeaders,
      ...Array.from({ length: 2 }, (_, index) => [
        "頭",
        `サイバネ${index + 1}`,
        1,
        1,
        "効果",
      ]),
    ],
    nanomachines: [
      nanomachineHeaders,
      ...Array.from({ length: 2 }, (_, index) => [
        `ナノ${index + 1}`,
        1,
        1,
        1,
        "効果",
      ]),
    ],
    drugs: [
      drugHeaders,
      ...Array.from({ length: 2 }, (_, index) => [
        `ドラッグ${index + 1}`,
        1,
        "SU",
        1,
        1,
        "効果",
      ]),
    ],
  };
}

async function createFixture() {
  const directory = await mkdtemp(join(tmpdir(), "items-"));
  return {
    input: join(directory, "items.xlsx"),
    output: join(directory, "items.json"),
    async [Symbol.asyncDispose]() {
      await rm(directory, { recursive: true, force: true });
    },
  };
}

async function workbook(
  path: string,
  sheets: Record<string, Array<Array<string | number | null>>>,
) {
  const entries = Object.entries(sheets);
  const xml = (value: string) => strToU8(value);
  await writeFile(
    path,
    zipSync({
      "[Content_Types].xml": xml(
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${entries.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`,
      ),
      "_rels/.rels": xml(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
      ),
      "xl/workbook.xml": xml(
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${entries.map(([name], index) => `<sheet name="${name}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("")}</sheets></workbook>`,
      ),
      "xl/_rels/workbook.xml.rels": xml(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${entries.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("")}</Relationships>`,
      ),
      ...Object.fromEntries(
        entries.map(([_name, rows], index) => [
          `xl/worksheets/sheet${index + 1}.xml`,
          xml(
            `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rows.map((row, rowIndex) => `<row r="${rowIndex + 1}">${row.map((value, columnIndex) => cell(value, rowIndex, columnIndex)).join("")}</row>`).join("")}</sheetData></worksheet>`,
          ),
        ]),
      ),
    }),
  );
}

function cell(
  value: string | number | null,
  rowIndex: number,
  columnIndex: number,
): string {
  if (value === null || value === "") return "";
  const reference = `${columnLetter(columnIndex)}${rowIndex + 1}`;
  if (typeof value === "number")
    return `<c r="${reference}"><v>${value}</v></c>`;
  return `<c r="${reference}" t="inlineStr"><is><t>${escapeXml(value)}</t></is></c>`;
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function columnLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

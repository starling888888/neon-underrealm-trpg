import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { strToU8, zipSync } from "fflate";
import generated from "../../data/generated/ryugi-skills.json";
import { convertRyugiSkills } from "../../scripts/convert-ryugi-skills/lib";
import { getRyugiDetail } from "../../src/lib/data/ryugi-detail";
import { getRyugiList } from "../../src/lib/data/ryugi-list";
import { assertRyugiSkillsJson } from "../../src/lib/schemas/ryugi-skills";
import { createHash } from "../../src/lib/utils/hash";

const headers = [
  "区分",
  "名称",
  "最大レベル",
  "タイミング",
  "コスト",
  "技能",
  "取得制限",
  "対象",
  "射程",
  "使用制限",
  "概要",
  "効果",
];

describe("ryugi skill conversion", () => {
  it("aggregates owner sheets and regenerates after owner additions or removals", async () => {
    await using fixture = await createFixture();
    const kenkaya = row("basic", "連携\r\n斬撃", "Aa/Ra");
    kenkaya[7] = "";
    kenkaya[10] = "";
    await workbook(fixture.input, [
      { name: "kenkaya", rows: [headers, kenkaya] },
    ]);

    const initial = await convertRyugiSkills({
      inputPath: fixture.input,
      outputPath: fixture.output,
      ryugiIds: ["kenkaya"],
      now: new Date("2026-07-21T00:00:00Z"),
    });

    assert.equal(initial.updatedAt, "2026-07-21T09:00:00+09:00");
    assert.equal(
      initial.data.kenkaya.basic[0]?.id,
      `skill-ryugi-kenkaya-basic-aa_ra-${createHash("連携\n斬撃")}`,
    );
    assert.equal(initial.data.kenkaya.basic[0]?.name, "連携\n斬撃");
    assert.equal(initial.data.kenkaya.basic[0]?.target, null);
    assert.equal(initial.data.kenkaya.basic[0]?.summary, "");
    assert.equal(initial.data.kenkaya.basic[0]?.sourceOrder, 1);

    await workbook(fixture.input, [
      { name: "kenkaya", rows: [headers, kenkaya] },
      { name: "emono", rows: [headers, row("bonus", "必中", "Pv")] },
    ]);
    const added = await convertRyugiSkills({
      inputPath: fixture.input,
      outputPath: fixture.output,
      ryugiIds: ["kenkaya", "emono"],
      now: new Date("2026-07-22T00:00:00Z"),
    });
    assert.equal(added.updatedAt, "2026-07-22T09:00:00+09:00");
    assert.equal(added.data.emono.bonus[0]?.sourceOrder, 1);

    const unchanged = await convertRyugiSkills({
      inputPath: fixture.input,
      outputPath: fixture.output,
      ryugiIds: ["kenkaya", "emono"],
      now: new Date("2026-07-23T00:00:00Z"),
    });
    assert.equal(unchanged.updatedAt, "2026-07-22T09:00:00+09:00");

    await workbook(fixture.input, [
      { name: "kenkaya", rows: [headers, kenkaya] },
    ]);
    const removed = await convertRyugiSkills({
      inputPath: fixture.input,
      outputPath: fixture.output,
      ryugiIds: ["kenkaya"],
      now: new Date("2026-07-24T00:00:00Z"),
    });
    assert.equal(removed.updatedAt, "2026-07-24T09:00:00+09:00");
    assert.deepEqual(Object.keys(removed.data), ["kenkaya"]);
    assert.doesNotThrow(() => assertRyugiSkillsJson(removed, ["kenkaya"]));
  });

  it("rejects missing and unexpected owner sheets", async () => {
    await using fixture = await createFixture();
    await workbook(fixture.input, [
      { name: "kenkaya", rows: [headers, row("basic", "一撃", "Pv")] },
      { name: "other", rows: [headers, row("basic", "二撃", "Pv")] },
    ]);

    await assert.rejects(
      () =>
        convertRyugiSkills({
          inputPath: fixture.input,
          outputPath: fixture.output,
          ryugiIds: ["kenkaya", "emono"],
        }),
      /Worksheet "emono" was not found/,
    );
  });

  it("validates the generated data and combines ryugi data with its skills", () => {
    const ryugiIds = getRyugiList().map((ryugi) => ryugi.id);
    assert.doesNotThrow(() => assertRyugiSkillsJson(generated, ryugiIds));

    const detail = getRyugiDetail("kenkaya");
    assert.equal(detail?.ryugi.id, "kenkaya");
    assert.ok(detail?.skills.basic.length);
    assert.equal(getRyugiDetail("unknown"), undefined);
  });
});

function row(category: string, name: string, timing: string): string[] {
  return [
    category,
    name,
    "1",
    timing,
    "",
    "能動",
    "",
    "自身",
    "",
    "",
    "概要\r\n詳細",
    "効果",
  ];
}

async function createFixture() {
  const directory = await mkdtemp(join(tmpdir(), "ryugi-skills-"));
  return {
    input: join(directory, "ryugi-skills.xlsx"),
    output: join(directory, "ryugi-skills.json"),
    async [Symbol.asyncDispose]() {
      await rm(directory, { recursive: true, force: true });
    },
  };
}

async function workbook(
  path: string,
  sheets: Array<{ name: string; rows: string[][] }>,
) {
  const xml = (value: string) => strToU8(value);
  const sheetEntries = sheets.flatMap(({ rows }, index) => {
    const sheet = rows
      .map(
        (row, y) =>
          `<row r="${y + 1}">${row
            .map((value, x) => cell(value, x, y))
            .join("")}</row>`,
      )
      .join("");
    const sheetNumber = index + 1;
    return [
      [
        `xl/worksheets/sheet${sheetNumber}.xml`,
        xml(
          `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheet}</sheetData></worksheet>`,
        ),
      ],
    ] as const;
  });
  await writeFile(
    path,
    zipSync({
      "[Content_Types].xml": xml(
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>${sheets.map((_, index) => `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`).join("")}</Types>`,
      ),
      "_rels/.rels": xml(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
      ),
      "xl/workbook.xml": xml(
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>${sheets.map(({ name }, index) => `<sheet name="${name}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`).join("")}</sheets></workbook>`,
      ),
      "xl/_rels/workbook.xml.rels": xml(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheets.map((_, index) => `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`).join("")}</Relationships>`,
      ),
      ...Object.fromEntries(sheetEntries),
    }),
  );
}

function cell(value: string, column: number, row: number): string {
  if (value === "") return "";
  const coordinate = `${String.fromCharCode(65 + column)}${row + 1}`;
  return `<c r="${coordinate}" t="inlineStr"><is><t>${value.replaceAll("&", "&amp;")}</t></is></c>`;
}

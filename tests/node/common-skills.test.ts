import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";
import { strToU8, zipSync } from "fflate";
import generated from "../../data/generated/common-skills.json";
import { convertSkills } from "../../scripts/convert-skills/lib";
import { getCommonSkills } from "../../src/lib/data/common-skills";
import { assertSkillsJson } from "../../src/lib/schemas/skill";

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
const contract = { dataName: "common-skills", idPrefix: "skill-common" };

describe("skill conversion", () => {
  it("uses generic settings, all attack timings normalize to a, and warnings use A", async () => {
    await using fixture = await createFixture();
    await workbook(fixture.input, "skills", [
      headers,
      row("bonus", "一撃", "○-○"),
      row("bonus", "終撃", "○-☆"),
      row("basic", "常時", "Pv", "", ""),
      row("basic", "反応", "R"),
    ]);
    const warnings: string[] = [];
    const result = await convertSkills({
      ...contract,
      inputPath: fixture.input,
      sheetName: "skills",
      outputPath: fixture.output,
      now: new Date("2026-07-14T00:00:00Z"),
      onWarning: (warning) => warnings.push(warning),
    });
    assert.deepEqual(
      result.data.bonus.map((skill) => skill.id),
      ["skill-common-bonus-a-001", "skill-common-bonus-a-002"],
    );
    assert.equal(result.data.basic[0]?.proficiency, null);
    assert.equal(result.updatedAt, "2026-07-14T09:00:00+09:00");
    assert.match(warnings[0] ?? "", /previous group "Pv".*timing "R"/);
    assert.doesNotThrow(() => assertSkillsJson(result, contract));
    assert.doesNotThrow(() => assertSkillsJson(generated, contract));
    assert.equal(getCommonSkills("bonus")[0]?.id, "skill-common-bonus-a-001");
  });

  it("keeps updatedAt for equal data and rejects invalid timing", async () => {
    await using fixture = await createFixture();
    await workbook(fixture.input, "skills", [
      headers,
      row("bonus", "一撃", "×-○"),
    ]);
    await writeFile(
      fixture.output,
      JSON.stringify({
        dataName: "common-skills",
        updatedAt: "2026-01-01T00:00:00+09:00",
        data: {
          bonus: [
            {
              id: "skill-common-bonus-a-001",
              category: "bonus",
              name: "一撃",
              maxLevel: 1,
              timing: "×-○",
              cost: null,
              proficiency: "能動",
              acquisitionRestriction: null,
              target: "自身",
              range: null,
              usageRestriction: null,
              summary: "概要\n詳細",
              effect: "効果",
              sourceOrder: 1,
            },
          ],
          basic: [],
          advanced: [],
        },
      }),
      "utf8",
    );
    const result = await convertSkills({
      ...contract,
      inputPath: fixture.input,
      sheetName: "skills",
      outputPath: fixture.output,
    });
    assert.equal(result.updatedAt, "2026-01-01T00:00:00+09:00");
    await workbook(fixture.input, "skills", [
      headers,
      row("bonus", "不正", "A-A"),
    ]);
    await assert.rejects(
      () =>
        convertSkills({
          ...contract,
          inputPath: fixture.input,
          sheetName: "skills",
          outputPath: fixture.output,
        }),
      /タイミング is invalid at row 2/,
    );
    assert.equal(
      JSON.parse(await readFile(fixture.output, "utf8")).dataName,
      "common-skills",
    );
  });
});

function row(
  category: string,
  name: string,
  timing: string,
  cost = "",
  proficiency = "能動",
): string[] {
  return [
    category,
    name,
    "1",
    timing,
    cost,
    proficiency,
    "",
    "自身",
    "",
    "",
    "概要\r\n詳細",
    "効果",
  ];
}
async function createFixture() {
  const directory = await mkdtemp(join(tmpdir(), "skills-"));
  return {
    input: join(directory, "skills.xlsx"),
    output: join(directory, "skills.json"),
    async [Symbol.asyncDispose]() {
      await rm(directory, { recursive: true, force: true });
    },
  };
}
async function workbook(path: string, sheetName: string, rows: string[][]) {
  const sheet = rows
    .map(
      (row, y) =>
        `<row r="${y + 1}">${row.map((value, x) => (value === "" ? "" : `<c r="${String.fromCharCode(65 + x)}${y + 1}" t="inlineStr"><is><t>${value.replaceAll("&", "&amp;")}</t></is></c>`)).join("")}</row>`,
    )
    .join("");
  const xml = (value: string) => strToU8(value);
  await writeFile(
    path,
    zipSync({
      "[Content_Types].xml": xml(
        `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`,
      ),
      "_rels/.rels": xml(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`,
      ),
      "xl/workbook.xml": xml(
        `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="${sheetName}" sheetId="1" r:id="rId1"/></sheets></workbook>`,
      ),
      "xl/_rels/workbook.xml.rels": xml(
        `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`,
      ),
      "xl/worksheets/sheet1.xml": xml(
        `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${sheet}</sheetData></worksheet>`,
      ),
    }),
  );
}

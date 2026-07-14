import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { type CellValue, readSheet } from "read-excel-file/node";
import {
  assertSkillsJson,
  SKILL_CATEGORIES,
  SKILL_TIMING_NORMALIZATIONS,
  type Skill,
  type SkillCategory,
  type SkillJsonContract,
  type SkillsByCategory,
  type SkillsJson,
  type SkillTiming,
} from "../../src/lib/schemas/skill";

export interface ConvertSkillsOptions extends SkillJsonContract {
  inputPath: string;
  sheetName: string;
  outputPath: string;
  now?: Date;
  onWarning?: (warning: string) => void;
}

type Rows = Array<Array<CellValue | null>>;
type RawSkill = Omit<Skill, "id"> & { rowNumber: number };

const HEADERS = [
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
] as const;
const GROUPS = [
  ["○-○", "○-×", "○-☆", "×-○", "×-×", "×-☆", "☆-○", "☆-×", "☆-☆"],
  ["R"],
  ["Pv"],
  ["M"],
  ["SU"],
  ["INI"],
  ["CU"],
  ["Aa"],
  ["Ra"],
  ["D"],
  ["SP"],
] as const;
const GROUP_LABELS = [
  "A",
  "R",
  "Pv",
  "M",
  "SU",
  "INI",
  "CU",
  "Aa",
  "Ra",
  "D",
  "SP",
];
const GROUP_ORDER = new Map<SkillTiming, number>(
  GROUPS.flatMap((group, index) =>
    group.map((timing) => [timing, index] as const),
  ),
);

export async function convertSkills(
  options: ConvertSkillsOptions,
): Promise<SkillsJson> {
  const rows = await readSkillsSheet(options.inputPath, options.sheetName);
  assertHeaders(rows);
  const rawSkills = collectRows(rows);
  warnTimingOrder(rawSkills, options.onWarning);
  const data = createSkillsData(rawSkills, options.idPrefix);
  const existing = await readExisting(options.outputPath, options);
  const result: SkillsJson = {
    dataName: options.dataName,
    updatedAt:
      existing && isDeepStrictEqual(existing.data, data)
        ? existing.updatedAt
        : formatDateTimeJst(options.now ?? new Date()),
    data,
  };

  assertSkillsJson(result, options);
  await mkdir(dirname(options.outputPath), { recursive: true });
  await writeFile(options.outputPath, `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

export function createSkillsData(
  rawSkills: RawSkill[],
  idPrefix: string,
): SkillsByCategory {
  const data: SkillsByCategory = { bonus: [], basic: [], advanced: [] };
  const counts = new Map<string, number>();

  for (const rawSkill of rawSkills) {
    const normalized = SKILL_TIMING_NORMALIZATIONS[rawSkill.timing];
    const groupKey = `${rawSkill.category}:${normalized}`;
    const index = (counts.get(groupKey) ?? 0) + 1;
    counts.set(groupKey, index);
    const { rowNumber: _, ...skill } = rawSkill;
    data[skill.category].push({
      ...skill,
      id: `${idPrefix}-${skill.category}-${normalized}-${index
        .toString()
        .padStart(3, "0")}`,
    });
  }

  return data;
}

export function formatDateTimeJst(date: Date): string {
  const jst = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${jst.getUTCFullYear()}-${pad(jst.getUTCMonth() + 1)}-${pad(
    jst.getUTCDate(),
  )}T${pad(jst.getUTCHours())}:${pad(jst.getUTCMinutes())}:${pad(
    jst.getUTCSeconds(),
  )}+09:00`;
}

async function readSkillsSheet(
  inputPath: string,
  sheetName: string,
): Promise<Rows> {
  try {
    return await readSheet(inputPath, sheetName, { trim: false });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Sheet not found")) {
      throw new Error(`Worksheet "${sheetName}" was not found.`);
    }
    throw error;
  }
}

function assertHeaders(rows: Rows): void {
  const actual = (rows[0] ?? []).map((value) => text(value));
  if (!isDeepStrictEqual(actual, [...HEADERS])) {
    throw new Error(
      `Invalid skill headers. Expected "${HEADERS.join(" / ")}".`,
    );
  }
}

function collectRows(rows: Rows): RawSkill[] {
  const skills: RawSkill[] = [];
  let foundBlank = false;
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const rowNumber = rowIndex + 1;
    const row = rows[rowIndex] ?? [];
    if (row.slice(HEADERS.length).some((value) => !blank(value))) {
      throw new Error(
        `Unexpected value after ${HEADERS.length} columns at row ${rowNumber}.`,
      );
    }
    const values = HEADERS.map((_, index) => row[index]);
    if (values.every(blank)) {
      foundBlank = true;
      continue;
    }
    if (foundBlank) {
      throw new Error(`Blank row found before data row ${rowNumber}.`);
    }
    skills.push({
      category: category(values[0], rowNumber),
      name: requiredOneLine(values[1], "名称", rowNumber),
      maxLevel: maxLevel(values[2], rowNumber),
      timing: timing(values[3], rowNumber),
      cost: optionalOneLine(values[4], "コスト", rowNumber),
      proficiency: optionalOneLine(values[5], "技能", rowNumber),
      acquisitionRestriction: optionalOneLine(values[6], "取得制限", rowNumber),
      target: requiredOneLine(values[7], "対象", rowNumber),
      range: optionalOneLine(values[8], "射程", rowNumber),
      usageRestriction: optionalOneLine(values[9], "使用制限", rowNumber),
      summary: requiredMultiline(values[10], "概要", rowNumber),
      effect: requiredMultiline(values[11], "効果", rowNumber),
      sourceOrder: rowIndex,
      rowNumber,
    });
  }
  return skills;
}

function warnTimingOrder(
  skills: RawSkill[],
  onWarning: ConvertSkillsOptions["onWarning"],
): void {
  if (!onWarning) return;
  const highest = new Map<SkillCategory, number>();
  for (const skill of skills) {
    const group = GROUP_ORDER.get(skill.timing);
    if (group === undefined) continue;
    const previous = highest.get(skill.category);
    if (previous !== undefined && group < previous) {
      onWarning(
        `Timing order warning: category "${skill.category}", row ${skill.rowNumber}, skill "${skill.name}", previous group "${GROUP_LABELS[previous]}", timing "${skill.timing}", expected order "${GROUP_LABELS.join(" → ")}".`,
      );
    }
    highest.set(skill.category, Math.max(previous ?? group, group));
  }
}

async function readExisting(
  outputPath: string,
  contract: SkillJsonContract,
): Promise<SkillsJson | undefined> {
  try {
    const source = await readFile(outputPath, "utf8");
    const value: unknown = JSON.parse(source);
    assertSkillsJson(value, contract);
    return value;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return undefined;
    throw error;
  }
}

function category(
  value: CellValue | null | undefined,
  row: number,
): SkillCategory {
  const result = requiredOneLine(value, "区分", row);
  if (!SKILL_CATEGORIES.includes(result as SkillCategory)) {
    throw new Error(`区分 is invalid at row ${row}: "${result}".`);
  }
  return result as SkillCategory;
}

function timing(value: CellValue | null | undefined, row: number): SkillTiming {
  const result = requiredOneLine(value, "タイミング", row);
  if (!(result in SKILL_TIMING_NORMALIZATIONS)) {
    throw new Error(`タイミング is invalid at row ${row}: "${result}".`);
  }
  return result as SkillTiming;
}

function maxLevel(value: CellValue | null | undefined, row: number): number {
  if (typeof value === "number" && Number.isInteger(value) && value > 0)
    return value;
  const result = text(value).trim();
  if (/^[1-9][0-9]*$/.test(result)) return Number(result);
  throw new Error(`最大レベル must be a positive integer at row ${row}.`);
}

function requiredOneLine(
  value: CellValue | null | undefined,
  label: string,
  row: number,
): string {
  const result = text(value).trim();
  if (result === "") throw new Error(`${label} is required at row ${row}.`);
  if (result.includes("\n"))
    throw new Error(`${label} must not contain line breaks at row ${row}.`);
  return result;
}

function optionalOneLine(
  value: CellValue | null | undefined,
  label: string,
  row: number,
): string | null {
  const result = text(value).trim();
  if (result === "") return null;
  if (result.includes("\n"))
    throw new Error(`${label} must not contain line breaks at row ${row}.`);
  return result;
}

function requiredMultiline(
  value: CellValue | null | undefined,
  label: string,
  row: number,
): string {
  const result = text(value).trim();
  if (result === "") throw new Error(`${label} is required at row ${row}.`);
  return result;
}

function text(value: CellValue | null | undefined): string {
  return value === null || value === undefined
    ? ""
    : String(value).replace(/\r\n?/g, "\n");
}
function blank(value: CellValue | null | undefined): boolean {
  return text(value).trim() === "";
}
function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

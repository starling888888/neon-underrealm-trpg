import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { type CellValue, readSheet } from "read-excel-file/node";
import {
  assertSkillsJson,
  getSkillTimingParts,
  normalizeSkillTiming,
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

export interface ConvertSkillSheetOptions {
  idPrefix: string;
  sheetName: string;
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
  const data = convertSkillSheet(rows, options);
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

export function convertSkillSheet(
  rows: Rows,
  options: ConvertSkillSheetOptions,
): SkillsByCategory {
  assertHeaders(rows);
  const rawSkills = collectRows(rows);
  warnTimingOrder(rawSkills, options);
  return createSkillsData(rawSkills, options.idPrefix);
}

export function createSkillsData(
  rawSkills: RawSkill[],
  idPrefix: string,
): SkillsByCategory {
  const data: SkillsByCategory = { bonus: [], basic: [], advanced: [] };
  const counts = new Map<string, number>();

  for (const rawSkill of rawSkills) {
    const normalized = normalizeSkillTiming(rawSkill.timing);
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
  while (actual.at(-1) === "") actual.pop();
  const length = Math.max(actual.length, HEADERS.length);
  for (let index = 0; index < length; index += 1) {
    const expected = HEADERS[index];
    const value = actual[index] ?? "";
    if (expected === undefined) {
      throw new Error(
        `Unexpected header at row 1, column ${columnLetter(index)}: "${value}".`,
      );
    }
    if (value !== expected) {
      throw new Error(
        `Invalid header at row 1, column ${columnLetter(index)}: expected "${expected}", received "${value}".`,
      );
    }
  }
}

function collectRows(rows: Rows): RawSkill[] {
  const skills: RawSkill[] = [];
  let foundBlank = false;
  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const rowNumber = rowIndex + 1;
    const row = rows[rowIndex] ?? [];
    const extraIndex = row
      .slice(HEADERS.length)
      .findIndex((value) => !blank(value));
    if (extraIndex !== -1) {
      const column = HEADERS.length + extraIndex;
      throw new Error(
        `Unexpected value at row ${rowNumber}, column ${columnLetter(column)}: "${text(row[column])}".`,
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
      category: category(values[0], rowNumber, 0),
      name: requiredMultiline(values[1], "名称", rowNumber, 1),
      maxLevel: maxLevel(values[2], rowNumber, 2),
      timing: timing(values[3], rowNumber, 3),
      cost: optionalOneLine(values[4], "コスト", rowNumber, 4),
      proficiency: optionalOneLine(values[5], "技能", rowNumber, 5),
      acquisitionRestriction: optionalOneLine(
        values[6],
        "取得制限",
        rowNumber,
        6,
      ),
      target: optionalOneLine(values[7], "対象", rowNumber, 7),
      range: optionalOneLine(values[8], "射程", rowNumber, 8),
      usageRestriction: optionalOneLine(values[9], "使用制限", rowNumber, 9),
      summary: optionalMultiline(values[10]),
      effect: requiredMultiline(values[11], "効果", rowNumber, 11),
      sourceOrder: rowIndex,
      rowNumber,
    });
  }
  return skills;
}

function warnTimingOrder(
  skills: RawSkill[],
  options: ConvertSkillSheetOptions,
): void {
  const { onWarning } = options;
  if (!onWarning) return;
  const highest = new Map<SkillCategory, number>();
  for (const skill of skills) {
    const groups = getSkillTimingParts(skill.timing).map((timing) => {
      const group = GROUP_ORDER.get(timing);
      if (group === undefined) {
        throw new Error(`Timing group is not configured for "${timing}".`);
      }
      return group;
    });
    const group = Math.min(...groups);
    const previous = highest.get(skill.category);
    if (previous !== undefined && group < previous) {
      onWarning(
        `Timing order warning: sheet "${options.sheetName}", category "${skill.category}", row ${skill.rowNumber}, skill "${skill.name}", previous group "${GROUP_LABELS[previous]}", timing "${skill.timing}", expected order "${GROUP_LABELS.join(" → ")}".`,
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
  column: number,
): SkillCategory {
  const result = requiredOneLine(value, "区分", row, column);
  if (!SKILL_CATEGORIES.includes(result as SkillCategory)) {
    throw new Error(
      `区分 is invalid at ${cellLocation(row, column)}: "${result}".`,
    );
  }
  return result as SkillCategory;
}

function timing(
  value: CellValue | null | undefined,
  row: number,
  column: number,
): SkillTiming {
  const result = requiredOneLine(value, "タイミング", row, column);
  const parts = result.split("/").map((part) => part.trim());
  const normalized = parts.join("/");
  if (
    parts.some((part) => !(part in SKILL_TIMING_NORMALIZATIONS)) ||
    new Set(parts).size !== parts.length
  ) {
    throw new Error(
      `タイミング is invalid at ${cellLocation(row, column)}: "${result}".`,
    );
  }
  return normalized as SkillTiming;
}

function maxLevel(
  value: CellValue | null | undefined,
  row: number,
  column: number,
): number {
  if (typeof value === "number" && Number.isInteger(value) && value > 0)
    return value;
  const result = text(value).trim();
  if (/^[1-9][0-9]*$/.test(result)) return Number(result);
  throw new Error(
    `最大レベル must be a positive integer at ${cellLocation(row, column)}.`,
  );
}

function requiredOneLine(
  value: CellValue | null | undefined,
  label: string,
  row: number,
  column: number,
): string {
  const result = text(value).trim();
  if (result === "") {
    throw new Error(`${label} is required at ${cellLocation(row, column)}.`);
  }
  if (result.includes("\n"))
    throw new Error(
      `${label} must not contain line breaks at ${cellLocation(row, column)}.`,
    );
  return result;
}

function optionalOneLine(
  value: CellValue | null | undefined,
  label: string,
  row: number,
  column: number,
): string | null {
  const result = text(value).trim();
  if (result === "") return null;
  if (result.includes("\n"))
    throw new Error(
      `${label} must not contain line breaks at ${cellLocation(row, column)}.`,
    );
  return result;
}

function requiredMultiline(
  value: CellValue | null | undefined,
  label: string,
  row: number,
  column: number,
): string {
  const result = text(value).trim();
  if (result === "") {
    throw new Error(`${label} is required at ${cellLocation(row, column)}.`);
  }
  return result;
}

function optionalMultiline(value: CellValue | null | undefined): string {
  return text(value).trim();
}

function cellLocation(row: number, column: number): string {
  return `row ${row}, column ${columnLetter(column)}`;
}

function columnLetter(index: number): string {
  let value = index + 1;
  let result = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    result = String.fromCharCode(65 + remainder) + result;
    value = Math.floor((value - 1) / 26);
  }
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

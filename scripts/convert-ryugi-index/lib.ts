import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { type CellValue, readSheet } from "read-excel-file/node";
import {
  assertRyugiJson,
  RYUGI_LIST_DATA_NAME,
  type Ryugi,
  type RyugiJson,
  type RyugiNote,
  type RyugiNoteType,
} from "../../src/lib/schemas/ryugi";
import { formatDateTimeJst } from "../convert-skills/lib";

export interface ConvertRyugiListOptions {
  inputPath: string;
  outputPath: string;
  sheetName: string;
  now?: Date;
}

type Rows = Array<Array<CellValue | null>>;
type Field = (typeof FIELDS)[number];

const GROUP_HEADERS = [
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
] as const;
const FIELDS = [
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
] as const;
const NOTE_TYPES = new Set<RyugiNoteType>([
  "note",
  "tip",
  "warning",
  "danger",
  "example",
  "version",
]);

export async function convertRyugiList(
  options: ConvertRyugiListOptions,
): Promise<RyugiJson> {
  const rows = await readRyugiSheet(options.inputPath, options.sheetName);
  assertHeaderRow(rows[0], GROUP_HEADERS, 1);
  assertHeaderRow(rows[1], FIELDS, 2);
  const data = collectRyugi(rows);
  const existing = await readExisting(options.outputPath);
  const result: RyugiJson = {
    dataName: RYUGI_LIST_DATA_NAME,
    updatedAt:
      existing && isDeepStrictEqual(existing.data, data)
        ? existing.updatedAt
        : formatDateTimeJst(options.now ?? new Date()),
    data,
  };

  assertRyugiJson(result);
  await mkdir(dirname(options.outputPath), { recursive: true });
  await writeFile(options.outputPath, `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

async function readRyugiSheet(
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

function assertHeaderRow(
  row: Array<CellValue | null> | undefined,
  expected: readonly string[],
  rowNumber: number,
): void {
  const actual = (row ?? []).map((value) => text(value));
  while (actual.at(-1) === "") actual.pop();
  const length = Math.max(actual.length, expected.length);
  for (let index = 0; index < length; index += 1) {
    const received = actual[index] ?? "";
    const header = expected[index];
    if (header === undefined) {
      throw new Error(
        `Unexpected header at row ${rowNumber}, column ${columnLetter(index)}: "${received}".`,
      );
    }
    if (received !== header) {
      throw new Error(
        `Invalid header at row ${rowNumber}, column ${columnLetter(index)}: expected "${header}", received "${received}".`,
      );
    }
  }
}

function collectRyugi(rows: Rows): Ryugi[] {
  const data: Ryugi[] = [];
  let foundBlank = false;
  const ids = new Set<string>();
  for (let rowIndex = 2; rowIndex < rows.length; rowIndex += 1) {
    const rowNumber = rowIndex + 1;
    const row = rows[rowIndex] ?? [];
    assertNoExtraValues(row, rowNumber);
    const values = FIELDS.map((_, index) => row[index]);
    if (values.every(blank)) {
      foundBlank = true;
      continue;
    }
    if (foundBlank)
      throw new Error(`Blank row found before data row ${rowNumber}.`);

    const id = requiredOneLine(values[0], "ID", rowNumber, 0);
    if (!/^[a-z][a-z0-9-]*$/.test(id)) {
      throw new Error(`ID is invalid at ${location(rowNumber, 0)}: "${id}".`);
    }
    if (ids.has(id)) {
      throw new Error(`Duplicate ID at ${location(rowNumber, 0)}: "${id}".`);
    }
    ids.add(id);
    data.push({
      id,
      name: requiredOneLine(values[1], "名称", rowNumber, 1),
      shortDescription: requiredOneLine(values[2], "短い説明", rowNumber, 2),
      description: requiredText(values[3], "説明", rowNumber, 3),
      note: note(values, rowNumber),
      healthIncrease: positiveInteger(values[6], "体力増加値", rowNumber, 6),
      mindIncrease: positiveInteger(values[7], "精神力増加値", rowNumber, 7),
      baseAttributes: {
        strength: positiveInteger(values[8], "筋力", rowNumber, 8),
        agility: positiveInteger(values[9], "敏捷", rowNumber, 9),
        perception: positiveInteger(values[10], "感覚", rowNumber, 10),
        body: positiveInteger(values[11], "肉体", rowNumber, 11),
        mind: positiveInteger(values[12], "精神", rowNumber, 12),
      },
      commonSkillBonuses: {
        level2: requiredText(values[13], "2lv", rowNumber, 13),
        level5: requiredText(values[14], "5lv", rowNumber, 14),
        level9: requiredText(values[15], "9lv", rowNumber, 15),
      },
      sourceOrder: data.length + 1,
    });
  }
  return data;
}

function assertNoExtraValues(
  row: Array<CellValue | null>,
  rowNumber: number,
): void {
  const extraIndex = row
    .slice(FIELDS.length)
    .findIndex((value) => !blank(value));
  if (extraIndex === -1) return;
  const column = FIELDS.length + extraIndex;
  throw new Error(
    `Unexpected value at row ${rowNumber}, column ${columnLetter(column)}: "${text(row[column])}".`,
  );
}

function note(
  values: Array<CellValue | null | undefined>,
  row: number,
): RyugiNote | null {
  const type = text(values[4]).trim();
  const content = text(values[5]).trim();
  if (type === "" && content === "") return null;
  if (type === "" || content === "") {
    const column = type === "" ? 4 : 5;
    throw new Error(
      `補足タイプ and 補足本文 must both be set at ${location(row, column)}.`,
    );
  }
  if (hasLineBreak(type)) {
    throw new Error(
      `補足タイプ must not contain line breaks at ${location(row, 4)}.`,
    );
  }
  if (!NOTE_TYPES.has(type as RyugiNoteType)) {
    throw new Error(`補足タイプ is invalid at ${location(row, 4)}: "${type}".`);
  }
  return { type: type as RyugiNoteType, content };
}

function requiredOneLine(
  value: CellValue | null | undefined,
  label: Field,
  row: number,
  column: number,
): string {
  const result = text(value).trim();
  if (result === "")
    throw new Error(`${label} is required at ${location(row, column)}.`);
  if (hasLineBreak(result)) {
    throw new Error(
      `${label} must not contain line breaks at ${location(row, column)}.`,
    );
  }
  return result;
}

function requiredText(
  value: CellValue | null | undefined,
  label: Field,
  row: number,
  column: number,
): string {
  const result = text(value).trim();
  if (result === "")
    throw new Error(`${label} is required at ${location(row, column)}.`);
  return result;
}

function positiveInteger(
  value: CellValue | null | undefined,
  label: Field,
  row: number,
  column: number,
): number {
  if (typeof value === "number" && Number.isInteger(value) && value > 0) {
    return value;
  }
  throw new Error(
    `${label} must be a positive integer at ${location(row, column)}.`,
  );
}

async function readExisting(
  outputPath: string,
): Promise<RyugiJson | undefined> {
  try {
    const value: unknown = JSON.parse(await readFile(outputPath, "utf8"));
    assertRyugiJson(value);
    return value;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return undefined;
    throw error;
  }
}

function text(value: CellValue | null | undefined): string {
  return value === null || value === undefined
    ? ""
    : String(value).replace(/\r\n?/g, "\n");
}

function blank(value: CellValue | null | undefined): boolean {
  return text(value).trim() === "";
}

function hasLineBreak(value: string): boolean {
  return value.includes("\n") || value.includes("\r");
}

function location(row: number, column: number): string {
  return `row ${row}, column ${columnLetter(column)} (${FIELDS[column]})`;
}

function columnLetter(index: number): string {
  return String.fromCharCode(65 + index);
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { type CellValue, readSheet } from "read-excel-file/node";
import {
  assertIkizamaExclusiveItem,
  assertIkizamaJson,
  assertIkizamaJsonShape,
  IKIZAMA_DATA_NAME,
  type Ikizama,
  type IkizamaJson,
  type IkizamaNote,
  type IkizamaNoteType,
} from "../../src/lib/schemas/ikizama";
import { formatDateTimeJst } from "../convert-skills/write-generated-json";

export interface ConvertIkizamaOptions {
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
] as const;
const FIELDS = [
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
] as const;
const NOTE_TYPES = new Set<IkizamaNoteType>([
  "note",
  "tip",
  "warning",
  "danger",
  "example",
  "version",
]);

export async function convertIkizama(
  options: ConvertIkizamaOptions,
): Promise<IkizamaJson> {
  const rows = await readIkizamaSheet(options.inputPath, options.sheetName);
  assertHeaderRow(rows[0], GROUP_HEADERS, 1);
  assertHeaderRow(rows[1], FIELDS, 2);
  const data = collectIkizama(rows);
  const existing = await readExisting(options.outputPath);
  if (existing) assertExistingIdentity(existing.data, data);
  const result: IkizamaJson = {
    dataName: IKIZAMA_DATA_NAME,
    updatedAt:
      existing && isDeepStrictEqual(existing.data, data)
        ? existing.updatedAt
        : formatDateTimeJst(options.now ?? new Date()),
    data,
  };

  assertIkizamaJson(result);
  await mkdir(dirname(options.outputPath), { recursive: true });
  await writeFile(options.outputPath, serializeIkizamaJson(result));
  return result;
}

async function readIkizamaSheet(
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

function collectIkizama(rows: Rows): Ikizama[] {
  const data: Ikizama[] = [];
  let blankRowNumber: number | undefined;
  const ids = new Set<string>();
  const names = new Set<string>();
  for (let rowIndex = 2; rowIndex < rows.length; rowIndex += 1) {
    const rowNumber = rowIndex + 1;
    const row = rows[rowIndex] ?? [];
    assertNoExtraValues(row, rowNumber);
    const values = FIELDS.map((_, index) => row[index]);
    if (values.every(blank)) {
      blankRowNumber ??= rowNumber;
      continue;
    }
    if (blankRowNumber !== undefined) {
      throw new Error(
        `Blank row found at ${location(blankRowNumber, 0)} before data row ${rowNumber}.`,
      );
    }

    const id = requiredOneLine(values[0], "ID", rowNumber, 0);
    if (!/^[a-z][a-z0-9-]*$/.test(id)) {
      throw new Error(`ID is invalid at ${location(rowNumber, 0)}: "${id}".`);
    }
    if (ids.has(id)) {
      throw new Error(`Duplicate ID at ${location(rowNumber, 0)}: "${id}".`);
    }
    const name = requiredOneLine(values[1], "名称", rowNumber, 1);
    if (names.has(name)) {
      throw new Error(
        `Duplicate 名称 at ${location(rowNumber, 1)}: "${name}".`,
      );
    }
    ids.add(id);
    names.add(name);
    data.push({
      id,
      name,
      shortDescription: requiredOneLine(values[2], "短い説明", rowNumber, 2),
      description: requiredText(values[3], "説明", rowNumber, 3),
      exclusiveItem: exclusiveItem(values, rowNumber),
      note: note(values, rowNumber),
      secondaryAttributeCoefficients: {
        level1: coefficient(values, rowNumber, 8),
        level4: coefficient(values, rowNumber, 10),
        level10: coefficient(values, rowNumber, 12),
      },
      attributePoints: attributePoints(values[14], rowNumber),
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
): IkizamaNote | null {
  const type = text(values[6]).trim();
  const content = text(values[7]).trim();
  if (type === "" && content === "") return null;
  if (type === "" || content === "") {
    const column = type === "" ? 6 : 7;
    throw new Error(
      `補足タイプ and 補足本文 must both be set at ${location(row, column)}.`,
    );
  }
  if (hasLineBreak(type)) {
    throw new Error(
      `補足タイプ must not contain line breaks at ${location(row, 6)}.`,
    );
  }
  if (!NOTE_TYPES.has(type as IkizamaNoteType)) {
    throw new Error(`補足タイプ is invalid at ${location(row, 6)}: "${type}".`);
  }
  return { type: type as IkizamaNoteType, content };
}

function exclusiveItem(
  values: Array<CellValue | null | undefined>,
  row: number,
): Ikizama["exclusiveItem"] {
  const id = requiredOneLine(values[4], "専用アイテムID", row, 4);
  const name = requiredOneLine(values[5], "専用アイテム名称", row, 5);
  try {
    assertIkizamaExclusiveItem(id, name);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(
      `専用アイテムIDと専用アイテム名称 are invalid at ${location(row, 4)}: ${message}`,
    );
  }
  return { id, name };
}

function coefficient(
  values: Array<CellValue | null | undefined>,
  row: number,
  column: number,
) {
  return {
    health: positiveInteger(values[column], FIELDS[column], row, column),
    mind: positiveInteger(
      values[column + 1],
      FIELDS[column + 1],
      row,
      column + 1,
    ),
  };
}

function attributePoints(
  value: CellValue | null | undefined,
  row: number,
): [number, number, number, number] {
  const input = requiredOneLine(value, "能力値ポイント", row, 14);
  const values = input.split(",").map((point) => point.trim());
  if (
    values.length !== 4 ||
    values.some((point) => !/^[1-9]\d*$/.test(point))
  ) {
    throw new Error(
      `能力値ポイント must contain four positive integers at ${location(row, 14)}.`,
    );
  }
  return values.map(Number) as [number, number, number, number];
}

function requiredOneLine(
  value: CellValue | null | undefined,
  label: Field,
  row: number,
  column: number,
): string {
  const result = text(value).trim();
  if (result === "") {
    throw new Error(`${label} is required at ${location(row, column)}.`);
  }
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
  if (result === "") {
    throw new Error(`${label} is required at ${location(row, column)}.`);
  }
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
): Promise<IkizamaJson | undefined> {
  try {
    const value: unknown = JSON.parse(await readFile(outputPath, "utf8"));
    assertIkizamaJsonShape(value);
    return value;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return undefined;
    throw error;
  }
}

function assertExistingIdentity(existing: Ikizama[], next: Ikizama[]): void {
  const nextById = new Map(next.map((ikizama) => [ikizama.id, ikizama]));
  const nextByName = new Map(next.map((ikizama) => [ikizama.name, ikizama]));

  for (const ikizama of existing) {
    const matchingName = nextByName.get(ikizama.name);
    if (matchingName && matchingName.id !== ikizama.id) {
      throw new Error(
        `Existing ikizama "${ikizama.name}" ID must not change from "${ikizama.id}" to "${matchingName.id}".`,
      );
    }
    const matchingId = nextById.get(ikizama.id);
    if (!matchingId) {
      throw new Error(
        `Existing ikizama ID "${ikizama.id}" must not be removed.`,
      );
    }
    if (matchingId.name !== ikizama.name) {
      throw new Error(
        `Existing ikizama name for ID "${ikizama.id}" must not change from "${ikizama.name}" to "${matchingId.name}".`,
      );
    }
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

function serializeIkizamaJson(value: IkizamaJson): string {
  return `${JSON.stringify(value, null, 2).replace(
    /"attributePoints": \[\n\s+(\d+),\n\s+(\d+),\n\s+(\d+),\n\s+(\d+)\n\s+\]/g,
    '"attributePoints": [$1, $2, $3, $4]',
  )}\n`;
}

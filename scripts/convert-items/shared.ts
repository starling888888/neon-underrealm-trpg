import { type CellValue, readSheet } from "read-excel-file/node";

export type ItemRows = Array<Array<CellValue | null>>;

export interface ItemSheetRow {
  row: Array<CellValue | null | undefined>;
  rowNumber: number;
  sourceOrder: number;
}

export async function readItemSheet(
  inputPath: string,
  sheetName: string,
): Promise<ItemRows> {
  try {
    return await readSheet(inputPath, sheetName, { trim: false });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Sheet not found")) {
      throw new Error(`Worksheet "${sheetName}" was not found.`);
    }
    throw error;
  }
}

export function collectItemSheetRows({
  rows,
  headers,
  nameColumn,
}: {
  rows: ItemRows;
  headers: readonly string[];
  nameColumn: number;
}): ItemSheetRow[] {
  assertHeaders(rows, headers);
  const result: ItemSheetRow[] = [];
  let foundBlank = false;

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const source = rows[rowIndex] ?? [];
    assertNoExtraCells(source, headers.length, rowIndex + 1);
    const row = headers.map((_, index) => source[index]);
    const rowNumber = rowIndex + 1;
    const name = row[nameColumn];

    if (isBlank(name)) {
      if (row.every(isBlank)) {
        foundBlank = true;
        continue;
      }
      throw new Error(
        `名称 is required at ${cellLocation(rowNumber, nameColumn)}.`,
      );
    }
    if (foundBlank) {
      throw new Error(`Blank row found before data row ${rowNumber}.`);
    }
    result.push({ row, rowNumber, sourceOrder: result.length + 1 });
  }

  return result;
}

export function requiredText(
  value: CellValue | null | undefined,
  label: string,
  row: number,
  column: number,
): string {
  if (typeof value !== "string") {
    if (isBlank(value)) {
      throw new Error(`${label} is required at ${cellLocation(row, column)}.`);
    }
    throw new Error(`${label} must be text at ${cellLocation(row, column)}.`);
  }
  const result = normalizeText(value);
  assertNotDash(result, label, row, column);
  if (result === "") {
    throw new Error(`${label} is required at ${cellLocation(row, column)}.`);
  }
  return result;
}

export function optionalText(
  value: CellValue | null | undefined,
  label: string,
  row: number,
  column: number,
): string | null {
  if (isBlank(value)) return null;
  if (typeof value !== "string") {
    throw new Error(`${label} must be text at ${cellLocation(row, column)}.`);
  }
  const result = normalizeText(value);
  assertNotDash(result, label, row, column);
  return result === "" ? null : result;
}

export function requiredNonNegativeInteger(
  value: CellValue | null | undefined,
  label: string,
  row: number,
  column: number,
): number {
  if (isBlank(value)) {
    throw new Error(`${label} is required at ${cellLocation(row, column)}.`);
  }
  return nonNegativeInteger(value, label, row, column);
}

export function optionalNonNegativeInteger(
  value: CellValue | null | undefined,
  label: string,
  row: number,
  column: number,
): number | null {
  if (isBlank(value)) return null;
  return nonNegativeInteger(value, label, row, column);
}

export function cellLocation(row: number, column: number): string {
  return `row ${row}, column ${columnLetter(column)}`;
}

function assertHeaders(rows: ItemRows, headers: readonly string[]): void {
  const actual = (rows[0] ?? []).map((value) => cellText(value));
  while (actual.at(-1) === "") actual.pop();
  const length = Math.max(actual.length, headers.length);
  for (let index = 0; index < length; index += 1) {
    const expected = headers[index];
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

function assertNoExtraCells(
  row: Array<CellValue | null>,
  length: number,
  rowNumber: number,
): void {
  const extraIndex = row.slice(length).findIndex((value) => !isBlank(value));
  if (extraIndex !== -1) {
    const column = length + extraIndex;
    throw new Error(
      `Unexpected value at ${cellLocation(rowNumber, column)}: "${cellText(row[column])}".`,
    );
  }
}

function nonNegativeInteger(
  value: CellValue | null | undefined,
  label: string,
  row: number,
  column: number,
): number {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    const text = cellText(value).trim();
    assertNotDash(text, label, row, column);
    throw new Error(
      `${label} must be a non-negative integer at ${cellLocation(row, column)}.`,
    );
  }
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(
      `${label} must be a non-negative integer at ${cellLocation(row, column)}.`,
    );
  }
  return value;
}

function assertNotDash(
  value: string,
  label: string,
  row: number,
  column: number,
): void {
  if (value === "-") {
    throw new Error(
      `${label} must not use "-" at ${cellLocation(row, column)}.`,
    );
  }
}

function normalizeText(value: string): string {
  return value.replace(/\r\n?/g, "\n").trim();
}

function isBlank(value: CellValue | null | undefined): boolean {
  return cellText(value).trim() === "";
}

function cellText(value: CellValue | null | undefined): string {
  return value === null || value === undefined
    ? ""
    : String(value).replace(/\r\n?/g, "\n");
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

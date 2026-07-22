import { readFile } from "node:fs/promises";
import { type CellValue, readSheet } from "read-excel-file/node";
import {
  assertNpcJson,
  NPC_DATA_NAME,
  type Npc,
  type NpcJson,
} from "../../src/lib/schemas/npcs";
import { writeGeneratedJson } from "../convert-skills/write-generated-json";

export interface ConvertNpcsOptions {
  inputPath: string;
  outputPath: string;
  sheetName: string;
  now?: Date;
}

const FIELDS = [
  "グループ",
  "ID",
  "名前",
  "二つ名",
  "ルビ",
  "セリフ",
  "説明",
] as const;
type Field = (typeof FIELDS)[number];
type Rows = Array<Array<CellValue | null>>;

export async function convertNpcs(
  options: ConvertNpcsOptions,
): Promise<NpcJson> {
  const rows = await readNpcSheet(options.inputPath, options.sheetName);
  assertHeaderRow(rows[0]);
  const data = collectNpcs(rows);
  const existing = await readExisting(options.outputPath);
  if (existing) assertExistingIdentity(existing.data, data);
  return writeGeneratedJson({
    outputPath: options.outputPath,
    dataName: NPC_DATA_NAME,
    data,
    assertJson: assertNpcJson,
    now: options.now,
  });
}

async function readNpcSheet(
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

function assertHeaderRow(row: Array<CellValue | null> | undefined): void {
  const actual = (row ?? []).map((value) => text(value));
  while (actual.at(-1) === "") actual.pop();
  const length = Math.max(actual.length, FIELDS.length);
  for (let index = 0; index < length; index += 1) {
    const received = actual[index] ?? "";
    const header = FIELDS[index];
    if (header === undefined) {
      throw new Error(
        `Unexpected header at row 1, column ${columnLetter(index)}: "${received}".`,
      );
    }
    if (received !== header) {
      throw new Error(
        `Invalid header at row 1, column ${columnLetter(index)}: expected "${header}", received "${received}".`,
      );
    }
  }
}

function collectNpcs(rows: Rows): Npc[] {
  const data: Npc[] = [];
  const ids = new Set<string>();
  const names = new Set<string>();
  const completedGroups = new Set<string>();
  let blankRowNumber: number | undefined;
  let previousGroup: string | undefined;

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
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

    const group = requiredOneLine(values[0], "グループ", rowNumber, 0);
    if (previousGroup !== undefined && group !== previousGroup) {
      completedGroups.add(previousGroup);
    }
    if (completedGroups.has(group)) {
      throw new Error(
        `Group "${group}" must be contiguous at ${location(rowNumber, 0)}.`,
      );
    }
    previousGroup = group;

    const id = requiredOneLine(values[1], "ID", rowNumber, 1);
    if (!/^[a-z][a-z0-9_]*$/.test(id)) {
      throw new Error(`ID is invalid at ${location(rowNumber, 1)}: "${id}".`);
    }
    if (ids.has(id)) {
      throw new Error(`Duplicate ID at ${location(rowNumber, 1)}: "${id}".`);
    }
    const name = requiredOneLine(values[2], "名前", rowNumber, 2);
    if (names.has(name)) {
      throw new Error(
        `Duplicate 名前 at ${location(rowNumber, 2)}: "${name}".`,
      );
    }
    ids.add(id);
    names.add(name);
    data.push({
      group,
      id,
      name,
      epithet: epithet(values, rowNumber),
      quote: requiredOneLine(values[5], "セリフ", rowNumber, 5),
      description: requiredText(values[6], "説明", rowNumber, 6),
      sourceOrder: data.length + 1,
    });
  }
  return data;
}

function epithet(
  values: Array<CellValue | null | undefined>,
  row: number,
): Npc["epithet"] {
  const textValue = optionalOneLine(values[3], "二つ名", row, 3);
  const reading = optionalOneLine(values[4], "ルビ", row, 4);
  if (textValue === "" && reading === "") return null;
  if (textValue === "" || reading === "") {
    const column = textValue === "" ? 3 : 4;
    throw new Error(
      `二つ名 and ルビ must both be set at ${location(row, column)}.`,
    );
  }
  return { text: textValue, reading };
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
    `Unexpected value at ${location(rowNumber, column)}: "${text(row[column])}".`,
  );
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

function optionalOneLine(
  value: CellValue | null | undefined,
  label: Field,
  row: number,
  column: number,
): string {
  const result = text(value).trim();
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
  const result = text(value)
    .trim()
    .replaceAll("\r\n", "\n")
    .replaceAll("\r", "\n");
  if (result === "") {
    throw new Error(`${label} is required at ${location(row, column)}.`);
  }
  return result;
}

function blank(value: CellValue | null | undefined): boolean {
  return text(value).trim() === "";
}

function text(value: CellValue | null | undefined): string {
  return value === null || value === undefined ? "" : String(value);
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

async function readExisting(outputPath: string): Promise<NpcJson | undefined> {
  try {
    const value: unknown = JSON.parse(await readFile(outputPath, "utf8"));
    assertNpcJson(value);
    return value;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return undefined;
    }
    throw error;
  }
}

function assertExistingIdentity(existing: Npc[], next: Npc[]): void {
  const nextById = new Map(next.map((npc) => [npc.id, npc]));
  const nextByName = new Map(next.map((npc) => [npc.name, npc]));
  for (const npc of existing) {
    const byId = nextById.get(npc.id);
    if (!byId)
      throw new Error(`Existing NPC ID "${npc.id}" must not be removed.`);
    if (byId.name !== npc.name) {
      throw new Error(`Name for ID "${npc.id}" must not change.`);
    }
    const byName = nextByName.get(npc.name);
    if (byName?.id !== npc.id) {
      throw new Error(`ID for name "${npc.name}" must not change.`);
    }
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

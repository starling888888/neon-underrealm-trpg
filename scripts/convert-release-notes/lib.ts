import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { isDeepStrictEqual } from "node:util";
import { type CellValue, readSheet } from "read-excel-file/node";
import { assertReleaseNotesJson } from "../../src/lib/schemas/conversion/release-notes";
import type {
  ReleaseNote,
  ReleaseNotesJson,
} from "../../src/lib/types/release-notes";

export interface ConvertReleaseNotesOptions {
  inputPath: string;
  outputPath: string;
  now?: Date;
}

interface RawReleaseNote {
  date: string;
  summary: string;
  body: string | null;
  sourceOrder: number;
}

type SheetRows = Array<Array<CellValue | null>>;

const SHEET_NAME = "release-notes";
const EXPECTED_HEADERS = ["更新日", "概要", "本文"] as const;
const DATA_NAME = "release-notes";
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const EXCEL_EPOCH_OFFSET_DAYS = 25569;

export async function convertReleaseNotes(
  options: ConvertReleaseNotesOptions,
): Promise<ReleaseNotesJson> {
  const rows = await readReleaseNotesSheet(options.inputPath);
  assertHeaders(rows);

  const rawNotes = collectRows(rows);
  assertInputDateOrder(rawNotes);

  const data = createReleaseNotes(rawNotes);
  const existing = await readExistingReleaseNotes(options.outputPath);
  const updatedAt =
    existing && isDeepStrictEqual(existing.data, data)
      ? existing.updatedAt
      : formatDateTimeJst(options.now ?? new Date());
  const releaseNotesJson: ReleaseNotesJson = {
    dataName: DATA_NAME,
    updatedAt,
    data,
  };

  assertReleaseNotesJson(releaseNotesJson);

  await mkdir(dirname(options.outputPath), { recursive: true });
  await writeFile(
    options.outputPath,
    `${JSON.stringify(releaseNotesJson, null, 2)}\n`,
    "utf8",
  );

  return releaseNotesJson;
}

export function createReleaseNotes(rawNotes: RawReleaseNote[]): ReleaseNote[] {
  const dateCounts = new Map<string, number>();

  return rawNotes
    .map((note) => {
      const count = (dateCounts.get(note.date) ?? 0) + 1;
      dateCounts.set(note.date, count);

      return {
        id: `${note.date}-${count.toString().padStart(3, "0")}`,
        date: note.date,
        summary: note.summary,
        body: note.body,
        sourceOrder: note.sourceOrder,
      };
    })
    .sort((left, right) => {
      if (left.date < right.date) {
        return 1;
      }

      if (left.date > right.date) {
        return -1;
      }

      return right.sourceOrder - left.sourceOrder;
    });
}

export function normalizeLineBreaks(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

export function formatDateTimeJst(date: Date): string {
  const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
  return `${jstDate.getUTCFullYear()}-${pad2(jstDate.getUTCMonth() + 1)}-${pad2(
    jstDate.getUTCDate(),
  )}T${pad2(jstDate.getUTCHours())}:${pad2(
    jstDate.getUTCMinutes(),
  )}:${pad2(jstDate.getUTCSeconds())}+09:00`;
}

async function readReleaseNotesSheet(inputPath: string): Promise<SheetRows> {
  try {
    return await readSheet(inputPath, SHEET_NAME, { trim: false });
  } catch (error) {
    if (error instanceof Error && error.message.includes("Sheet not found")) {
      throw new Error(`Worksheet "${SHEET_NAME}" was not found.`);
    }

    throw error;
  }
}

function assertHeaders(rows: SheetRows): void {
  const headerRow = rows[0] ?? [];
  const actualHeaders = EXPECTED_HEADERS.map((_, index) =>
    normalizeCellText(headerRow[index]),
  );

  if (!isDeepStrictEqual(actualHeaders, [...EXPECTED_HEADERS])) {
    throw new Error(
      `Invalid release notes headers. Expected "${EXPECTED_HEADERS.join(
        " / ",
      )}", got "${actualHeaders.join(" / ")}".`,
    );
  }
}

function collectRows(rows: SheetRows): RawReleaseNote[] {
  const notes: RawReleaseNote[] = [];
  let foundBlankRow = false;

  for (let rowIndex = 1; rowIndex < rows.length; rowIndex += 1) {
    const rowNumber = rowIndex + 1;
    const row = rows[rowIndex] ?? [];
    const rawDate = row[0];
    const rawSummary = row[1];
    const rawBody = row[2];
    const isBlankRow = [rawDate, rawSummary, rawBody].every(isBlankCellValue);

    if (isBlankRow) {
      foundBlankRow = true;
      continue;
    }

    if (foundBlankRow) {
      throw new Error(`Blank row found before data row ${rowNumber}.`);
    }

    const date = normalizeDateCell(rawDate, rowNumber);
    const summary = normalizeRequiredText(rawSummary, "概要", rowNumber);
    if (hasLineBreak(summary)) {
      throw new Error(`概要 must not contain line breaks at row ${rowNumber}.`);
    }

    notes.push({
      date,
      summary,
      body: normalizeOptionalBody(rawBody),
      sourceOrder: rowNumber - 1,
    });
  }

  return notes;
}

function assertInputDateOrder(notes: RawReleaseNote[]): void {
  let previousDate: string | undefined;

  for (const note of notes) {
    if (previousDate && note.date < previousDate) {
      throw new Error(
        `Release note dates must be ascending in source order. Row ${
          note.sourceOrder + 1
        } has "${note.date}" after "${previousDate}".`,
      );
    }

    previousDate = note.date;
  }
}

async function readExistingReleaseNotes(
  outputPath: string,
): Promise<ReleaseNotesJson | undefined> {
  let source: string;

  try {
    source = await readFile(outputPath, "utf8");
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return undefined;
    }

    throw error;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(source);
  } catch (error) {
    throw new Error(`Existing release notes JSON is invalid: ${error}`);
  }

  assertReleaseNotesJson(parsed);
  return parsed;
}

function normalizeDateCell(
  value: CellValue | null | undefined,
  rowNumber: number,
): string {
  if (value instanceof Date) {
    return formatDateOnly(value);
  }

  if (typeof value === "number") {
    return formatDateOnly(
      new Date((value - EXCEL_EPOCH_OFFSET_DAYS) * MS_PER_DAY),
    );
  }

  const text = normalizeCellText(value);
  if (text === "") {
    throw new Error(`更新日 is required at row ${rowNumber}.`);
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(text);
  if (!match) {
    throw new Error(`更新日 must be YYYY-MM-DD at row ${rowNumber}.`);
  }

  const date = `${match[1]}-${match[2]}-${match[3]}`;
  if (!isValidDateString(date)) {
    throw new Error(`更新日 is invalid at row ${rowNumber}.`);
  }

  return date;
}

function normalizeRequiredText(
  value: CellValue | null | undefined,
  label: string,
  rowNumber: number,
): string {
  const text = normalizeCellText(value).trim();

  if (text === "") {
    throw new Error(`${label} is required at row ${rowNumber}.`);
  }

  return text;
}

function normalizeOptionalBody(
  value: CellValue | null | undefined,
): string | null {
  const text = normalizeCellText(value).trim();
  return text === "" ? null : normalizeLineBreaks(text);
}

function normalizeCellText(value: CellValue | null | undefined): string {
  if (value === null || value === undefined) {
    return "";
  }

  return normalizeLineBreaks(String(value));
}

function isBlankCellValue(value: CellValue | null | undefined): boolean {
  return normalizeCellText(value).trim() === "";
}

function formatDateOnly(date: Date): string {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(
    date.getUTCDate(),
  )}`;
}

function isValidDateString(value: string): boolean {
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function hasLineBreak(value: string): boolean {
  return value.includes("\n") || value.includes("\r");
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0");
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

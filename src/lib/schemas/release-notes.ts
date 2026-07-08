export type ReleaseNotesDataName = "release-notes";

export interface ReleaseNote {
  id: string;
  date: string;
  summary: string;
  body: string | null;
  sourceOrder: number;
}

export interface ReleaseNotesJson {
  dataName: ReleaseNotesDataName;
  updatedAt: string;
  data: ReleaseNote[];
}

const DATA_NAME: ReleaseNotesDataName = "release-notes";
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const ID_PATTERN = /^\d{4}-\d{2}-\d{2}-\d{3}$/;
const ISO_DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/;

export function assertReleaseNotesJson(
  value: unknown,
): asserts value is ReleaseNotesJson {
  if (!isRecord(value)) {
    throw new Error("Release notes JSON must be an object.");
  }

  if (value.dataName !== DATA_NAME) {
    throw new Error('Release notes JSON dataName must be "release-notes".');
  }

  if (
    typeof value.updatedAt !== "string" ||
    !ISO_DATE_TIME_PATTERN.test(value.updatedAt)
  ) {
    throw new Error("Release notes JSON updatedAt must be ISO 8601 datetime.");
  }

  if (!Array.isArray(value.data)) {
    throw new Error("Release notes JSON data must be an array.");
  }

  const ids = new Set<string>();
  let previous: ReleaseNote | undefined;

  value.data.forEach((note, index) => {
    assertReleaseNote(note, index);

    if (ids.has(note.id)) {
      throw new Error(`Duplicate release note id "${note.id}".`);
    }
    ids.add(note.id);

    if (previous && compareReleaseNotesForSort(previous, note) > 0) {
      throw new Error(
        "Release notes data must be sorted by date desc and sourceOrder desc.",
      );
    }

    previous = note;
  });
}

export function parseReleaseNotesJson(value: unknown): ReleaseNotesJson {
  assertReleaseNotesJson(value);
  return value;
}

export function getReleaseNoteBody(note: ReleaseNote): string {
  if (note.body === null || note.body.trim() === "") {
    return note.summary;
  }

  return note.body;
}

function assertReleaseNote(
  value: unknown,
  index: number,
): asserts value is ReleaseNote {
  if (!isRecord(value)) {
    throw new Error(`Release note at index ${index} must be an object.`);
  }

  if (typeof value.id !== "string" || !ID_PATTERN.test(value.id)) {
    throw new Error(`Release note at index ${index} has invalid id.`);
  }

  if (typeof value.date !== "string" || !isValidDateString(value.date)) {
    throw new Error(`Release note at index ${index} has invalid date.`);
  }

  if (typeof value.summary !== "string" || value.summary.trim() === "") {
    throw new Error(`Release note at index ${index} has empty summary.`);
  }

  if (hasLineBreak(value.summary)) {
    throw new Error(`Release note at index ${index} summary must be one line.`);
  }

  if (value.body !== null && typeof value.body !== "string") {
    throw new Error(`Release note at index ${index} has invalid body.`);
  }

  if (typeof value.body === "string" && value.body.includes("\r")) {
    throw new Error(
      `Release note at index ${index} body line breaks must be normalized to LF.`,
    );
  }

  if (
    typeof value.sourceOrder !== "number" ||
    !Number.isInteger(value.sourceOrder) ||
    value.sourceOrder <= 0
  ) {
    throw new Error(`Release note at index ${index} has invalid sourceOrder.`);
  }

  const expectedIdPrefix = `${value.date}-`;
  if (!value.id.startsWith(expectedIdPrefix)) {
    throw new Error(
      `Release note at index ${index} id must start with its date.`,
    );
  }
}

function compareReleaseNotesForSort(
  left: ReleaseNote,
  right: ReleaseNote,
): number {
  if (left.date < right.date) {
    return 1;
  }

  if (left.date > right.date) {
    return -1;
  }

  return right.sourceOrder - left.sourceOrder;
}

function isValidDateString(value: string): boolean {
  if (!DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasLineBreak(value: string): boolean {
  return value.includes("\n") || value.includes("\r");
}

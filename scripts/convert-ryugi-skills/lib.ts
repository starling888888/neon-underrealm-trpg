import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { isDeepStrictEqual } from "node:util";
import readXlsxFile from "read-excel-file/node";
import {
  assertRyugiSkillsJson,
  RYUGI_SKILLS_DATA_NAME,
  type RyugiSkillsJson,
} from "../../src/lib/schemas/ryugi-skills";
import { convertSkillSheet, formatDateTimeJst } from "../convert-skills/lib";

export interface ConvertRyugiSkillsOptions {
  inputPath: string;
  outputPath: string;
  ryugiIds: readonly string[];
  now?: Date;
  onWarning?: (warning: string) => void;
}

export async function convertRyugiSkills(
  options: ConvertRyugiSkillsOptions,
): Promise<RyugiSkillsJson> {
  const sheets = await readXlsxFile(options.inputPath, { trim: false });
  assertSheetNames(
    sheets.map((sheet) => sheet.sheet),
    options.ryugiIds,
  );
  const sheetsByName = new Map(
    sheets.map((sheet) => [sheet.sheet, sheet.data]),
  );
  const data = Object.fromEntries(
    options.ryugiIds.map((ryugiId) => {
      const rows = sheetsByName.get(ryugiId);
      if (!rows) throw new Error(`Worksheet "${ryugiId}" was not found.`);
      return [
        ryugiId,
        convertSkillSheet(rows, {
          idPrefix: `skill-ryugi-${ryugiId}`,
          sheetName: ryugiId,
          onWarning: options.onWarning,
        }),
      ];
    }),
  );
  const existing = await readExisting(options.outputPath, options.ryugiIds);
  const result: RyugiSkillsJson = {
    dataName: RYUGI_SKILLS_DATA_NAME,
    updatedAt:
      existing && isDeepStrictEqual(existing.data, data)
        ? existing.updatedAt
        : formatDateTimeJst(options.now ?? new Date()),
    data,
  };

  assertRyugiSkillsJson(result, options.ryugiIds);
  await mkdir(dirname(options.outputPath), { recursive: true });
  await writeFile(options.outputPath, `${JSON.stringify(result, null, 2)}\n`);
  return result;
}

function assertSheetNames(
  sheetNames: readonly string[],
  ryugiIds: readonly string[],
): void {
  const expected = new Set(ryugiIds);
  const actual = new Set(sheetNames);
  for (const ryugiId of ryugiIds) {
    if (!actual.has(ryugiId)) {
      throw new Error(`Worksheet "${ryugiId}" was not found.`);
    }
  }
  for (const sheetName of sheetNames) {
    if (!expected.has(sheetName)) {
      throw new Error(`Unexpected worksheet "${sheetName}".`);
    }
  }
}

async function readExisting(
  outputPath: string,
  ryugiIds: readonly string[],
): Promise<RyugiSkillsJson | undefined> {
  try {
    const value: unknown = JSON.parse(await readFile(outputPath, "utf8"));
    assertRyugiSkillsJson(value, ryugiIds);
    return value;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") return undefined;
    throw error;
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}

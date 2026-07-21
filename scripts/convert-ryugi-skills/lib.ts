import readXlsxFile from "read-excel-file/node";
import {
  assertRyugiSkillsJson,
  assertRyugiSkillsJsonShape,
  RYUGI_SKILLS_DATA_NAME,
  type RyugiSkillsJson,
} from "../../src/lib/schemas/ryugi-skills";
import { convertSkillSheet } from "../convert-skills/lib";
import { writeGeneratedJson } from "../convert-skills/write-generated-json";

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
  return writeGeneratedJson({
    outputPath: options.outputPath,
    dataName: RYUGI_SKILLS_DATA_NAME,
    data,
    now: options.now,
    assertExistingJson: assertRyugiSkillsJsonShape,
    assertJson: (value): asserts value is RyugiSkillsJson =>
      assertRyugiSkillsJson(value, options.ryugiIds),
  });
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

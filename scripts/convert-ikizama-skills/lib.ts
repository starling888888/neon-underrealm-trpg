import readXlsxFile from "read-excel-file/node";
import {
  assertIkizamaSkillsJson,
  assertIkizamaSkillsJsonShape,
  IKIZAMA_SKILLS_DATA_NAME,
  type IkizamaSkillsJson,
} from "../../src/lib/schemas/ikizama-skills";
import { convertSkillSheet } from "../convert-skills/lib";
import { writeGeneratedJson } from "../convert-skills/write-generated-json";

export interface ConvertIkizamaSkillsOptions {
  inputPath: string;
  outputPath: string;
  ikizamaIds: readonly string[];
  now?: Date;
  onWarning?: (warning: string) => void;
}

export async function convertIkizamaSkills(
  options: ConvertIkizamaSkillsOptions,
): Promise<IkizamaSkillsJson> {
  const sheets = await readXlsxFile(options.inputPath, { trim: false });
  assertSheetNames(
    sheets.map((sheet) => sheet.sheet),
    options.ikizamaIds,
  );
  const sheetsByName = new Map(
    sheets.map((sheet) => [sheet.sheet, sheet.data]),
  );
  const data = Object.fromEntries(
    options.ikizamaIds.map((ikizamaId) => {
      const rows = sheetsByName.get(ikizamaId);
      if (!rows) throw new Error(`Worksheet "${ikizamaId}" was not found.`);
      return [
        ikizamaId,
        convertSkillSheet(rows, {
          idPrefix: `skill-ikizama-${ikizamaId}`,
          sheetName: ikizamaId,
          onWarning: options.onWarning,
        }),
      ];
    }),
  );
  return writeGeneratedJson({
    outputPath: options.outputPath,
    dataName: IKIZAMA_SKILLS_DATA_NAME,
    data,
    now: options.now,
    assertExistingJson: assertIkizamaSkillsJsonShape,
    assertJson: (value): asserts value is IkizamaSkillsJson =>
      assertIkizamaSkillsJson(value, options.ikizamaIds),
  });
}

function assertSheetNames(
  sheetNames: readonly string[],
  ikizamaIds: readonly string[],
): void {
  const expected = new Set(ikizamaIds);
  const actual = new Set(sheetNames);
  for (const ikizamaId of ikizamaIds) {
    if (!actual.has(ikizamaId)) {
      throw new Error(`Worksheet "${ikizamaId}" was not found.`);
    }
  }
  for (const sheetName of sheetNames) {
    if (!expected.has(sheetName)) {
      throw new Error(`Unexpected worksheet "${sheetName}".`);
    }
  }
}

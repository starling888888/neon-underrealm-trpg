import {
  assertSkillsJson,
  assertSkillsJsonShape,
} from "../../src/lib/schemas/conversion/skill";
import type { SkillsByCategory, SkillsJson } from "../../src/lib/types/skill";
import { convertSkills } from "../convert-skills/lib";
import { writeGeneratedJson } from "../convert-skills/write-generated-json";

const contract = { dataName: "common-skills", idPrefix: "skill-common" };

export interface ConvertCommonSkillsOptions {
  inputPath: string;
  outputPath: string;
  sheetName: string;
  now?: Date;
  onWarning?: (warning: string) => void;
}

export async function convertCommonSkills(
  options: ConvertCommonSkillsOptions,
): Promise<SkillsJson> {
  const data = await convertSkills({
    inputPath: options.inputPath,
    sheetName: options.sheetName,
    idPrefix: contract.idPrefix,
    onWarning: options.onWarning,
  });
  return writeGeneratedJson<SkillsByCategory, SkillsJson>({
    outputPath: options.outputPath,
    dataName: contract.dataName,
    data,
    now: options.now,
    assertExistingJson: assertSkillsJsonShape,
    assertJson: (value): asserts value is SkillsJson =>
      assertSkillsJson(value, contract),
  });
}

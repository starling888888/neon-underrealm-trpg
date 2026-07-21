import {
  assertSkillsJson,
  type SkillsByCategory,
  type SkillsJson,
} from "../../src/lib/schemas/skill";
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
    assertJson: (value): asserts value is SkillsJson =>
      assertSkillsJson(value, contract),
  });
}

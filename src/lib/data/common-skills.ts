import commonSkillsJson from "../../../data/generated/common-skills.json";
import type {
  Skill,
  SkillCategory,
  SkillsByCategory,
  SkillsJson,
} from "../schemas/skill";

const generatedCommonSkillsJson = commonSkillsJson as SkillsJson;

export function getCommonSkillsJson(): SkillsJson {
  return generatedCommonSkillsJson;
}

export function getCommonSkillsByCategory(): SkillsByCategory {
  return getCommonSkillsJson().data;
}

export function getCommonSkills(category: SkillCategory): Skill[] {
  return getCommonSkillsByCategory()[category];
}

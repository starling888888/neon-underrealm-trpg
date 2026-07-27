import { getCommonSkillsByCategory } from "../../lib/data/common-skills";
import { getIkizamaSkillsJson } from "../../lib/data/ikizama-skills";
import {
  getRyugiSkillsById,
  getRyugiSkillsJson,
} from "../../lib/data/ryugi-skills";
import type { Skill, SkillsByCategory } from "../../lib/types/skill";

export type PrimarySkillGroups = {
  advanced: readonly Skill[];
  basic: readonly Skill[];
  bonus: readonly Skill[];
};

function flattenSkills(skills: SkillsByCategory): readonly Skill[] {
  return [...skills.bonus, ...skills.basic, ...skills.advanced];
}

export function getPrimarySkillGroups(
  primaryRyugiId: string | null,
  primaryRyugiLevel: number,
): PrimarySkillGroups {
  if (primaryRyugiId === null) {
    return { advanced: [], basic: [], bonus: [] };
  }

  const skills = getRyugiSkillsById(primaryRyugiId);
  if (skills === undefined) {
    return { advanced: [], basic: [], bonus: [] };
  }

  return {
    advanced: primaryRyugiLevel >= 6 ? skills.advanced : [],
    basic: skills.basic,
    bonus: skills.bonus,
  };
}

export function getPrimarySkillById(
  primaryRyugiId: string | null,
  skillId: string | null,
): Skill | null {
  if (primaryRyugiId === null || skillId === null) return null;

  const skills = getRyugiSkillsById(primaryRyugiId);
  if (skills === undefined) return null;

  return flattenSkills(skills).find((skill) => skill.id === skillId) ?? null;
}

export function getMaximumSkillNameLength(): number {
  const allSkills = [
    ...Object.values(getRyugiSkillsJson().data).flatMap(flattenSkills),
    ...Object.values(getIkizamaSkillsJson().data).flatMap(flattenSkills),
    ...flattenSkills(getCommonSkillsByCategory()),
  ];

  return Math.max(
    1,
    ...allSkills.map((skill) => Array.from(skill.name).length),
  );
}

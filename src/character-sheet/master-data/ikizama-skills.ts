import { getIkizamaSkillsById } from "../../lib/data/ikizama-skills";
import type { Skill, SkillsByCategory } from "../../lib/types/skill";

export type IkizamaSkillGroups = {
  advanced: readonly Skill[];
  basic: readonly Skill[];
  bonus: readonly Skill[];
};

function flattenSkills(skills: SkillsByCategory): readonly Skill[] {
  return [...skills.bonus, ...skills.basic, ...skills.advanced];
}

/** Returns only the candidates unlocked by the selected ikizama level. */
export function getIkizamaSkillGroups(
  ikizamaId: string | null,
  ikizamaLevel: number,
): IkizamaSkillGroups {
  if (ikizamaId === null) {
    return { advanced: [], basic: [], bonus: [] };
  }

  const skills = getIkizamaSkillsById(ikizamaId);
  if (skills === undefined) {
    return { advanced: [], basic: [], bonus: [] };
  }

  return {
    advanced: ikizamaLevel >= 4 ? skills.advanced : [],
    basic: skills.basic,
    bonus: skills.bonus,
  };
}

/** Resolves an ID only from the currently selected ikizama's skill master. */
export function getIkizamaSkillById(
  ikizamaId: string | null,
  skillId: string | null,
): Skill | null {
  if (ikizamaId === null || skillId === null) return null;

  const skills = getIkizamaSkillsById(ikizamaId);
  if (skills === undefined) return null;

  return flattenSkills(skills).find((skill) => skill.id === skillId) ?? null;
}

import { getCommonSkillsByCategory } from "../../lib/data/common-skills";
import type { Skill } from "../../lib/types/skill";

function allCommonSkills(): readonly Skill[] {
  const skills = getCommonSkillsByCategory();

  return [...skills.bonus, ...skills.basic, ...skills.advanced].sort(
    (left, right) => left.sourceOrder - right.sourceOrder,
  );
}

export function getBasicAttackSkill(): Skill | null {
  return getCommonSkillsByCategory().bonus[0] ?? null;
}

export function getCommonSkillCandidates(levelLimit = 6): readonly Skill[] {
  return allCommonSkills().filter(
    (skill) =>
      skill.category !== "bonus" &&
      (skill.category !== "advanced" || levelLimit >= 6),
  );
}

export function getCommonSkillById(skillId: string | null): Skill | null {
  if (skillId === null) return null;

  return allCommonSkills().find((skill) => skill.id === skillId) ?? null;
}

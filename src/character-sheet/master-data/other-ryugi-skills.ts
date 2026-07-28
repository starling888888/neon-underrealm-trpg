import { getRyugiSkillsById } from "../../lib/data/ryugi-skills";
import type { Skill, SkillsByCategory } from "../../lib/types/skill";

export type OtherRyugiSkillGroups = {
  advanced: readonly Skill[];
  basic: readonly Skill[];
};

function isOtherRyugiCandidate(skill: Skill): boolean {
  return skill.acquisitionRestriction !== "プライマリ限定";
}

function filterCandidates(skills: readonly Skill[]): readonly Skill[] {
  return skills.filter(isOtherRyugiCandidate);
}

function flattenCandidates(skills: SkillsByCategory): readonly Skill[] {
  return [
    ...filterCandidates(skills.basic),
    ...filterCandidates(skills.advanced),
  ];
}

/** Reads selectable normal skills for one other-ryugi row. */
export function getOtherRyugiSkillGroups(
  ryugiId: string | null,
  ryugiLevel: number,
): OtherRyugiSkillGroups {
  if (ryugiId === null) return { advanced: [], basic: [] };

  const skills = getRyugiSkillsById(ryugiId);
  if (skills === undefined) return { advanced: [], basic: [] };

  return {
    advanced: ryugiLevel >= 6 ? filterCandidates(skills.advanced) : [],
    basic: filterCandidates(skills.basic),
  };
}

/** Resolves only a selectable other-ryugi normal skill by its master ID. */
export function getOtherRyugiSkillById(
  ryugiId: string | null,
  skillId: string | null,
): Skill | null {
  if (ryugiId === null || skillId === null) return null;

  const skills = getRyugiSkillsById(ryugiId);
  if (skills === undefined) return null;

  return (
    flattenCandidates(skills).find((skill) => skill.id === skillId) ?? null
  );
}

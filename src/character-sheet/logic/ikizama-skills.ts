import type { Skill } from "../../lib/types/skill";

export type IkizamaSkillsValidationRow = {
  level: number;
  rowId: string;
  skill: Skill | null;
};

export type IkizamaSkillsValidation = {
  hasIkizamaSkillLevelTotalError: boolean;
  invalidMaximumLevelRowIds: readonly string[];
  selectedLevelTotal: number;
};

/** Calculates the G13-local total constraint for ikizama skills. */
export function calculateIkizamaSkillsValidation(
  ikizamaLevel: number,
  bonusLevel: number,
  bonusSkill: Skill | null,
  rows: readonly IkizamaSkillsValidationRow[],
): IkizamaSkillsValidation {
  const selectedLevelTotal =
    Math.max(0, bonusLevel - 1) +
    rows.reduce(
      (total, row) => total + (row.skill === null ? 0 : row.level),
      0,
    );

  return {
    hasIkizamaSkillLevelTotalError: selectedLevelTotal > ikizamaLevel,
    invalidMaximumLevelRowIds: [
      ...(bonusSkill !== null &&
      (bonusLevel < 1 || bonusLevel > bonusSkill.maxLevel)
        ? [`ikizama-bonus-${bonusSkill.id}`]
        : []),
      ...rows.flatMap((row) =>
        row.skill !== null && (row.level < 1 || row.level > row.skill.maxLevel)
          ? [row.rowId]
          : [],
      ),
    ],
    selectedLevelTotal,
  };
}

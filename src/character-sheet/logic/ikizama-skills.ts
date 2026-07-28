import type { Skill } from "../../lib/types/skill";

export type IkizamaSkillsValidationRow = {
  level: number;
  skill: Skill | null;
};

export type IkizamaSkillsValidation = {
  hasIkizamaSkillLevelTotalError: boolean;
  selectedLevelTotal: number;
};

/** Calculates the G13-local total constraint for ikizama skills. */
export function calculateIkizamaSkillsValidation(
  ikizamaLevel: number,
  bonusLevel: number,
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
    selectedLevelTotal,
  };
}

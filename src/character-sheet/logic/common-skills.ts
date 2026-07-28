import type { Skill } from "../../lib/types/skill";

export const commonSkillBonusLevels = [2, 5, 9] as const;

export type CommonSkillBonusLevel = (typeof commonSkillBonusLevels)[number];

export type CommonSkillsValidationRow = {
  level: number;
  rowId: string;
  skill: Skill | null;
};

export type CommonSkillsValidation = {
  hasCommonSkillLevelError: boolean;
  invalidMaximumLevelRowIds: readonly string[];
  levelLimit: number;
  selectedLevelTotal: number;
};

/** Returns the common-skill bonus thresholds reached by the selected rows. */
export function getUnlockedCommonSkillBonusLevels(
  selectedLevelTotal: number,
): readonly CommonSkillBonusLevel[] {
  return commonSkillBonusLevels.filter((level) => selectedLevelTotal >= level);
}

/** Calculates the G14-local common-skill total and rank-derived limit. */
export function calculateCommonSkillsValidation(
  rank: number,
  rows: readonly CommonSkillsValidationRow[],
): CommonSkillsValidation {
  const selectedLevelTotal = rows.reduce(
    (total, row) => total + (row.skill === null ? 0 : Math.max(0, row.level)),
    0,
  );
  const levelLimit = Math.ceil(rank / 2);

  return {
    hasCommonSkillLevelError: selectedLevelTotal > levelLimit,
    invalidMaximumLevelRowIds: rows.flatMap((row) =>
      row.skill !== null && (row.level < 1 || row.level > row.skill.maxLevel)
        ? [row.rowId]
        : [],
    ),
    levelLimit,
    selectedLevelTotal,
  };
}

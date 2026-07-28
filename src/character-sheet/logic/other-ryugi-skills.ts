import type { Skill } from "../../lib/types/skill";

export type OtherRyugiSkillValidationBuildRow = {
  level: number;
  rowId: string;
};

export type OtherRyugiSkillValidationRow = {
  level: number;
  rowId: string;
  ryugiRowId: string;
  skill: Skill | null;
};

export type OtherRyugiSkillsValidation = {
  invalidMaximumLevelRowIds: readonly string[];
  invalidRyugiRowIds: readonly string[];
};

/** Calculates the per-other-ryugi selected-level total constraint. */
export function calculateOtherRyugiSkillsValidation(
  otherRyugi: readonly OtherRyugiSkillValidationBuildRow[],
  rows: readonly OtherRyugiSkillValidationRow[],
): OtherRyugiSkillsValidation {
  const selectedLevelTotals = new Map<string, number>();

  for (const row of rows) {
    if (row.skill === null) continue;
    selectedLevelTotals.set(
      row.ryugiRowId,
      (selectedLevelTotals.get(row.ryugiRowId) ?? 0) + row.level,
    );
  }

  return {
    invalidMaximumLevelRowIds: rows.flatMap((row) =>
      row.skill !== null && (row.level < 1 || row.level > row.skill.maxLevel)
        ? [row.rowId]
        : [],
    ),
    invalidRyugiRowIds: otherRyugi.flatMap((row) =>
      (selectedLevelTotals.get(row.rowId) ?? 0) > row.level ? [row.rowId] : [],
    ),
  };
}

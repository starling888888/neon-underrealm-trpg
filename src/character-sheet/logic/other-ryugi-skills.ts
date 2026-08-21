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
  invalidAdvancedSkillRowIds: readonly string[];
  invalidDuplicateSkillRowIds: readonly string[];
  invalidMaximumLevelRowIds: readonly string[];
  invalidRyugiRowIds: readonly string[];
  selectedLevelTotals: readonly {
    ryugiRowId: string;
    selectedLevelTotal: number;
  }[];
};

/** Calculates the per-other-ryugi selected-level total constraint. */
export function calculateOtherRyugiSkillsValidation(
  otherRyugi: readonly OtherRyugiSkillValidationBuildRow[],
  rows: readonly OtherRyugiSkillValidationRow[],
): OtherRyugiSkillsValidation {
  const selectedLevelTotals = new Map<string, number>();
  const selectedSkillCounts = new Map<string, number>();

  for (const row of rows) {
    if (row.skill === null) continue;
    selectedLevelTotals.set(
      row.ryugiRowId,
      (selectedLevelTotals.get(row.ryugiRowId) ?? 0) + Math.max(0, row.level),
    );
    selectedSkillCounts.set(
      `${row.ryugiRowId}:${row.skill.id}`,
      (selectedSkillCounts.get(`${row.ryugiRowId}:${row.skill.id}`) ?? 0) + 1,
    );
  }

  return {
    invalidAdvancedSkillRowIds: rows.flatMap((row) => {
      const owner = otherRyugi.find((entry) => entry.rowId === row.ryugiRowId);
      return row.skill?.category === "advanced" && (owner?.level ?? 0) < 6
        ? [row.rowId]
        : [];
    }),
    invalidDuplicateSkillRowIds: rows.flatMap((row) =>
      row.skill !== null &&
      (selectedSkillCounts.get(`${row.ryugiRowId}:${row.skill.id}`) ?? 0) > 1
        ? [row.rowId]
        : [],
    ),
    invalidMaximumLevelRowIds: rows.flatMap((row) =>
      row.skill !== null && (row.level < 1 || row.level > row.skill.maxLevel)
        ? [row.rowId]
        : [],
    ),
    invalidRyugiRowIds: otherRyugi.flatMap((row) =>
      (selectedLevelTotals.get(row.rowId) ?? 0) > row.level ? [row.rowId] : [],
    ),
    selectedLevelTotals: otherRyugi.map((row) => ({
      ryugiRowId: row.rowId,
      selectedLevelTotal: selectedLevelTotals.get(row.rowId) ?? 0,
    })),
  };
}

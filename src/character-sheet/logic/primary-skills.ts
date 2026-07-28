import type { Skill } from "../../lib/types/skill";

export type PrimarySkillValidationRow = {
  level: number;
  rowId: string;
  skill: Skill | null;
  skillId: string | null;
};

export type PrimarySkillsValidation = {
  hasPrimarySkillLevelTotalError: boolean;
  invalidDuplicateSkillRowIds: readonly string[];
  invalidMaximumLevelRowIds: readonly string[];
  selectedLevelTotal: number;
};

/** Calculates only the structured G12 constraints for primary ryugi skills. */
export function calculatePrimarySkillsValidation(
  primaryRyugiLevel: number,
  rows: readonly PrimarySkillValidationRow[],
): PrimarySkillsValidation {
  const selectedRows = rows.filter((row) => row.skill !== null);
  const invalidMaximumLevelRowIds = selectedRows.flatMap((row) =>
    row.skill !== null && row.level > row.skill.maxLevel ? [row.rowId] : [],
  );
  const selectedSkillCounts = new Map<string, number>();
  for (const row of selectedRows) {
    if (row.skill === null) continue;
    selectedSkillCounts.set(
      row.skill.id,
      (selectedSkillCounts.get(row.skill.id) ?? 0) + 1,
    );
  }
  const invalidDuplicateSkillRowIds = selectedRows.flatMap((row) =>
    row.skill !== null && (selectedSkillCounts.get(row.skill.id) ?? 0) > 1
      ? [row.rowId]
      : [],
  );
  const selectedLevelTotal = selectedRows.reduce(
    (total, row) => total + row.level,
    0,
  );

  return {
    hasPrimarySkillLevelTotalError: selectedLevelTotal > primaryRyugiLevel,
    invalidDuplicateSkillRowIds,
    invalidMaximumLevelRowIds,
    selectedLevelTotal,
  };
}

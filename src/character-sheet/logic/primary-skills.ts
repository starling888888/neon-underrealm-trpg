import type { PrimarySkillRowView } from "../components/PrimarySkillsSection";

export type PrimarySkillsValidation = {
  hasPrimarySkillLevelTotalError: boolean;
  invalidMaximumLevelRowIds: readonly string[];
  selectedLevelTotal: number;
};

/** Calculates only the structured G12 constraints for primary ryugi skills. */
export function calculatePrimarySkillsValidation(
  primaryRyugiLevel: number,
  rows: readonly PrimarySkillRowView[],
): PrimarySkillsValidation {
  const selectedRows = rows.filter((row) => row.skill !== null);
  const invalidMaximumLevelRowIds = selectedRows.flatMap((row) =>
    row.skill !== null && row.level > row.skill.maxLevel ? [row.rowId] : [],
  );
  const selectedLevelTotal = selectedRows.reduce(
    (total, row) => total + row.level,
    0,
  );

  return {
    hasPrimarySkillLevelTotalError: selectedLevelTotal > primaryRyugiLevel,
    invalidMaximumLevelRowIds,
    selectedLevelTotal,
  };
}

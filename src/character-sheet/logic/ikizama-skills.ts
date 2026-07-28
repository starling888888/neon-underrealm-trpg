import type { Skill } from "../../lib/types/skill";

export type IkizamaSkillsValidationRow = {
  level: number;
  rowId: string;
  skill: Skill | null;
};

export type IkizamaSkillsValidation = {
  hasIkizamaSkillLevelTotalError: boolean;
  invalidAdvancedSkillRowIds: readonly string[];
  invalidDuplicateSkillRowIds: readonly string[];
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
  const selectedRows = rows.filter((row) => row.skill !== null);
  const selectedSkillCounts = new Map<string, number>();
  for (const row of selectedRows) {
    if (row.skill === null) continue;
    selectedSkillCounts.set(
      row.skill.id,
      (selectedSkillCounts.get(row.skill.id) ?? 0) + 1,
    );
  }
  const selectedLevelTotal =
    Math.max(0, bonusLevel - 1) +
    rows.reduce(
      (total, row) => total + (row.skill === null ? 0 : row.level),
      0,
    );

  return {
    hasIkizamaSkillLevelTotalError: selectedLevelTotal > ikizamaLevel,
    invalidAdvancedSkillRowIds:
      ikizamaLevel < 4
        ? selectedRows.flatMap((row) =>
            row.skill?.category === "advanced" ? [row.rowId] : [],
          )
        : [],
    invalidDuplicateSkillRowIds: selectedRows.flatMap((row) =>
      row.skill !== null && (selectedSkillCounts.get(row.skill.id) ?? 0) > 1
        ? [row.rowId]
        : [],
    ),
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

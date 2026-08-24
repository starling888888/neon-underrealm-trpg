import { memo } from "react";
import type { Skill } from "../../../lib/types/skill";
import { characterSheetDictionary } from "../../dictionary";
import FormulaTooltip from "../_common/FormulaTooltip";
import SkillSection, { type SkillSectionRow } from "./SkillSection";

export type PrimarySkillRowView = {
  level: number;
  rowId: string;
  skill: Skill | null;
  skillId: string | null;
};

export type PrimarySkillsSectionProps = {
  bonusSkills: readonly Skill[];
  hasPrimarySkillLevelTotalError: boolean;
  invalidAdvancedSkillRowIds: readonly string[];
  invalidDuplicateSkillRowIds: readonly string[];
  invalidMaximumLevelRowIds: readonly string[];
  maximumSkillNameLength: number;
  onAdd: () => void;
  onLevelChange: (rowId: string, value: string) => number;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  onMove: (rowId: string, direction: "up" | "down") => void;
  primaryRyugiName: string | null;
  primaryRyugiLevel: number;
  primaryRyugiSelected: boolean;
  rows: readonly PrimarySkillRowView[];
  selectedLevelTotal: number;
  synchronizationKey?: unknown;
};

/** Adapts primary-ryugi form values to the shared skill-section display. */
function PrimarySkillsSection({
  bonusSkills,
  hasPrimarySkillLevelTotalError,
  invalidAdvancedSkillRowIds,
  invalidDuplicateSkillRowIds,
  invalidMaximumLevelRowIds,
  maximumSkillNameLength,
  onAdd,
  onLevelChange,
  onPickerRequest,
  onMove,
  onRemove,
  primaryRyugiName,
  primaryRyugiLevel,
  primaryRyugiSelected,
  rows,
  selectedLevelTotal,
  synchronizationKey,
}: PrimarySkillsSectionProps) {
  const copy = characterSheetDictionary.characterSheet.skills;
  const terms = characterSheetDictionary.gameDomain.terms;
  const sectionRows: SkillSectionRow[] = [
    ...bonusSkills.map((skill) => ({
      accessibilityName: skill.name,
      hasLevelError: false,
      hasRowError: false,
      kind: "automatic" as const,
      level: 1,
      levelEditable: false,
      movable: false,
      removable: false,
      removalEnabled: false,
      rowId: `primary-bonus-${skill.id}`,
      selectable: false,
      skill,
      skillId: skill.id,
    })),
    ...rows.map((row, index) => ({
      accessibilityName: row.skill?.name ?? `${copy.unselectedRow}${index + 1}`,
      hasLevelError: invalidMaximumLevelRowIds.includes(row.rowId),
      hasRowError:
        invalidAdvancedSkillRowIds.includes(row.rowId) ||
        invalidDuplicateSkillRowIds.includes(row.rowId),
      kind: "normal" as const,
      level: row.level,
      levelEditable: true,
      movable: true,
      removable: true,
      removalEnabled: rows.length > 1,
      rowId: row.rowId,
      selectable: true,
      skill: row.skill,
      skillId: row.skillId,
    })),
  ];

  return (
    <div data-primary-skills-section>
      <SkillSection
        actionDescription={
          <FormulaTooltip formula={copy.primarySkillSummaryTooltip}>
            {`${copy.commonSkillTotal}：${selectedLevelTotal}／${copy.ryugiLevel}：${primaryRyugiLevel}`}
          </FormulaTooltip>
        }
        actionDescriptionInvalid={hasPrimarySkillLevelTotalError}
        addLabel={copy.add}
        ariaLabel={copy.label}
        heading={
          primaryRyugiName === null
            ? terms.primaryRyugi
            : `${terms.primaryRyugi}：${primaryRyugiName}`
        }
        isAvailable={primaryRyugiSelected}
        isInvalid={hasPrimarySkillLevelTotalError}
        nameColumnWidthCh={maximumSkillNameLength}
        onAdd={onAdd}
        onLevelChange={onLevelChange}
        onMove={onMove}
        onPickerRequest={onPickerRequest}
        onRemove={onRemove}
        rows={sectionRows}
        sectionId="primary-skills-content"
        synchronizationKey={synchronizationKey}
        unavailableMessage={copy.selectPrimaryRyugi}
      />
    </div>
  );
}

export default memo(PrimarySkillsSection);

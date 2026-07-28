import type { Skill } from "../../lib/types/skill";
import { characterSheetDictionary } from "../dictionary";
import type { PrimarySkillGroups } from "../master-data/primary-skills";
import SkillSection, { type SkillSectionRow } from "./skills/SkillSection";

export type PrimarySkillRowView = {
  level: number;
  rowId: string;
  skill: Skill | null;
  skillId: string | null;
};

export type PrimarySkillsSectionProps = {
  bonusSkills: readonly Skill[];
  candidateGroups: PrimarySkillGroups;
  hasPrimarySkillLevelTotalError: boolean;
  invalidDuplicateSkillRowIds: readonly string[];
  invalidMaximumLevelRowIds: readonly string[];
  maximumSkillNameLength: number;
  onAdd: () => void;
  onLevelChange: (rowId: string, value: string) => number;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  onMove: (rowId: string, direction: "up" | "down") => void;
  onSelect: (rowId: string, skillId: string) => void;
  onSelectionClear: () => void;
  primaryRyugiName: string | null;
  primaryRyugiSelected: boolean;
  rows: readonly PrimarySkillRowView[];
};

/** Adapts primary-ryugi form values to the shared skill-section display. */
export default function PrimarySkillsSection({
  bonusSkills,
  hasPrimarySkillLevelTotalError,
  invalidDuplicateSkillRowIds,
  invalidMaximumLevelRowIds,
  maximumSkillNameLength,
  onAdd,
  onLevelChange,
  onPickerRequest,
  onMove,
  onRemove,
  primaryRyugiName,
  primaryRyugiSelected,
  rows,
}: PrimarySkillsSectionProps) {
  const copy = characterSheetDictionary.characterSheet.skills;
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
      rowId: `primary-bonus-${skill.id}`,
      selectable: false,
      skill,
      skillId: skill.id,
    })),
    ...rows.map((row, index) => ({
      accessibilityName: row.skill?.name ?? `${copy.unselectedRow}${index + 1}`,
      hasLevelError: invalidMaximumLevelRowIds.includes(row.rowId),
      hasRowError: invalidDuplicateSkillRowIds.includes(row.rowId),
      kind: "normal" as const,
      level: row.level,
      levelEditable: true,
      movable: true,
      removable: true,
      rowId: row.rowId,
      selectable: true,
      skill: row.skill,
      skillId: row.skillId,
    })),
  ];

  return (
    <div data-primary-skills-section>
      <SkillSection
        addLabel={copy.add}
        ariaLabel={copy.label}
        heading={
          primaryRyugiName === null
            ? copy.primary
            : `${copy.primary}：${primaryRyugiName}`
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
        unavailableMessage={copy.selectPrimaryRyugi}
      />
    </div>
  );
}

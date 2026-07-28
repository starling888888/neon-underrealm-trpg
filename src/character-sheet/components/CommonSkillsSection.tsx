import type { Skill } from "../../lib/types/skill";
import { characterSheetDictionary } from "../dictionary";
import SkillSection, { type SkillSectionRow } from "./skills/SkillSection";

export type CommonSkillRowView = {
  level: number;
  rowId: string;
  skill: Skill | null;
  skillId: string | null;
};

export type CommonSkillsSectionProps = {
  basicAttack: Skill | null;
  hasCommonSkillLevelError: boolean;
  invalidDuplicateSkillRowIds: readonly string[];
  invalidMaximumLevelRowIds: readonly string[];
  levelLimit: number;
  maximumSkillNameLength: number;
  onAdd: () => void;
  onLevelChange: (rowId: string, value: string) => number;
  onMove: (rowId: string, direction: "up" | "down") => void;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  rows: readonly CommonSkillRowView[];
  selectedLevelTotal: number;
};

/** Adapts common-skill form values to the shared skill-section display. */
export default function CommonSkillsSection({
  basicAttack,
  hasCommonSkillLevelError,
  invalidDuplicateSkillRowIds,
  invalidMaximumLevelRowIds,
  levelLimit,
  maximumSkillNameLength,
  onAdd,
  onLevelChange,
  onMove,
  onPickerRequest,
  onRemove,
  rows,
  selectedLevelTotal,
}: CommonSkillsSectionProps) {
  const copy = characterSheetDictionary.characterSheet.skills;
  const sectionRows: SkillSectionRow[] = [
    ...(basicAttack === null
      ? []
      : [
          {
            accessibilityName: basicAttack.name,
            hasLevelError: false,
            hasRowError: false,
            kind: "automatic" as const,
            level: 1,
            levelEditable: false,
            movable: false,
            removable: false,
            removalEnabled: false,
            rowId: `common-bonus-${basicAttack.id}`,
            selectable: false,
            skill: basicAttack,
            skillId: basicAttack.id,
          },
        ]),
    ...rows.map((row, index) => ({
      accessibilityName:
        row.skill?.name ?? `${copy.common}${copy.unselectedRow}${index + 1}`,
      hasLevelError: invalidMaximumLevelRowIds.includes(row.rowId),
      hasRowError: invalidDuplicateSkillRowIds.includes(row.rowId),
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
    <SkillSection
      actionDescription={`${copy.commonSkillTotal}：${selectedLevelTotal}／${copy.commonSkillLevelLimit}：${levelLimit}`}
      actionDescriptionInvalid={hasCommonSkillLevelError}
      addLabel={copy.add}
      ariaLabel={copy.commonLabel}
      heading={copy.common}
      isAvailable
      isInvalid={hasCommonSkillLevelError}
      nameColumnWidthCh={maximumSkillNameLength}
      onAdd={onAdd}
      onLevelChange={onLevelChange}
      onMove={onMove}
      onPickerRequest={onPickerRequest}
      onRemove={onRemove}
      rows={sectionRows}
      sectionId="common-skills-content"
      unavailableMessage=""
    />
  );
}

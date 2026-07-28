import type { Skill } from "../../lib/types/skill";
import { characterSheetDictionary } from "../dictionary";
import SkillSection, { type SkillSectionRow } from "./skills/SkillSection";

export type OtherRyugiSkillRowView = {
  level: number;
  rowId: string;
  skill: Skill | null;
  skillId: string | null;
};

export type OtherRyugiSkillsSectionView = {
  hasSkillLevelTotalError: boolean;
  rows: readonly OtherRyugiSkillRowView[];
  ryugiName: string | null;
  ryugiRowId: string;
  ryugiSelected: boolean;
};

export type OtherRyugiSkillsSectionProps = {
  maximumSkillNameLength: number;
  onAdd: (ryugiRowId: string) => void;
  onLevelChange: (rowId: string, value: string) => number;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  onMove: (rowId: string, direction: "up" | "down") => void;
  sections: readonly OtherRyugiSkillsSectionView[];
};

/** Adapts each other-ryugi row to the shared skill-section display. */
export default function OtherRyugiSkillsSection({
  maximumSkillNameLength,
  onAdd,
  onLevelChange,
  onMove,
  onPickerRequest,
  onRemove,
  sections,
}: OtherRyugiSkillsSectionProps) {
  const copy = characterSheetDictionary.characterSheet.skills;

  return (
    <>
      {sections.map((section, sectionIndex) => {
        const sectionRows: SkillSectionRow[] = section.rows.map(
          (row, rowIndex) => ({
            accessibilityName:
              row.skill?.name ?? `${copy.unselectedRow}${rowIndex + 1}`,
            hasLevelError: false,
            hasRowError: false,
            kind: "normal" as const,
            level: row.level,
            levelEditable: true,
            movable: true,
            removalEnabled: section.rows.length > 1,
            removable: true,
            rowId: row.rowId,
            selectable: true,
            skill: row.skill,
            skillId: row.skillId,
          }),
        );

        return (
          <SkillSection
            addLabel={copy.add}
            ariaLabel={`${copy.otherRyugiLabel}${sectionIndex + 1}`}
            heading={
              section.ryugiName === null
                ? copy.otherRyugi
                : `${copy.otherRyugi}：${section.ryugiName}`
            }
            isAvailable={section.ryugiSelected}
            isInvalid={section.hasSkillLevelTotalError}
            key={section.ryugiRowId}
            nameColumnWidthCh={maximumSkillNameLength}
            onAdd={() => onAdd(section.ryugiRowId)}
            onLevelChange={onLevelChange}
            onMove={onMove}
            onPickerRequest={onPickerRequest}
            onRemove={onRemove}
            rows={sectionRows}
            sectionId={`other-ryugi-skills-content-${section.ryugiRowId}`}
            unavailableMessage={copy.selectOtherRyugi}
          />
        );
      })}
    </>
  );
}

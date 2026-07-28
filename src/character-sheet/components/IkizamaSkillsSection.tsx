import type { Skill } from "../../lib/types/skill";
import { characterSheetDictionary } from "../dictionary";
import SkillSection, { type SkillSectionRow } from "./skills/SkillSection";

export type IkizamaSkillRowView = {
  level: number;
  rowId: string;
  skill: Skill | null;
  skillId: string | null;
};

export type IkizamaSkillsSectionProps = {
  bonusLevel: number;
  bonusSkill: Skill | null;
  hasIkizamaSkillLevelTotalError: boolean;
  invalidMaximumLevelRowIds: readonly string[];
  ikizamaName: string | null;
  ikizamaSelected: boolean;
  maximumSkillNameLength: number;
  onAdd: () => void;
  onLevelChange: (rowId: string, value: string) => number;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  onMove: (rowId: string, direction: "up" | "down") => void;
  rows: readonly IkizamaSkillRowView[];
};

/** Adapts ikizama form values to the shared skill-section display. */
export default function IkizamaSkillsSection({
  bonusLevel,
  bonusSkill,
  ikizamaName,
  ikizamaSelected,
  hasIkizamaSkillLevelTotalError,
  invalidMaximumLevelRowIds,
  maximumSkillNameLength,
  onAdd,
  onLevelChange,
  onMove,
  onPickerRequest,
  onRemove,
  rows,
}: IkizamaSkillsSectionProps) {
  const copy = characterSheetDictionary.characterSheet.skills;
  const sectionRows: SkillSectionRow[] = [
    ...(bonusSkill === null
      ? []
      : [
          {
            accessibilityName: bonusSkill.name,
            hasLevelError: invalidMaximumLevelRowIds.includes(
              `ikizama-bonus-${bonusSkill.id}`,
            ),
            hasRowError: false,
            kind: "automatic" as const,
            level: bonusLevel,
            levelEditable: true,
            movable: false,
            removable: false,
            removalEnabled: false,
            rowId: `ikizama-bonus-${bonusSkill.id}`,
            selectable: false,
            skill: bonusSkill,
            skillId: bonusSkill.id,
          },
        ]),
    ...rows.map((row, index) => ({
      accessibilityName: row.skill?.name ?? `${copy.unselectedRow}${index + 1}`,
      hasLevelError: invalidMaximumLevelRowIds.includes(row.rowId),
      hasRowError: false,
      kind: "normal" as const,
      level: row.level,
      levelEditable: true,
      movable: true,
      removable: true,
      removalEnabled: true,
      rowId: row.rowId,
      selectable: true,
      skill: row.skill,
      skillId: row.skillId,
    })),
  ];

  return (
    <div data-ikizama-skills-section>
      <SkillSection
        addLabel={copy.add}
        ariaLabel={copy.ikizamaLabel}
        heading={
          ikizamaName === null
            ? copy.ikizama
            : `${copy.ikizama}：${ikizamaName}`
        }
        isAvailable={ikizamaSelected}
        isInvalid={hasIkizamaSkillLevelTotalError}
        nameColumnWidthCh={maximumSkillNameLength}
        onAdd={onAdd}
        onLevelChange={onLevelChange}
        onMove={onMove}
        onPickerRequest={onPickerRequest}
        onRemove={onRemove}
        rows={sectionRows}
        sectionId="ikizama-skills-content"
        unavailableMessage={copy.selectIkizama}
      />
    </div>
  );
}

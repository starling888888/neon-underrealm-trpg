import type { Skill } from "../../lib/types/skill";
import { characterSheetDictionary } from "../dictionary";
import type { IkizamaSkillGroups } from "../master-data/ikizama-skills";
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
  candidateGroups: IkizamaSkillGroups;
  hasIkizamaSkillLevelTotalError: boolean;
  ikizamaName: string | null;
  ikizamaSelected: boolean;
  maximumSkillNameLength: number;
  onAdd: () => void;
  onLevelChange: (rowId: string, value: string) => number;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  onMove: (rowId: string, direction: "up" | "down") => void;
  onSelect: (rowId: string, skillId: string) => void;
  rows: readonly IkizamaSkillRowView[];
};

/** Adapts ikizama form values to the shared skill-section display. */
export default function IkizamaSkillsSection({
  bonusLevel,
  bonusSkill,
  ikizamaName,
  ikizamaSelected,
  hasIkizamaSkillLevelTotalError,
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
            hasLevelError: false,
            hasRowError: false,
            kind: "automatic" as const,
            level: bonusLevel,
            levelEditable: true,
            movable: false,
            removable: false,
            rowId: `ikizama-bonus-${bonusSkill.id}`,
            selectable: false,
            skill: bonusSkill,
            skillId: bonusSkill.id,
          },
        ]),
    ...rows.map((row, index) => ({
      accessibilityName: row.skill?.name ?? `${copy.unselectedRow}${index + 1}`,
      hasLevelError: false,
      hasRowError: false,
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

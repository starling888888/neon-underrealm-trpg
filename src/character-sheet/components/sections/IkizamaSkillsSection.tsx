import { memo } from "react";
import type { Skill } from "../../../lib/types/skill";
import { characterSheetDictionary } from "../../dictionary";
import FormulaTooltip from "../_common/FormulaTooltip";
import SkillSection, { type SkillSectionRow } from "./SkillSection";

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
  invalidAdvancedSkillRowIds: readonly string[];
  invalidDuplicateSkillRowIds: readonly string[];
  invalidMaximumLevelRowIds: readonly string[];
  ikizamaName: string | null;
  ikizamaLevel: number;
  ikizamaSelected: boolean;
  maximumSkillNameLength: number;
  onAdd: () => void;
  onLevelChange: (rowId: string, value: string) => number;
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
  onRemove: (rowId: string) => void;
  onMove: (rowId: string, direction: "up" | "down") => void;
  rows: readonly IkizamaSkillRowView[];
  selectedLevelTotal: number;
  synchronizationKey?: unknown;
};

/** Adapts ikizama form values to the shared skill-section display. */
function IkizamaSkillsSection({
  bonusLevel,
  bonusSkill,
  ikizamaName,
  ikizamaLevel,
  ikizamaSelected,
  hasIkizamaSkillLevelTotalError,
  invalidAdvancedSkillRowIds,
  invalidDuplicateSkillRowIds,
  invalidMaximumLevelRowIds,
  maximumSkillNameLength,
  onAdd,
  onLevelChange,
  onMove,
  onPickerRequest,
  onRemove,
  rows,
  selectedLevelTotal,
  synchronizationKey,
}: IkizamaSkillsSectionProps) {
  const copy = characterSheetDictionary.characterSheet.skills;
  const terms = characterSheetDictionary.gameDomain.terms;
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
      hasRowError:
        invalidAdvancedSkillRowIds.includes(row.rowId) ||
        invalidDuplicateSkillRowIds.includes(row.rowId),
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
        actionDescription={
          <FormulaTooltip formula={copy.ikizamaSkillSummaryTooltip}>
            {`${copy.commonSkillTotal}：${selectedLevelTotal}／${copy.ikizamaLevel}：${ikizamaLevel}`}
          </FormulaTooltip>
        }
        actionDescriptionInvalid={hasIkizamaSkillLevelTotalError}
        addLabel={copy.add}
        ariaLabel={copy.ikizamaLabel}
        heading={
          ikizamaName === null
            ? terms.ikizama
            : `${terms.ikizama}：${ikizamaName}`
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
        synchronizationKey={synchronizationKey}
        unavailableMessage={copy.selectIkizama}
      />
    </div>
  );
}

export default memo(IkizamaSkillsSection);

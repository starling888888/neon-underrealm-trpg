import {
  type UseFormReturn,
  useFieldArray,
  useFormState,
  useWatch,
} from "react-hook-form";

import type { CommonSkillsSectionProps } from "../components/CommonSkillsSection";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type SkillSelectionRowValues,
} from "../form-values";
import {
  calculateCommonSkillsValidation,
  getUnlockedCommonSkillBonusLevels,
} from "../logic/common-skills";
import {
  getBasicAttackSkill,
  getCommonSkillById,
  getCommonSkillCandidates,
} from "../master-data/common-skills";
import { getMaximumSkillNameLength } from "../master-data/primary-skills";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";

type CommonSkillsSectionOptions = {
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
};

export type CommonSkillsSectionPresenterState = {
  candidates: ReturnType<typeof getCommonSkillCandidates>;
  onSelect: (rowId: string, skillId: string) => void;
  sectionProps: CommonSkillsSectionProps;
  unlockedBonusLevels: ReturnType<typeof getUnlockedCommonSkillBonusLevels>;
};

const maximumSkillNameLength = getMaximumSkillNameLength();

function createCommonSkillRow(): SkillSelectionRowValues {
  return { level: 1, rowId: crypto.randomUUID(), skillId: null };
}

/** Connects common-skill RHF rows to the shared skill-section display. */
export default function useCommonSkillsSectionProps(
  { control, getValues }: UseFormReturn<CharacterSheetFormValues>,
  { onPickerRequest }: CommonSkillsSectionOptions,
): CommonSkillsSectionPresenterState {
  const { append, move, remove, update } = useFieldArray({
    control,
    keyName: "fieldKey",
    name: "commonSkills.rows",
  });
  const { defaultValues } = useFormState({ control });
  const build = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.build,
    name: "build",
  });
  const commonSkills = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.commonSkills,
    name: "commonSkills",
  });
  const rows = commonSkills.rows.map((row) => ({
    ...row,
    skill: getCommonSkillById(row.skillId),
  }));
  const validation = calculateCommonSkillsValidation(
    build.primaryRyugiLevel + build.ikizamaLevel,
    rows,
  );

  function setRow(rowId: string, nextRow: SkillSelectionRowValues): void {
    const index = getValues("commonSkills.rows").findIndex(
      (row) => row.rowId === rowId,
    );
    if (index < 0) return;

    update(index, nextRow);
  }

  return {
    candidates: getCommonSkillCandidates(),
    onSelect: (rowId, skillId) => {
      const current = getValues("commonSkills.rows").find(
        (row) => row.rowId === rowId,
      );
      if (current !== undefined) {
        setRow(rowId, { ...current, level: 1, skillId });
      }
    },
    sectionProps: {
      basicAttack: getBasicAttackSkill(),
      hasCommonSkillLevelError: validation.hasCommonSkillLevelError,
      invalidDuplicateSkillRowIds: validation.invalidDuplicateSkillRowIds,
      invalidMaximumLevelRowIds: validation.invalidMaximumLevelRowIds,
      levelLimit: validation.levelLimit,
      maximumSkillNameLength,
      onAdd: () => append(createCommonSkillRow()),
      onLevelChange: (rowId, value) => {
        const current = getValues("commonSkills.rows").find(
          (row) => row.rowId === rowId,
        );
        const level = normalizeIntegerInput(value);
        if (current !== undefined) setRow(rowId, { ...current, level });
        return level;
      },
      onMove: (rowId, direction) => {
        const rows = getValues("commonSkills.rows");
        const index = rows.findIndex((row) => row.rowId === rowId);
        const targetIndex = index + (direction === "up" ? -1 : 1);
        if (index < 0 || targetIndex < 0 || targetIndex >= rows.length) return;
        move(index, targetIndex);
      },
      onPickerRequest,
      onRemove: (rowId) => {
        const rows = getValues("commonSkills.rows");
        const index = rows.findIndex((row) => row.rowId === rowId);
        if (rows.length > 1 && index >= 0) remove(index);
      },
      rows,
      selectedLevelTotal: validation.selectedLevelTotal,
      synchronizationKey: defaultValues?.commonSkills,
    },
    unlockedBonusLevels: getUnlockedCommonSkillBonusLevels(
      validation.selectedLevelTotal,
    ),
  };
}

import { useCallback, useMemo } from "react";
import {
  type UseFormReturn,
  useFieldArray,
  useFormState,
  useWatch,
} from "react-hook-form";

import type { CommonSkillsSectionProps } from "../components/sections/CommonSkillsSection";
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
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type SkillSelectionRowValues,
} from "./values";

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
  const rows = useMemo(
    () =>
      commonSkills.rows.map((row) => ({
        ...row,
        skill: getCommonSkillById(row.skillId),
      })),
    [commonSkills.rows],
  );
  const validation = useMemo(
    () =>
      calculateCommonSkillsValidation(
        build.primaryRyugiLevel + build.ikizamaLevel,
        rows,
      ),
    [build.ikizamaLevel, build.primaryRyugiLevel, rows],
  );

  const setRow = useCallback(
    function setRow(rowId: string, nextRow: SkillSelectionRowValues): void {
      const index = getValues("commonSkills.rows").findIndex(
        (row) => row.rowId === rowId,
      );
      if (index < 0) return;

      update(index, nextRow);
    },
    [getValues, update],
  );
  const onSelect = useCallback(
    (rowId: string, skillId: string) => {
      const current = getValues("commonSkills.rows").find(
        (row) => row.rowId === rowId,
      );
      if (current !== undefined)
        setRow(rowId, { ...current, level: 1, skillId });
    },
    [getValues, setRow],
  );
  const unlockedBonusLevels = useMemo(
    () => getUnlockedCommonSkillBonusLevels(validation.selectedLevelTotal),
    [validation.selectedLevelTotal],
  );
  const sectionProps = useMemo<CommonSkillsSectionProps>(
    () => ({
      basicAttack: getBasicAttackSkill(),
      hasCommonSkillLevelError: validation.hasCommonSkillLevelError,
      invalidAdvancedSkillRowIds: validation.invalidAdvancedSkillRowIds,
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
        const currentRows = getValues("commonSkills.rows");
        const index = currentRows.findIndex((row) => row.rowId === rowId);
        const targetIndex = index + (direction === "up" ? -1 : 1);
        if (index < 0 || targetIndex < 0 || targetIndex >= currentRows.length) {
          return;
        }
        move(index, targetIndex);
      },
      onPickerRequest,
      onRemove: (rowId) => {
        const currentRows = getValues("commonSkills.rows");
        const index = currentRows.findIndex((row) => row.rowId === rowId);
        if (currentRows.length > 1 && index >= 0) remove(index);
      },
      rows,
      selectedLevelTotal: validation.selectedLevelTotal,
      synchronizationKey: defaultValues?.commonSkills,
    }),
    [
      append,
      defaultValues?.commonSkills,
      getValues,
      move,
      onPickerRequest,
      remove,
      rows,
      setRow,
      validation,
    ],
  );
  const presenterState = useMemo(
    () => ({
      candidates: getCommonSkillCandidates(validation.levelLimit),
      onSelect,
      sectionProps,
      unlockedBonusLevels,
    }),
    [onSelect, sectionProps, unlockedBonusLevels, validation.levelLimit],
  );

  return presenterState;
}

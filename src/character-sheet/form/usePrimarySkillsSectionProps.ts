import { useCallback, useMemo } from "react";
import {
  type UseFormReturn,
  useFieldArray,
  useFormState,
  useWatch,
} from "react-hook-form";

import { getRyugiById } from "../../lib/data/ryugi-list";
import type { PrimarySkillsSectionProps } from "../components/sections/PrimarySkillsSection";
import { calculatePrimarySkillsValidation } from "../logic/primary-skills";
import type { PrimarySkillGroups } from "../master-data/primary-skills";
import {
  getMaximumSkillNameLength,
  getPrimarySkillById,
  getPrimarySkillGroups,
} from "../master-data/primary-skills";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type SkillSelectionRowValues,
} from "./values";

type PrimarySkillsSectionOptions = {
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
};

export type PrimarySkillsSectionPresenterState = {
  candidateGroups: PrimarySkillGroups;
  clearSelection: () => void;
  onSelect: (rowId: string, skillId: string) => void;
  sectionProps: PrimarySkillsSectionProps;
};

const maximumSkillNameLength = getMaximumSkillNameLength();

function createPrimarySkillRow(): SkillSelectionRowValues {
  return { level: 1, rowId: crypto.randomUUID(), skillId: null };
}

export default function usePrimarySkillsSectionProps(
  { control, getValues }: UseFormReturn<CharacterSheetFormValues>,
  { onPickerRequest }: PrimarySkillsSectionOptions,
): PrimarySkillsSectionPresenterState {
  const { append, move, remove, replace, update } = useFieldArray({
    control,
    keyName: "fieldKey",
    name: "primarySkills.rows",
  });
  const { defaultValues } = useFormState({ control });
  const build = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.build,
    name: "build",
  });
  const primarySkills = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.primarySkills,
    name: "primarySkills",
  });
  const groups = useMemo(
    () => getPrimarySkillGroups(build.primaryRyugiId, build.primaryRyugiLevel),
    [build.primaryRyugiId, build.primaryRyugiLevel],
  );

  const getRows = useCallback(
    (): SkillSelectionRowValues[] => getValues("primarySkills").rows,
    [getValues],
  );
  const rows = useMemo(
    () =>
      primarySkills.rows.map((row) => ({
        ...row,
        skill: getPrimarySkillById(build.primaryRyugiId, row.skillId),
      })),
    [build.primaryRyugiId, primarySkills.rows],
  );
  const validation = useMemo(
    () => calculatePrimarySkillsValidation(build.primaryRyugiLevel, rows),
    [build.primaryRyugiLevel, rows],
  );
  const clearSelection = useCallback(() => {
    replace(getRows().map((row) => ({ ...row, level: 1, skillId: null })));
  }, [getRows, replace]);
  const onSelect = useCallback(
    (rowId: string, skillId: string) => {
      const currentRows = getRows();
      const index = currentRows.findIndex((row) => row.rowId === rowId);
      const row = currentRows[index];
      if (row !== undefined) update(index, { ...row, level: 1, skillId });
    },
    [getRows, update],
  );
  const sectionProps = useMemo<PrimarySkillsSectionProps>(
    () => ({
      bonusSkills: groups.bonus,
      hasPrimarySkillLevelTotalError: validation.hasPrimarySkillLevelTotalError,
      invalidAdvancedSkillRowIds: validation.invalidAdvancedSkillRowIds,
      invalidDuplicateSkillRowIds: validation.invalidDuplicateSkillRowIds,
      invalidMaximumLevelRowIds: validation.invalidMaximumLevelRowIds,
      maximumSkillNameLength,
      onAdd: () => append(createPrimarySkillRow()),
      onLevelChange: (rowId, value) => {
        const currentRows = getRows();
        const selectedRow = currentRows.find((row) => row.rowId === rowId);
        const level = normalizeIntegerInput(value);
        const index = currentRows.findIndex((row) => row.rowId === rowId);
        if (selectedRow !== undefined && index >= 0) {
          update(index, { ...selectedRow, level });
        }
        return level;
      },
      onPickerRequest,
      onRemove: (rowId) => {
        const currentRows = getRows();
        const index = currentRows.findIndex((row) => row.rowId === rowId);
        if (currentRows.length > 1 && index >= 0) remove(index);
      },
      onMove: (rowId, direction) => {
        const currentRows = getRows();
        const currentIndex = currentRows.findIndex(
          (row) => row.rowId === rowId,
        );
        const targetIndex = currentIndex + (direction === "up" ? -1 : 1);
        if (
          currentIndex < 0 ||
          targetIndex < 0 ||
          targetIndex >= currentRows.length
        )
          return;
        move(currentIndex, targetIndex);
      },
      primaryRyugiName:
        build.primaryRyugiId === null
          ? null
          : (getRyugiById(build.primaryRyugiId)?.name ?? null),
      primaryRyugiSelected: build.primaryRyugiId !== null,
      rows,
      synchronizationKey: defaultValues?.primarySkills,
    }),
    [
      append,
      build.primaryRyugiId,
      defaultValues?.primarySkills,
      getRows,
      groups.bonus,
      move,
      onPickerRequest,
      remove,
      rows,
      update,
      validation,
    ],
  );
  const presenterState = useMemo(
    () => ({ candidateGroups: groups, clearSelection, onSelect, sectionProps }),
    [clearSelection, groups, onSelect, sectionProps],
  );

  return presenterState;
}

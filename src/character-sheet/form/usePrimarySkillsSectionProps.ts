import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";

import { getRyugiById } from "../../lib/data/ryugi-list";
import type { PrimarySkillsSectionProps } from "../components/PrimarySkillsSection";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type SkillSelectionRowValues,
} from "../form-values";
import { calculatePrimarySkillsValidation } from "../logic/primary-skills";
import type { PrimarySkillGroups } from "../master-data/primary-skills";
import {
  getMaximumSkillNameLength,
  getPrimarySkillById,
  getPrimarySkillGroups,
} from "../master-data/primary-skills";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";

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
  const groups = getPrimarySkillGroups(
    build.primaryRyugiId,
    build.primaryRyugiLevel,
  );

  function getRows(): SkillSelectionRowValues[] {
    return getValues("primarySkills").rows;
  }

  const rows = primarySkills.rows.map((row) => ({
    ...row,
    skill: getPrimarySkillById(build.primaryRyugiId, row.skillId),
  }));
  const validation = calculatePrimarySkillsValidation(
    build.primaryRyugiLevel,
    rows,
  );

  return {
    candidateGroups: groups,
    clearSelection: () => {
      replace(getRows().map((row) => ({ ...row, level: 1, skillId: null })));
    },
    onSelect: (rowId, skillId) => {
      const index = getRows().findIndex((row) => row.rowId === rowId);
      const row = getRows()[index];
      if (row !== undefined) update(index, { ...row, level: 1, skillId });
    },
    sectionProps: {
      bonusSkills: groups.bonus,
      hasPrimarySkillLevelTotalError: validation.hasPrimarySkillLevelTotalError,
      invalidDuplicateSkillRowIds: validation.invalidDuplicateSkillRowIds,
      invalidMaximumLevelRowIds: validation.invalidMaximumLevelRowIds,
      maximumSkillNameLength,
      onAdd: () => append(createPrimarySkillRow()),
      onLevelChange: (rowId, value) => {
        const selectedRow = getRows().find((row) => row.rowId === rowId);
        const level = normalizeIntegerInput(value);
        const index = getRows().findIndex((row) => row.rowId === rowId);
        if (selectedRow !== undefined && index >= 0) {
          update(index, { ...selectedRow, level });
        }
        return level;
      },
      onPickerRequest,
      onRemove: (rowId) => {
        const rows = getRows();
        const index = rows.findIndex((row) => row.rowId === rowId);
        if (rows.length > 1 && index >= 0) remove(index);
      },
      onMove: (rowId, direction) => {
        const rows = getRows();
        const currentIndex = rows.findIndex((row) => row.rowId === rowId);
        const targetIndex = currentIndex + (direction === "up" ? -1 : 1);
        if (currentIndex < 0 || targetIndex < 0 || targetIndex >= rows.length) {
          return;
        }
        move(currentIndex, targetIndex);
      },
      primaryRyugiName:
        build.primaryRyugiId === null
          ? null
          : (getRyugiById(build.primaryRyugiId)?.name ?? null),
      primaryRyugiSelected: build.primaryRyugiId !== null,
      rows,
    },
  };
}

import { type UseFormReturn, useWatch } from "react-hook-form";

import { getRyugiById } from "../../lib/data/ryugi-list";
import type { PrimarySkillsSectionProps } from "../components/PrimarySkillsSection";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type PrimarySkillsValues,
  type PrimarySkillValues,
} from "../form-values";
import { calculatePrimarySkillsValidation } from "../logic/primary-skills";
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
  sectionProps: PrimarySkillsSectionProps;
};

const maximumSkillNameLength = getMaximumSkillNameLength();

function createPrimarySkillRow(): PrimarySkillValues {
  return { level: 1, rowId: crypto.randomUUID(), skillId: null };
}

export default function usePrimarySkillsSectionProps(
  { control, getValues, setValue }: UseFormReturn<CharacterSheetFormValues>,
  { onPickerRequest }: PrimarySkillsSectionOptions,
): PrimarySkillsSectionPresenterState {
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

  function setRows(rows: PrimarySkillValues[]): void {
    const next: PrimarySkillsValues = { rows };
    setValue("primarySkills", next, { shouldValidate: true });
  }

  function getRows(): PrimarySkillValues[] {
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
    sectionProps: {
      bonusSkills: groups.bonus,
      candidateGroups: groups,
      hasPrimarySkillLevelTotalError: validation.hasPrimarySkillLevelTotalError,
      invalidMaximumLevelRowIds: validation.invalidMaximumLevelRowIds,
      maximumSkillNameLength,
      onAdd: () => setRows([...getRows(), createPrimarySkillRow()]),
      onLevelChange: (rowId, value) => {
        const selectedRow = getRows().find((row) => row.rowId === rowId);
        const selectedSkill = getPrimarySkillById(
          getValues("build.primaryRyugiId"),
          selectedRow?.skillId ?? null,
        );
        const level = Math.min(
          selectedSkill?.maxLevel ?? Number.POSITIVE_INFINITY,
          Math.max(1, normalizeIntegerInput(value)),
        );
        setRows(
          getRows().map((row) =>
            row.rowId === rowId ? { ...row, level } : row,
          ),
        );
        return level;
      },
      onPickerRequest,
      onRemove: (rowId) => {
        const rows = getRows();
        if (rows.length <= 1) return;
        setRows(rows.filter((row) => row.rowId !== rowId));
      },
      onReorder: (draggedRowId, targetRowId) => {
        if (draggedRowId === targetRowId) return;
        const rows = [...getRows()];
        const fromIndex = rows.findIndex((row) => row.rowId === draggedRowId);
        const targetIndex = rows.findIndex((row) => row.rowId === targetRowId);
        if (fromIndex < 0 || targetIndex < 0) return;
        const [dragged] = rows.splice(fromIndex, 1);
        if (dragged === undefined) return;
        rows.splice(targetIndex, 0, dragged);
        setRows(rows);
      },
      onSelect: (rowId, skillId) => {
        setRows(
          getRows().map((row) =>
            row.rowId === rowId ? { ...row, level: 1, skillId } : row,
          ),
        );
      },
      onSelectionClear: () => {
        setRows(getRows().map((row) => ({ ...row, level: 1, skillId: null })));
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

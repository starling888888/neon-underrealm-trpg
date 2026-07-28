import {
  type UseFormReturn,
  useFieldArray,
  useFormState,
  useWatch,
} from "react-hook-form";

import { getRyugiById } from "../../lib/data/ryugi-list";
import type { OtherRyugiSkillsSectionProps } from "../components/OtherRyugiSkillsSection";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type OtherRyugiSkillValues,
} from "../form-values";
import { calculateOtherRyugiSkillsValidation } from "../logic/other-ryugi-skills";
import type { OtherRyugiSkillGroups } from "../master-data/other-ryugi-skills";
import {
  getOtherRyugiSkillById,
  getOtherRyugiSkillGroups,
} from "../master-data/other-ryugi-skills";
import { getMaximumSkillNameLength } from "../master-data/primary-skills";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";

type OtherRyugiSkillsSectionOptions = {
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
};

export type OtherRyugiSkillsSectionPresenterState = {
  addInitialRow: (ryugiRowId: string) => void;
  clearSelection: (ryugiRowId: string) => void;
  getCandidateGroups: (ryugiRowId: string) => OtherRyugiSkillGroups;
  getSelectedSkillIds: (ryugiRowId: string) => readonly string[];
  onSelect: (rowId: string, skillId: string) => void;
  removeRows: (ryugiRowId: string) => void;
  sectionProps: OtherRyugiSkillsSectionProps;
};

const maximumSkillNameLength = getMaximumSkillNameLength();

function createOtherRyugiSkillRow(ryugiRowId: string): OtherRyugiSkillValues {
  return {
    level: 1,
    rowId: crypto.randomUUID(),
    ryugiRowId,
    skillId: null,
  };
}

/** Connects the flat other-ryugi skill field array to shared section props. */
export default function useOtherRyugiSkillsSectionProps(
  { control, getValues }: UseFormReturn<CharacterSheetFormValues>,
  { onPickerRequest }: OtherRyugiSkillsSectionOptions,
): OtherRyugiSkillsSectionPresenterState {
  const { append, move, remove, replace, update } = useFieldArray({
    control,
    keyName: "fieldKey",
    name: "otherRyugiSkills.rows",
  });
  const { defaultValues } = useFormState({ control });
  const build = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.build,
    name: "build",
  });
  const otherRyugiSkills = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.otherRyugiSkills,
    name: "otherRyugiSkills",
  });
  const rowsWithSkills = otherRyugiSkills.rows.map((row) => {
    const ryugi = build.otherRyugi.find(
      (otherRyugi) => otherRyugi.rowId === row.ryugiRowId,
    );

    return {
      ...row,
      skill: getOtherRyugiSkillById(ryugi?.ryugiId ?? null, row.skillId),
    };
  });
  const validation = calculateOtherRyugiSkillsValidation(
    build.otherRyugi,
    rowsWithSkills,
  );

  function getRows(): OtherRyugiSkillValues[] {
    return getValues("otherRyugiSkills.rows");
  }

  function findRowIndex(rowId: string): number {
    return getRows().findIndex((row) => row.rowId === rowId);
  }

  function getRowsForRyugi(ryugiRowId: string): OtherRyugiSkillValues[] {
    return getRows().filter((row) => row.ryugiRowId === ryugiRowId);
  }

  return {
    addInitialRow: (ryugiRowId) => append(createOtherRyugiSkillRow(ryugiRowId)),
    clearSelection: (ryugiRowId) => {
      replace(
        getRows().map((row) =>
          row.ryugiRowId === ryugiRowId
            ? { ...row, level: 1, skillId: null }
            : row,
        ),
      );
    },
    getCandidateGroups: (ryugiRowId) => {
      const ryugi = build.otherRyugi.find(
        (otherRyugi) => otherRyugi.rowId === ryugiRowId,
      );

      return getOtherRyugiSkillGroups(
        ryugi?.ryugiId ?? null,
        ryugi?.level ?? 0,
      );
    },
    getSelectedSkillIds: (ryugiRowId) =>
      getRowsForRyugi(ryugiRowId).flatMap((row) =>
        row.skillId === null ? [] : [row.skillId],
      ),
    onSelect: (rowId, skillId) => {
      const index = findRowIndex(rowId);
      const row = getRows()[index];
      if (row === undefined) return;

      update(index, { ...row, level: 1, skillId });
    },
    removeRows: (ryugiRowId) => {
      const indexes = getRows().flatMap((row, index) =>
        row.ryugiRowId === ryugiRowId ? [index] : [],
      );
      if (indexes.length > 0) remove(indexes);
    },
    sectionProps: {
      maximumSkillNameLength,
      onAdd: (ryugiRowId) => append(createOtherRyugiSkillRow(ryugiRowId)),
      onLevelChange: (rowId, value) => {
        const index = findRowIndex(rowId);
        const row = getRows()[index];
        if (row === undefined) return normalizeIntegerInput(value);

        const level = normalizeIntegerInput(value);
        update(index, { ...row, level });
        return level;
      },
      onMove: (rowId, direction) => {
        const row = getRows().find((current) => current.rowId === rowId);
        if (row === undefined) return;

        const ownerRows = getRowsForRyugi(row.ryugiRowId);
        const currentIndex = ownerRows.findIndex(
          (current) => current.rowId === rowId,
        );
        const targetOwnerIndex = currentIndex + (direction === "up" ? -1 : 1);
        if (
          currentIndex < 0 ||
          targetOwnerIndex < 0 ||
          targetOwnerIndex >= ownerRows.length
        ) {
          return;
        }

        const targetRow = ownerRows[targetOwnerIndex];
        if (targetRow === undefined) return;

        const currentFieldIndex = findRowIndex(rowId);
        const targetFieldIndex = findRowIndex(targetRow.rowId);
        if (currentFieldIndex < 0 || targetFieldIndex < 0) return;

        move(currentFieldIndex, targetFieldIndex);
      },
      onPickerRequest,
      onRemove: (rowId) => {
        const row = getRows().find((current) => current.rowId === rowId);
        if (row === undefined || getRowsForRyugi(row.ryugiRowId).length <= 1) {
          return;
        }

        const index = findRowIndex(rowId);
        if (index >= 0) remove(index);
      },
      sections: build.otherRyugi.map((ryugi) => ({
        hasSkillLevelTotalError: validation.invalidRyugiRowIds.includes(
          ryugi.rowId,
        ),
        invalidAdvancedSkillRowIds: validation.invalidAdvancedSkillRowIds,
        invalidDuplicateSkillRowIds: validation.invalidDuplicateSkillRowIds,
        invalidMaximumLevelRowIds: validation.invalidMaximumLevelRowIds,
        rows: rowsWithSkills.filter((row) => row.ryugiRowId === ryugi.rowId),
        ryugiName:
          ryugi.ryugiId === null
            ? null
            : (getRyugiById(ryugi.ryugiId)?.name ?? null),
        ryugiRowId: ryugi.rowId,
        ryugiSelected: ryugi.ryugiId !== null,
      })),
      synchronizationKey: defaultValues?.otherRyugiSkills,
    },
  };
}

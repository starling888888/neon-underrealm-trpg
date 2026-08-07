import { useCallback, useMemo } from "react";
import {
  type UseFormReturn,
  useFieldArray,
  useFormState,
  useWatch,
} from "react-hook-form";

import { getRyugiById } from "../../lib/data/ryugi-list";
import type { OtherRyugiSkillsSectionProps } from "../components/sections/OtherRyugiSkillsSection";
import { calculateOtherRyugiSkillsValidation } from "../logic/other-ryugi-skills";
import type { OtherRyugiSkillGroups } from "../master-data/other-ryugi-skills";
import {
  getOtherRyugiSkillById,
  getOtherRyugiSkillGroups,
} from "../master-data/other-ryugi-skills";
import { getMaximumSkillNameLength } from "../master-data/primary-skills";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type OtherRyugiSkillValues,
} from "./values";

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
  const rowsWithSkills = useMemo(
    () =>
      otherRyugiSkills.rows.map((row) => {
        const ryugi = build.otherRyugi.find(
          (otherRyugi) => otherRyugi.rowId === row.ryugiRowId,
        );

        return {
          ...row,
          skill: getOtherRyugiSkillById(ryugi?.ryugiId ?? null, row.skillId),
        };
      }),
    [build.otherRyugi, otherRyugiSkills.rows],
  );
  const validation = useMemo(
    () => calculateOtherRyugiSkillsValidation(build.otherRyugi, rowsWithSkills),
    [build.otherRyugi, rowsWithSkills],
  );

  const getRows = useCallback(
    (): OtherRyugiSkillValues[] => getValues("otherRyugiSkills.rows"),
    [getValues],
  );

  const findRowIndex = useCallback(
    (rowId: string): number =>
      getRows().findIndex((row) => row.rowId === rowId),
    [getRows],
  );

  const getRowsForRyugi = useCallback(
    (ryugiRowId: string): OtherRyugiSkillValues[] =>
      getRows().filter((row) => row.ryugiRowId === ryugiRowId),
    [getRows],
  );

  const addInitialRow = useCallback(
    (ryugiRowId: string) => append(createOtherRyugiSkillRow(ryugiRowId)),
    [append],
  );
  const clearSelection = useCallback(
    (ryugiRowId: string) => {
      replace(
        getRows().map((row) =>
          row.ryugiRowId === ryugiRowId
            ? { ...row, level: 1, skillId: null }
            : row,
        ),
      );
    },
    [getRows, replace],
  );
  const getCandidateGroups = useCallback(
    (ryugiRowId: string) => {
      const ryugi = build.otherRyugi.find(
        (otherRyugi) => otherRyugi.rowId === ryugiRowId,
      );
      return getOtherRyugiSkillGroups(
        ryugi?.ryugiId ?? null,
        ryugi?.level ?? 0,
      );
    },
    [build.otherRyugi],
  );
  const getSelectedSkillIds = useCallback(
    (ryugiRowId: string) =>
      getRowsForRyugi(ryugiRowId).flatMap((row) =>
        row.skillId === null ? [] : [row.skillId],
      ),
    [getRowsForRyugi],
  );
  const onSelect = useCallback(
    (rowId: string, skillId: string) => {
      const index = findRowIndex(rowId);
      const row = getRows()[index];
      if (row !== undefined) update(index, { ...row, level: 1, skillId });
    },
    [findRowIndex, getRows, update],
  );
  const removeRows = useCallback(
    (ryugiRowId: string) => {
      const indexes = getRows().flatMap((row, index) =>
        row.ryugiRowId === ryugiRowId ? [index] : [],
      );
      if (indexes.length > 0) remove(indexes);
    },
    [getRows, remove],
  );
  const onLevelChange = useCallback(
    (rowId: string, value: string) => {
      const index = findRowIndex(rowId);
      const row = getRows()[index];
      if (row === undefined) return normalizeIntegerInput(value);
      const level = normalizeIntegerInput(value);
      update(index, { ...row, level });
      return level;
    },
    [findRowIndex, getRows, update],
  );
  const onMove = useCallback(
    (rowId: string, direction: "up" | "down") => {
      const row = getRows().find((current) => current.rowId === rowId);
      if (row === undefined) return;
      const ownerRows = getRowsForRyugi(row.ryugiRowId);
      const currentIndex = ownerRows.findIndex(
        (current) => current.rowId === rowId,
      );
      const targetOwnerIndex = currentIndex + (direction === "up" ? -1 : 1);
      if (targetOwnerIndex < 0 || targetOwnerIndex >= ownerRows.length) return;
      const targetRow = ownerRows[targetOwnerIndex];
      if (targetRow === undefined) return;
      const currentFieldIndex = findRowIndex(rowId);
      const targetFieldIndex = findRowIndex(targetRow.rowId);
      if (currentFieldIndex >= 0 && targetFieldIndex >= 0) {
        move(currentFieldIndex, targetFieldIndex);
      }
    },
    [findRowIndex, getRows, getRowsForRyugi, move],
  );
  const onRemove = useCallback(
    (rowId: string) => {
      const row = getRows().find((current) => current.rowId === rowId);
      if (row === undefined || getRowsForRyugi(row.ryugiRowId).length <= 1)
        return;
      const index = findRowIndex(rowId);
      if (index >= 0) remove(index);
    },
    [findRowIndex, getRows, getRowsForRyugi, remove],
  );
  const sections = useMemo(
    () =>
      build.otherRyugi.map((ryugi) => ({
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
    [build.otherRyugi, rowsWithSkills, validation],
  );
  const sectionProps = useMemo(
    () => ({
      maximumSkillNameLength,
      onAdd: addInitialRow,
      onLevelChange,
      onMove,
      onPickerRequest,
      onRemove,
      sections,
      synchronizationKey: defaultValues?.otherRyugiSkills,
    }),
    [
      addInitialRow,
      defaultValues?.otherRyugiSkills,
      onLevelChange,
      onMove,
      onPickerRequest,
      onRemove,
      sections,
    ],
  );

  return useMemo(
    () => ({
      addInitialRow,
      clearSelection,
      getCandidateGroups,
      getSelectedSkillIds,
      onSelect,
      removeRows,
      sectionProps,
    }),
    [
      addInitialRow,
      clearSelection,
      getCandidateGroups,
      getSelectedSkillIds,
      onSelect,
      removeRows,
      sectionProps,
    ],
  );
}

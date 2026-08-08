import { useCallback, useMemo } from "react";
import {
  type UseFormReturn,
  useFieldArray,
  useFormState,
  useWatch,
} from "react-hook-form";

import { getIkizamaById } from "../../lib/data/ikizama";
import type { IkizamaSkillsSectionProps } from "../components/sections/IkizamaSkillsSection";
import { calculateIkizamaSkillsValidation } from "../logic/ikizama-skills";
import type { IkizamaSkillGroups } from "../master-data/ikizama-skills";
import {
  getIkizamaSkillById,
  getIkizamaSkillGroups,
} from "../master-data/ikizama-skills";
import { getMaximumSkillNameLength } from "../master-data/primary-skills";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type SkillSelectionRowValues,
} from "./values";

type IkizamaSkillsSectionOptions = {
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
};

export type IkizamaSkillsSectionPresenterState = {
  candidateGroups: IkizamaSkillGroups;
  clearSelection: () => void;
  onSelect: (rowId: string, skillId: string) => void;
  sectionProps: IkizamaSkillsSectionProps;
};

const maximumSkillNameLength = getMaximumSkillNameLength();

function createIkizamaSkillRow(): SkillSelectionRowValues {
  return { level: 1, rowId: crypto.randomUUID(), skillId: null };
}

/** Connects ikizama skills to RHF while keeping display adaptation local. */
export default function useIkizamaSkillsSectionProps(
  { control, getValues, setValue }: UseFormReturn<CharacterSheetFormValues>,
  { onPickerRequest }: IkizamaSkillsSectionOptions,
): IkizamaSkillsSectionPresenterState {
  const { append, move, remove, replace, update } = useFieldArray({
    control,
    keyName: "fieldKey",
    name: "ikizamaSkills.rows",
  });
  const { defaultValues } = useFormState({ control });
  const build = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.build,
    name: "build",
  });
  const ikizamaSkills = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.ikizamaSkills,
    name: "ikizamaSkills",
  });

  const groups = useMemo(
    () => getIkizamaSkillGroups(build.ikizamaId, build.ikizamaLevel),
    [build.ikizamaId, build.ikizamaLevel],
  );
  const rows = useMemo(
    () =>
      ikizamaSkills.rows.map((row) => ({
        ...row,
        skill: getIkizamaSkillById(build.ikizamaId, row.skillId),
      })),
    [build.ikizamaId, ikizamaSkills.rows],
  );
  const bonusSkill = groups.bonus[0] ?? null;
  const validation = useMemo(
    () =>
      calculateIkizamaSkillsValidation(
        build.ikizamaLevel,
        ikizamaSkills.bonusLevel,
        bonusSkill,
        rows,
      ),
    [build.ikizamaLevel, bonusSkill, ikizamaSkills.bonusLevel, rows],
  );

  const setRow = useCallback(
    (rowId: string, nextRow: SkillSelectionRowValues): void => {
      const index = getValues("ikizamaSkills.rows").findIndex(
        (row) => row.rowId === rowId,
      );
      if (index < 0) return;

      update(index, nextRow);
    },
    [getValues, update],
  );

  const clearSelection = useCallback(() => {
    const rows = getValues("ikizamaSkills.rows");
    replace(rows.map((row) => ({ ...row, level: 1, skillId: null })));
  }, [getValues, replace]);
  const onSelect = useCallback(
    (rowId: string, skillId: string) => {
      const current = getValues("ikizamaSkills.rows").find(
        (row) => row.rowId === rowId,
      );
      if (current !== undefined) {
        setRow(rowId, { ...current, level: 1, skillId });
      }
    },
    [getValues, setRow],
  );
  const sectionProps = useMemo<IkizamaSkillsSectionProps>(
    () => ({
      bonusLevel: ikizamaSkills.bonusLevel,
      bonusSkill,
      hasIkizamaSkillLevelTotalError: validation.hasIkizamaSkillLevelTotalError,
      invalidAdvancedSkillRowIds: validation.invalidAdvancedSkillRowIds,
      invalidDuplicateSkillRowIds: validation.invalidDuplicateSkillRowIds,
      invalidMaximumLevelRowIds: validation.invalidMaximumLevelRowIds,
      ikizamaName:
        build.ikizamaId === null
          ? null
          : (getIkizamaById(build.ikizamaId)?.name ?? null),
      ikizamaSelected: build.ikizamaId !== null,
      maximumSkillNameLength,
      onAdd: () => append(createIkizamaSkillRow()),
      onLevelChange: (rowId, value) => {
        if (rowId === `ikizama-bonus-${bonusSkill?.id}`) {
          const level = normalizeIntegerInput(value);
          setValue("ikizamaSkills.bonusLevel", level, {
            shouldValidate: true,
          });
          return level;
        }

        const current = getValues("ikizamaSkills.rows").find(
          (row) => row.rowId === rowId,
        );
        const level = normalizeIntegerInput(value);
        if (current !== undefined) setRow(rowId, { ...current, level });
        return level;
      },
      onPickerRequest,
      onRemove: (rowId) => {
        const rows = getValues("ikizamaSkills.rows");
        const index = rows.findIndex((row) => row.rowId === rowId);
        if (index >= 0) remove(index);
      },
      onMove: (rowId, direction) => {
        const rows = getValues("ikizamaSkills.rows");
        const index = rows.findIndex((row) => row.rowId === rowId);
        const targetIndex = index + (direction === "up" ? -1 : 1);
        if (index < 0 || targetIndex < 0 || targetIndex >= rows.length) return;
        move(index, targetIndex);
      },
      rows,
      synchronizationKey: defaultValues?.ikizamaSkills,
    }),
    [
      append,
      bonusSkill,
      build.ikizamaId,
      getValues,
      ikizamaSkills.bonusLevel,
      move,
      onPickerRequest,
      remove,
      rows,
      setRow,
      setValue,
      validation,
      defaultValues?.ikizamaSkills,
    ],
  );

  return useMemo(
    () => ({ candidateGroups: groups, clearSelection, onSelect, sectionProps }),
    [clearSelection, groups, onSelect, sectionProps],
  );
}

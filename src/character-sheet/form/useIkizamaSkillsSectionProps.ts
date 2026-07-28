import { useEffect, useRef } from "react";
import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";

import { getIkizamaById } from "../../lib/data/ikizama";
import type { IkizamaSkillsSectionProps } from "../components/IkizamaSkillsSection";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type PrimarySkillValues,
} from "../form-values";
import { calculateIkizamaSkillsValidation } from "../logic/ikizama-skills";
import type { IkizamaSkillGroups } from "../master-data/ikizama-skills";
import {
  getIkizamaSkillById,
  getIkizamaSkillGroups,
} from "../master-data/ikizama-skills";
import { getMaximumSkillNameLength } from "../master-data/primary-skills";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";

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

function createIkizamaSkillRow(): PrimarySkillValues {
  return { level: 1, rowId: crypto.randomUUID(), skillId: null };
}

/** Connects ikizama skills to RHF while keeping display adaptation local. */
export default function useIkizamaSkillsSectionProps(
  { control, getValues, setValue }: UseFormReturn<CharacterSheetFormValues>,
  { onPickerRequest }: IkizamaSkillsSectionOptions,
): IkizamaSkillsSectionPresenterState {
  const previousIkizamaIdRef = useRef<string | null>(
    getValues("build.ikizamaId"),
  );
  const { append, move, remove, replace } = useFieldArray({
    control,
    keyName: "fieldKey",
    name: "ikizamaSkills.rows",
  });
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

  useEffect(() => {
    if (previousIkizamaIdRef.current === build.ikizamaId) return;

    previousIkizamaIdRef.current = build.ikizamaId;
    setValue("ikizamaSkills.bonusLevel", 1, { shouldValidate: true });
  }, [build.ikizamaId, setValue]);

  const groups = getIkizamaSkillGroups(build.ikizamaId, build.ikizamaLevel);
  const rows = ikizamaSkills.rows.map((row) => ({
    ...row,
    skill: getIkizamaSkillById(build.ikizamaId, row.skillId),
  }));
  const bonusSkill = groups.bonus[0] ?? null;
  const validation = calculateIkizamaSkillsValidation(
    build.ikizamaLevel,
    ikizamaSkills.bonusLevel,
    rows,
  );

  function setRow(rowId: string, nextRow: PrimarySkillValues): void {
    const index = getValues("ikizamaSkills.rows").findIndex(
      (row) => row.rowId === rowId,
    );
    if (index < 0) return;

    setValue(`ikizamaSkills.rows.${index}`, nextRow, { shouldValidate: true });
  }

  return {
    candidateGroups: groups,
    clearSelection: () => {
      const rows = getValues("ikizamaSkills.rows");
      replace(rows.map((row) => ({ ...row, level: 1, skillId: null })));
    },
    onSelect: (rowId, skillId) => {
      const current = getValues("ikizamaSkills.rows").find(
        (row) => row.rowId === rowId,
      );
      if (current !== undefined) {
        setRow(rowId, { ...current, level: 1, skillId });
      }
    },
    sectionProps: {
      bonusLevel: ikizamaSkills.bonusLevel,
      bonusSkill,
      hasIkizamaSkillLevelTotalError: validation.hasIkizamaSkillLevelTotalError,
      ikizamaName:
        build.ikizamaId === null
          ? null
          : (getIkizamaById(build.ikizamaId)?.name ?? null),
      ikizamaSelected: build.ikizamaId !== null,
      maximumSkillNameLength,
      onAdd: () => append(createIkizamaSkillRow()),
      onLevelChange: (rowId, value) => {
        if (rowId === `ikizama-bonus-${bonusSkill?.id}`) {
          const level = Math.max(1, normalizeIntegerInput(value));
          setValue("ikizamaSkills.bonusLevel", level, {
            shouldValidate: true,
          });
          return level;
        }

        const current = getValues("ikizamaSkills.rows").find(
          (row) => row.rowId === rowId,
        );
        const skill = getIkizamaSkillById(
          build.ikizamaId,
          current?.skillId ?? null,
        );
        const level = Math.min(
          skill?.maxLevel ?? Number.POSITIVE_INFINITY,
          Math.max(1, normalizeIntegerInput(value)),
        );
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
    },
  };
}

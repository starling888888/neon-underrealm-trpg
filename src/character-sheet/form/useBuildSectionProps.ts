import { type RefObject, useCallback, useMemo } from "react";
import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";

import type { BuildSectionProps } from "../components/BuildSection";
import {
  type AttributeName,
  type AttributeValues,
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type OtherRyugiEditableFieldName,
} from "../form-values";
import { type BuildDerivedValues, calculateBuild } from "../logic/build";
import {
  getCharacterSheetIkizamaOptions,
  getCharacterSheetRyugiOptions,
} from "../master-data/build";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";

export type BuildSectionPresenterState = {
  derivedBuild: BuildDerivedValues;
  onAcquiredExperienceChange: (value: string) => number;
  sectionProps: BuildSectionProps;
};

type UseBuildSectionPropsOptions = {
  commonSkillLevelTotal?: number;
  onIkizamaChangeRequested?: (
    ikizamaId: string | null,
    trigger: HTMLSelectElement,
    applyChange: () => void,
  ) => void;
  onPrimaryRyugiChangeRequested?: (
    primaryRyugiId: string | null,
    trigger: HTMLSelectElement,
    applyChange: () => void,
  ) => void;
  onOtherRyugiAdded?: (rowId: string) => void;
  otherRyugiAddButtonRef?: RefObject<HTMLButtonElement | null>;
  onOtherRyugiChangeRequested?: (
    rowId: string,
    ryugiId: string | null,
    trigger: HTMLSelectElement,
    applyChange: () => void,
  ) => void;
  onOtherRyugiRemoveRequested?: (
    rowId: string,
    trigger: HTMLButtonElement,
    applyChange: () => void,
  ) => void;
};

export default function useBuildSectionProps(
  { control, getValues, setValue }: UseFormReturn<CharacterSheetFormValues>,
  {
    onIkizamaChangeRequested,
    commonSkillLevelTotal = 0,
    onOtherRyugiAdded,
    otherRyugiAddButtonRef,
    onOtherRyugiChangeRequested,
    onOtherRyugiRemoveRequested,
    onPrimaryRyugiChangeRequested,
  }: UseBuildSectionPropsOptions = {},
): BuildSectionPresenterState {
  const { append, remove, update } = useFieldArray({
    control,
    keyName: "fieldKey",
    name: "build.otherRyugi",
  });
  const build = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.build,
    name: "build",
  });
  const derivedBuild = useMemo(
    () => calculateBuild(build, commonSkillLevelTotal),
    [build, commonSkillLevelTotal],
  );

  const setAttributeValue = useCallback(
    function setAttributeValue(
      attribute: AttributeName,
      field: keyof AttributeValues,
      value: string,
    ): number {
      const normalizedValue = normalizeIntegerInput(value);

      setValue(`build.attributes.${attribute}.${field}`, normalizedValue, {
        shouldValidate: true,
      });

      return normalizedValue;
    },
    [setValue],
  );

  const setOtherRyugiValue = useCallback(
    function setOtherRyugiValue(
      index: number,
      field: OtherRyugiEditableFieldName,
      value: string,
    ): number | undefined {
      const entry = getValues("build.otherRyugi")[index];
      if (entry === undefined) return undefined;

      update(
        index,
        field === "ryugiId"
          ? { ...entry, ryugiId: value || null }
          : { ...entry, level: normalizeIntegerInput(value) },
      );

      return field === "level" ? normalizeIntegerInput(value) : undefined;
    },
    [getValues, update],
  );

  const onAcquiredExperienceChange = useCallback(
    function onAcquiredExperienceChange(value: string): number {
      const normalizedValue = normalizeIntegerInput(value);

      setValue("build.acquiredExperience", normalizedValue, {
        shouldValidate: true,
      });

      return normalizedValue;
    },
    [setValue],
  );

  const sectionProps = useMemo<BuildSectionProps>(
    () => ({
      build,
      derived: derivedBuild,
      hasIkizamaSkillLevelError: false,
      invalidOtherRyugiSkillLevelRowIds: [],
      hasPrimarySkillLevelError: false,
      ikizamaOptions: getCharacterSheetIkizamaOptions(),
      onAttributeChange: setAttributeValue,
      onAttributeCommit: setAttributeValue,
      onIkizamaChange: (ikizamaId, trigger) => {
        const applyChange = () => {
          if (getValues("build.ikizamaId") !== ikizamaId) {
            setValue("ikizamaSkills.bonusLevel", 1, {
              shouldValidate: true,
            });
          }
          setValue("build.ikizamaId", ikizamaId, { shouldValidate: true });
        };
        if (trigger !== undefined && onIkizamaChangeRequested !== undefined) {
          onIkizamaChangeRequested(ikizamaId, trigger, applyChange);
          return;
        }
        applyChange();
      },
      onIkizamaLevelChange: (value) => {
        const normalizedValue = normalizeIntegerInput(value);
        setValue("build.ikizamaLevel", normalizedValue, {
          shouldValidate: true,
        });
        return normalizedValue;
      },
      onOtherRyugiAdd: () => {
        const nextRow = {
          level: 0,
          rowId: crypto.randomUUID(),
          ryugiId: null,
        };
        append(nextRow);
        onOtherRyugiAdded?.(nextRow.rowId);
      },
      otherRyugiAddButtonRef,
      onOtherRyugiChange: (index, field, value, trigger) => {
        if (field !== "ryugiId") {
          void setOtherRyugiValue(index, field, value);
          return;
        }

        const row = getValues("build").otherRyugi[index];
        const ryugiId = value || null;
        const applyChange = () => {
          void setOtherRyugiValue(index, field, value);
        };

        if (
          row !== undefined &&
          trigger !== undefined &&
          onOtherRyugiChangeRequested !== undefined
        ) {
          onOtherRyugiChangeRequested(row.rowId, ryugiId, trigger, applyChange);
          return;
        }

        applyChange();
      },
      onOtherRyugiCommit: (index, value) =>
        setOtherRyugiValue(index, "level", value) ?? 0,
      onOtherRyugiRemove: (index, trigger) => {
        const row = getValues("build").otherRyugi[index];
        const applyChange = () => {
          remove(index);
        };

        if (
          row !== undefined &&
          trigger !== undefined &&
          onOtherRyugiRemoveRequested !== undefined
        ) {
          onOtherRyugiRemoveRequested(row.rowId, trigger, applyChange);
          return;
        }

        applyChange();
      },
      onPrimaryRyugiChange: (primaryRyugiId, trigger) => {
        const applyChange = () => {
          setValue("build.primaryRyugiId", primaryRyugiId, {
            shouldValidate: true,
          });
        };

        if (
          trigger !== undefined &&
          onPrimaryRyugiChangeRequested !== undefined
        ) {
          onPrimaryRyugiChangeRequested(primaryRyugiId, trigger, applyChange);
          return;
        }

        applyChange();
      },
      onPrimaryRyugiLevelChange: (value) => {
        const normalizedValue = normalizeIntegerInput(value);
        setValue("build.primaryRyugiLevel", normalizedValue, {
          shouldValidate: true,
        });
        return normalizedValue;
      },
      onPrimaryRyugiLevelCommit: (value) => {
        const normalizedValue = normalizeIntegerInput(value);
        setValue("build.primaryRyugiLevel", normalizedValue, {
          shouldValidate: true,
        });
        return normalizedValue;
      },
      ryugiOptions: getCharacterSheetRyugiOptions(),
      unlockedCommonSkillBonusLevels: [],
    }),
    [
      append,
      build,
      derivedBuild,
      getValues,
      onIkizamaChangeRequested,
      onOtherRyugiAdded,
      onOtherRyugiChangeRequested,
      onOtherRyugiRemoveRequested,
      onPrimaryRyugiChangeRequested,
      otherRyugiAddButtonRef,
      remove,
      setAttributeValue,
      setOtherRyugiValue,
      setValue,
    ],
  );
  const presenterState = useMemo(
    () => ({
      derivedBuild,
      onAcquiredExperienceChange,
      sectionProps,
    }),
    [derivedBuild, onAcquiredExperienceChange, sectionProps],
  );

  return presenterState;
}

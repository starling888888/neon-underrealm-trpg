import type { RefObject } from "react";
import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";

import type { BuildSectionProps } from "../components/BuildSection";
import {
  type AttributeName,
  type AttributeValues,
  type BuildValues,
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
  const derivedBuild = calculateBuild(build, commonSkillLevelTotal);

  function setBuildValue<K extends keyof BuildValues>(
    field: K,
    value: BuildValues[K],
  ): void {
    const nextBuild: BuildValues = { ...getValues("build"), [field]: value };

    setValue("build", nextBuild, { shouldValidate: true });
  }

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
  }

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
  }

  function onAcquiredExperienceChange(value: string): number {
    const normalizedValue = normalizeIntegerInput(value);

    setBuildValue("acquiredExperience", normalizedValue);

    return normalizedValue;
  }

  return {
    derivedBuild,
    onAcquiredExperienceChange,
    sectionProps: {
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
          setBuildValue("ikizamaId", ikizamaId);
        };
        if (trigger !== undefined && onIkizamaChangeRequested !== undefined) {
          onIkizamaChangeRequested(ikizamaId, trigger, applyChange);
          return;
        }
        applyChange();
      },
      onIkizamaLevelChange: (value) => {
        const normalizedValue = normalizeIntegerInput(value);
        setBuildValue("ikizamaLevel", normalizedValue);
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
          setBuildValue("primaryRyugiId", primaryRyugiId);
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
        setBuildValue("primaryRyugiLevel", normalizedValue);
        return normalizedValue;
      },
      onPrimaryRyugiLevelCommit: (value) => {
        const normalizedValue = normalizeIntegerInput(value);
        setBuildValue("primaryRyugiLevel", normalizedValue);
        return normalizedValue;
      },
      ryugiOptions: getCharacterSheetRyugiOptions(),
      unlockedCommonSkillBonusLevels: [],
    },
  };
}

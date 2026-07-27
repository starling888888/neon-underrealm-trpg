import { type UseFormReturn, useWatch } from "react-hook-form";

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
  onPrimaryRyugiChangeRequested?: (
    primaryRyugiId: string | null,
    trigger: HTMLSelectElement,
    applyChange: () => void,
  ) => void;
};

export default function useBuildSectionProps(
  { control, getValues, setValue }: UseFormReturn<CharacterSheetFormValues>,
  { onPrimaryRyugiChangeRequested }: UseBuildSectionPropsOptions = {},
): BuildSectionPresenterState {
  const build = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.build,
    name: "build",
  });
  const derivedBuild = calculateBuild(build);

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
    const otherRyugi = getValues("build").otherRyugi.map(
      (entry, entryIndex) => {
        if (entryIndex !== index) {
          return entry;
        }

        if (field === "ryugiId") {
          return { ...entry, ryugiId: value || null };
        }

        return { ...entry, level: normalizeIntegerInput(value) };
      },
    );

    setBuildValue("otherRyugi", otherRyugi);

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
      hasPrimarySkillLevelError: false,
      ikizamaOptions: getCharacterSheetIkizamaOptions(),
      onAttributeChange: setAttributeValue,
      onAttributeCommit: setAttributeValue,
      onIkizamaChange: (ikizamaId) => {
        setBuildValue("ikizamaId", ikizamaId);
      },
      onIkizamaLevelChange: (value) => {
        const normalizedValue = normalizeIntegerInput(value);
        setBuildValue("ikizamaLevel", normalizedValue);
        return normalizedValue;
      },
      onOtherRyugiAdd: () => {
        setBuildValue("otherRyugi", [
          ...getValues("build").otherRyugi,
          { level: 0, rowId: crypto.randomUUID(), ryugiId: null },
        ]);
      },
      onOtherRyugiChange: (index, field, value) => {
        void setOtherRyugiValue(index, field, value);
      },
      onOtherRyugiCommit: (index, value) =>
        setOtherRyugiValue(index, "level", value) ?? 0,
      onOtherRyugiRemove: (index) => {
        setBuildValue(
          "otherRyugi",
          getValues("build").otherRyugi.filter(
            (_, entryIndex) => entryIndex !== index,
          ),
        );
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
    },
  };
}

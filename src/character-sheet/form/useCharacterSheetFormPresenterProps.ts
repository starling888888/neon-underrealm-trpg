import { type UseFormReturn, useWatch } from "react-hook-form";

import type { CharacterImageRecord } from "../character-image";
import type { CharacterSheetFormPresenterProps } from "../components/CharacterSheetFormPresenter";
import {
  type AttributeName,
  type AttributeValues,
  type BuildValues,
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type OtherRyugiValues,
} from "../form-values";
import { calculateBuild } from "../logic/build";
import { calculateCredit } from "../logic/credit";
import {
  getCharacterSheetIkizamaOptions,
  getCharacterSheetRyugiOptions,
} from "../master-data/build";
import {
  normalizeBuildInput,
  normalizeCreditInput,
} from "../schemas/character-sheet-form";

/**
 * Composes the props consumed by the form presenter.
 *
 * It translates RHF state into focused section props without exposing RHF
 * below the presenter boundary.
 */
type CharacterImagePresenterState = {
  characterImage: CharacterImageRecord | null;
  isRootOperationInProgress: boolean;
  onCharacterImageCleared: () => Promise<void>;
  onCharacterImageSelected: (file: File) => Promise<void>;
  onCharacterImageOperationStarted: (trigger: HTMLButtonElement) => void;
};

export default function useCharacterSheetFormPresenterProps(
  { control, getValues, setValue }: UseFormReturn<CharacterSheetFormValues>,
  {
    characterImage,
    isRootOperationInProgress,
    onCharacterImageCleared,
    onCharacterImageSelected,
    onCharacterImageOperationStarted,
  }: CharacterImagePresenterState,
): CharacterSheetFormPresenterProps {
  const profile = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.profile,
    name: "profile",
  });
  const credit = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.credit,
    name: "credit",
  });
  const build = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.build,
    name: "build",
  });
  const creditSummary = calculateCredit({
    acquiredCredit: credit.acquired,
    changeAdjustment: credit.changeAdjustment,
    creditProvided: credit.provided,
    creditReceived: credit.received,
    spentCredit: 0,
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
    const normalizedValue = normalizeBuildInput(value);

    setValue(`build.attributes.${attribute}.${field}`, normalizedValue, {
      shouldValidate: true,
    });

    return normalizedValue;
  }

  function setOtherRyugiValue(
    index: number,
    field: keyof OtherRyugiValues,
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

        return { ...entry, level: normalizeBuildInput(value) };
      },
    );

    setBuildValue("otherRyugi", otherRyugi);

    return field === "level" ? normalizeBuildInput(value) : undefined;
  }

  return {
    buildSection: {
      build,
      derived: derivedBuild,
      ikizamaOptions: getCharacterSheetIkizamaOptions(),
      onAcquiredExperienceChange: (value) => {
        const normalizedValue = normalizeBuildInput(value);
        setBuildValue("acquiredExperience", normalizedValue);
        return normalizedValue;
      },
      onAttributeChange: setAttributeValue,
      onAttributeCommit: setAttributeValue,
      onIkizamaChange: (ikizamaId) => {
        setBuildValue("ikizamaId", ikizamaId);
      },
      onIkizamaLevelChange: (value) => {
        const normalizedValue = normalizeBuildInput(value);
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
      onPrimaryRyugiChange: (primaryRyugiId) => {
        setBuildValue("primaryRyugiId", primaryRyugiId);
      },
      onPrimaryRyugiLevelChange: (value) => {
        const normalizedValue = normalizeBuildInput(value);
        setBuildValue("primaryRyugiLevel", normalizedValue);
        return normalizedValue;
      },
      onPrimaryRyugiLevelCommit: (value) => {
        const normalizedValue = normalizeBuildInput(value);
        setBuildValue("primaryRyugiLevel", normalizedValue);
        return normalizedValue;
      },
      ryugiOptions: getCharacterSheetRyugiOptions(),
    },
    profileSection: {
      characterImage,
      credit,
      creditSummary,
      onCreditBlur: (field, value) => {
        const normalizedValue = normalizeCreditInput(field, value);

        setValue(`credit.${field}`, normalizedValue, {
          shouldValidate: true,
        });

        return normalizedValue;
      },
      onCreditChange: (field, value) => {
        setValue(`credit.${field}`, normalizeCreditInput(field, value), {
          shouldValidate: true,
        });
      },
      onProfileChange: (field, value) => {
        setValue(`profile.${field}`, value);
      },
      isRootOperationInProgress,
      onCharacterImageCleared,
      onCharacterImageSelected,
      onCharacterImageOperationStarted,
      profile,
    },
  };
}

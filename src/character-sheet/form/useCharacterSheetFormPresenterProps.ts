import { useEffect } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";

import type { CharacterImageRecord } from "../character-image";
import type { CharacterSheetFormPresenterProps } from "../components/CharacterSheetFormPresenter";
import {
  type AttributeName,
  type AttributeValues,
  type BondEditableFieldName,
  type BondValues,
  type BuildValues,
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type OtherRyugiEditableFieldName,
  type ResolveEffectName,
  type SecondaryAttributeFieldName,
} from "../form-values";
import { calculateBonds, retainBondRows } from "../logic/bonds";
import { calculateBuild } from "../logic/build";
import { calculateCredit } from "../logic/credit";
import { calculateSecondaryAttributes } from "../logic/secondary-attributes";
import {
  getCharacterSheetIkizamaOptions,
  getCharacterSheetRyugiOptions,
} from "../master-data/build";
import {
  normalizeBuildInput,
  normalizeCreditInput,
  normalizeResolveEffectInput,
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
  const secondaryAttributes = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.secondaryAttributes,
    name: "secondaryAttributes",
  });
  const bonds = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.bonds,
    name: "bonds",
  });
  const creditSummary = calculateCredit({
    acquiredCredit: credit.acquired,
    changeAdjustment: credit.changeAdjustment,
    creditProvided: credit.provided,
    creditReceived: credit.received,
    spentCredit: 0,
  });
  const derivedBuild = calculateBuild(build);
  const derivedSecondaryAttributes = calculateSecondaryAttributes(
    derivedBuild,
    secondaryAttributes,
  );
  const derivedBonds = calculateBonds(
    bonds,
    derivedSecondaryAttributes.bondLimit,
  );

  useEffect(() => {
    const currentRows = getValues("bonds.rows");
    const retainedRows = retainBondRows(
      currentRows,
      derivedBonds.effectiveLimit,
    );
    const nextRowNumber =
      Math.max(
        0,
        ...currentRows.map((row) => {
          const match = /^bond-(\d+)$/.exec(row.rowId);
          return match === null ? 0 : Number(match[1]);
        }),
      ) + 1;
    const nextRows = [
      ...retainedRows,
      ...Array.from(
        { length: derivedBonds.requiredRowCount - retainedRows.length },
        (_, index): BondValues => ({
          isResolved: false,
          relation: "",
          rowId: `bond-${nextRowNumber + index}`,
          target: "",
        }),
      ),
    ];

    if (
      currentRows.length === nextRows.length &&
      currentRows.every((row, index) => row.rowId === nextRows[index]?.rowId)
    ) {
      return;
    }

    setValue("bonds.rows", nextRows, {
      shouldValidate: true,
    });
  }, [
    derivedBonds.effectiveLimit,
    derivedBonds.requiredRowCount,
    getValues,
    setValue,
  ]);

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

        return { ...entry, level: normalizeBuildInput(value) };
      },
    );

    setBuildValue("otherRyugi", otherRyugi);

    return field === "level" ? normalizeBuildInput(value) : undefined;
  }

  function setAcquiredExperience(value: string): number {
    const normalizedValue = normalizeBuildInput(value);

    setBuildValue("acquiredExperience", normalizedValue);

    return normalizedValue;
  }

  function setSecondaryAttributeValue(
    field: Exclude<
      SecondaryAttributeFieldName,
      "applyTemporaryAction" | "applyTemporaryMovement"
    >,
    value: string,
  ): number {
    const normalizedValue = normalizeBuildInput(value);

    setValue(`secondaryAttributes.${field}`, normalizedValue, {
      shouldValidate: true,
    });

    return normalizedValue;
  }

  function setBondRowValue(
    rowId: string,
    field: BondEditableFieldName,
    value: boolean | string,
  ): void {
    const rows = getValues("bonds.rows").map((row) =>
      row.rowId === rowId ? { ...row, [field]: value } : row,
    );

    setValue("bonds.rows", rows, { shouldValidate: true });
  }

  return {
    buildSection: {
      build,
      derived: derivedBuild,
      ikizamaOptions: getCharacterSheetIkizamaOptions(),
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
    bondsSection: {
      bonds: bonds.rows,
      derived: derivedBonds,
      onEffectModifierChange: (field: ResolveEffectName, value: string) => {
        const normalizedValue = normalizeResolveEffectInput(field, value);

        setValue(`bonds.resolveEffectModifiers.${field}`, normalizedValue, {
          shouldValidate: true,
        });

        return normalizedValue;
      },
      onRowChange: setBondRowValue,
      onRowClear: (rowId) => {
        const rows = getValues("bonds.rows").map((row) =>
          row.rowId === rowId && !row.isResolved
            ? { ...row, isResolved: false, relation: "", target: "" }
            : row,
        );

        setValue("bonds.rows", rows, { shouldValidate: true });
      },
      onRowDelete: (rowId) => {
        const rows = getValues("bonds.rows");
        const row = rows.find((entry) => entry.rowId === rowId);

        if (row?.isResolved) {
          return;
        }

        setValue(
          "bonds.rows",
          rows.filter((entry) => entry.rowId !== rowId),
          { shouldValidate: true },
        );
      },
    },
    profileSection: {
      characterImage,
      credit,
      creditSummary,
      experience: {
        acquired: build.acquiredExperience,
        derived: derivedBuild,
        onAcquiredChange: setAcquiredExperience,
      },
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
    secondaryAttributesSection: {
      derived: derivedSecondaryAttributes,
      onNumberChange: setSecondaryAttributeValue,
      onTemporaryAppliedChange: (field, checked) => {
        setValue(`secondaryAttributes.${field}`, checked, {
          shouldValidate: true,
        });
      },
      secondaryAttributes,
    },
  };
}

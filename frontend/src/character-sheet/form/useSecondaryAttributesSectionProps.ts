import { useCallback, useMemo } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";

import type { SecondaryAttributesSectionProps } from "../components/sections/SecondaryAttributesSection";
import type { BuildDerivedValues } from "../logic/build";
import {
  calculateSecondaryAttributes,
  type SecondaryAttributeDerivedValues,
} from "../logic/secondary-attributes";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type SecondaryAttributeFieldName,
} from "./values";

export type SecondaryAttributesSectionPresenterState = {
  derivedSecondaryAttributes: SecondaryAttributeDerivedValues;
  sectionProps: SecondaryAttributesSectionProps;
};

export default function useSecondaryAttributesSectionProps(
  { control, setValue }: UseFormReturn<CharacterSheetFormValues>,
  derivedBuild: BuildDerivedValues,
  maximumHealthBonus = 0,
  showNanomachineHealthBonus = false,
): SecondaryAttributesSectionPresenterState {
  const secondaryAttributes = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.secondaryAttributes,
    name: "secondaryAttributes",
  });
  const derivedSecondaryAttributes = useMemo(
    () =>
      calculateSecondaryAttributes(
        derivedBuild,
        secondaryAttributes,
        maximumHealthBonus,
      ),
    [derivedBuild, maximumHealthBonus, secondaryAttributes],
  );

  const setSecondaryAttributeValue = useCallback(
    function setSecondaryAttributeValue(
      field: Exclude<
        SecondaryAttributeFieldName,
        "applyTemporaryAction" | "applyTemporaryMovement"
      >,
      value: string,
    ): number {
      const normalizedValue = normalizeIntegerInput(value);

      setValue(`secondaryAttributes.${field}`, normalizedValue, {
        shouldValidate: true,
      });

      return normalizedValue;
    },
    [setValue],
  );
  const onTemporaryAppliedChange = useCallback(
    (
      field: "applyTemporaryAction" | "applyTemporaryMovement",
      checked: boolean,
    ) => {
      setValue(`secondaryAttributes.${field}`, checked, {
        shouldValidate: true,
      });
    },
    [setValue],
  );

  const sectionProps = useMemo(
    () => ({
      derived: derivedSecondaryAttributes,
      healthFormulaSuffix: showNanomachineHealthBonus
        ? " + 埋め込み中のナノマシンの消費精神力の最大値"
        : undefined,
      onNumberChange: setSecondaryAttributeValue,
      onTemporaryAppliedChange,
      secondaryAttributes,
    }),
    [
      derivedSecondaryAttributes,
      onTemporaryAppliedChange,
      secondaryAttributes,
      setSecondaryAttributeValue,
      showNanomachineHealthBonus,
    ],
  );

  const presenterState = useMemo(
    () => ({
      derivedSecondaryAttributes,
      sectionProps,
    }),
    [derivedSecondaryAttributes, sectionProps],
  );

  return presenterState;
}

import { type UseFormReturn, useWatch } from "react-hook-form";

import type { SecondaryAttributesSectionProps } from "../components/SecondaryAttributesSection";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type SecondaryAttributeFieldName,
} from "../form-values";
import type { BuildDerivedValues } from "../logic/build";
import {
  calculateSecondaryAttributes,
  type SecondaryAttributeDerivedValues,
} from "../logic/secondary-attributes";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";

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
  const derivedSecondaryAttributes = calculateSecondaryAttributes(
    derivedBuild,
    secondaryAttributes,
    maximumHealthBonus,
  );

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
  }

  return {
    derivedSecondaryAttributes,
    sectionProps: {
      derived: derivedSecondaryAttributes,
      healthFormulaSuffix: showNanomachineHealthBonus
        ? " + 埋め込み中のナノマシンの消費精神力の最大値"
        : undefined,
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

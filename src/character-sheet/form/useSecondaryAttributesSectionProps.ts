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
): SecondaryAttributesSectionPresenterState {
  const secondaryAttributes = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.secondaryAttributes,
    name: "secondaryAttributes",
  });
  const derivedSecondaryAttributes = calculateSecondaryAttributes(
    derivedBuild,
    secondaryAttributes,
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

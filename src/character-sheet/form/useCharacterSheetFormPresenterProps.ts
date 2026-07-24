import { type UseFormReturn, useWatch } from "react-hook-form";

import type { CharacterSheetFormPresenterProps } from "../components/CharacterSheetFormPresenter";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../form-values";
import { calculateCredit, normalizeCreditInput } from "../logic/credit";

/**
 * Composes the props consumed by the form presenter.
 *
 * G4 currently provides only profile-section props. Later Gates add focused
 * selectors for cross-section derived values here without exposing RHF below
 * the presenter boundary.
 */
export default function useCharacterSheetFormPresenterProps({
  control,
  setValue,
}: UseFormReturn<CharacterSheetFormValues>): CharacterSheetFormPresenterProps {
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
  const creditSummary = calculateCredit({
    acquiredCredit: credit.acquired,
    changeAdjustment: credit.changeAdjustment,
    creditProvided: credit.provided,
    creditReceived: credit.received,
    spentCredit: 0,
  });

  return {
    profileSection: {
      credit,
      creditSummary,
      onCreditBlur: (field, value) => {
        setValue(
          `credit.${field}`,
          normalizeCreditInput(value, field === "changeAdjustment"),
        );
      },
      onCreditChange: (field, value, isInvalidNumber) => {
        if (isInvalidNumber) {
          return;
        }

        setValue(
          `credit.${field}`,
          normalizeCreditInput(value, field === "changeAdjustment"),
        );
      },
      onProfileChange: (field, value) => {
        setValue(`profile.${field}`, value);
      },
      profile,
    },
  };
}

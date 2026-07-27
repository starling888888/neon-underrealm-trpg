import { type UseFormReturn, useWatch } from "react-hook-form";

import type { CharacterImageRecord } from "../character-image";
import type { CharacterSheetFormPresenterProps } from "../components/CharacterSheetFormPresenter";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../form-values";
import { calculateCredit } from "../logic/credit";
import { normalizeCreditInput } from "../schemas/character-sheet-form";

/**
 * Composes the props consumed by the form presenter.
 *
 * G4 currently provides only profile-section props. Later Gates add focused
 * selectors for cross-section derived values here without exposing RHF below
 * the presenter boundary.
 */
type CharacterImagePresenterState = {
  characterImage: CharacterImageRecord | null;
  isRootOperationInProgress: boolean;
  onCharacterImageCleared: () => Promise<void>;
  onCharacterImageSelected: (file: File) => Promise<void>;
  onCharacterImageOperationStarted: (trigger: HTMLButtonElement) => void;
};

export default function useCharacterSheetFormPresenterProps(
  { control, setValue }: UseFormReturn<CharacterSheetFormValues>,
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
  const creditSummary = calculateCredit({
    acquiredCredit: credit.acquired,
    changeAdjustment: credit.changeAdjustment,
    creditProvided: credit.provided,
    creditReceived: credit.received,
    spentCredit: 0,
  });

  return {
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

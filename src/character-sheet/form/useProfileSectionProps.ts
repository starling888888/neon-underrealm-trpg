import { type UseFormReturn, useWatch } from "react-hook-form";

import type { ProfileSectionProps } from "../components/ProfileSection";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../form-values";
import type { BuildDerivedValues } from "../logic/build";
import { calculateCredit } from "../logic/credit";
import { normalizeCreditInput } from "../schemas/character-sheet-form";
import type { CharacterImagePresenterState } from "./presenter-state";

export default function useProfileSectionProps(
  { control, setValue }: UseFormReturn<CharacterSheetFormValues>,
  imageState: CharacterImagePresenterState,
  derivedBuild: BuildDerivedValues,
  onAcquiredExperienceChange: (value: string) => number,
): ProfileSectionProps {
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
  const acquiredExperience = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.build.acquiredExperience,
    name: "build.acquiredExperience",
  });
  const creditSummary = calculateCredit({
    acquiredCredit: credit.acquired,
    changeAdjustment: credit.changeAdjustment,
    creditProvided: credit.provided,
    creditReceived: credit.received,
    spentCredit: 0,
  });

  return {
    characterImage: imageState.characterImage,
    credit,
    creditSummary,
    experience: {
      acquired: acquiredExperience,
      derived: derivedBuild,
      onAcquiredChange: onAcquiredExperienceChange,
    },
    onCreditBlur: (field, value) => {
      const normalizedValue = normalizeCreditInput(field, value);

      setValue(`credit.${field}`, normalizedValue, { shouldValidate: true });

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
    isRootOperationInProgress: imageState.isRootOperationInProgress,
    onCharacterImageCleared: imageState.onCharacterImageCleared,
    onCharacterImageSelected: imageState.onCharacterImageSelected,
    onCharacterImageOperationStarted:
      imageState.onCharacterImageOperationStarted,
    profile,
  };
}

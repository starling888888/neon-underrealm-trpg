import { type RefObject, useCallback, useMemo } from "react";
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
  commonSkillLevelTotal: number,
  commonSkillLevelLimit: number,
  hasCommonSkillLevelError: boolean,
  onAcquiredExperienceChange: (value: string) => number,
  spentCredit = 0,
  pcNameInputRef?: RefObject<HTMLInputElement | null>,
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
  const creditSummary = useMemo(
    () =>
      calculateCredit({
        acquiredCredit: credit.acquired,
        changeAdjustment: credit.changeAdjustment,
        creditProvided: credit.provided,
        creditReceived: credit.received,
        spentCredit,
      }),
    [credit, spentCredit],
  );
  const onCreditBlur = useCallback(
    (field: keyof typeof credit, value: string) => {
      const normalizedValue = normalizeCreditInput(field, value);

      setValue(`credit.${field}`, normalizedValue, { shouldValidate: true });

      return normalizedValue;
    },
    [setValue],
  );
  const onCreditChange = useCallback(
    (field: keyof typeof credit, value: string) => {
      setValue(`credit.${field}`, normalizeCreditInput(field, value), {
        shouldValidate: true,
      });
    },
    [setValue],
  );
  const onProfileChange = useCallback(
    (field: keyof typeof profile, value: string) => {
      setValue(`profile.${field}`, value);
    },
    [setValue],
  );
  const experience = useMemo(
    () => ({
      acquired: acquiredExperience,
      commonSkillLevelLimit,
      commonSkillLevelTotal,
      derived: derivedBuild,
      hasCommonSkillLevelError,
      onAcquiredChange: onAcquiredExperienceChange,
    }),
    [
      acquiredExperience,
      commonSkillLevelLimit,
      commonSkillLevelTotal,
      derivedBuild,
      hasCommonSkillLevelError,
      onAcquiredExperienceChange,
    ],
  );

  const sectionProps = useMemo(
    () => ({
      characterImage: imageState.characterImage,
      credit,
      creditSummary,
      experience,
      onCreditBlur,
      onCreditChange,
      onProfileChange,
      pcNameInputRef,
      isRootOperationInProgress: imageState.isRootOperationInProgress,
      onCharacterImageCleared: imageState.onCharacterImageCleared,
      onCharacterImageSelected: imageState.onCharacterImageSelected,
      onCharacterImageOperationStarted:
        imageState.onCharacterImageOperationStarted,
      profile,
      spentCredit,
    }),
    [
      credit,
      creditSummary,
      experience,
      imageState.characterImage,
      imageState.isRootOperationInProgress,
      imageState.onCharacterImageCleared,
      imageState.onCharacterImageOperationStarted,
      imageState.onCharacterImageSelected,
      onCreditBlur,
      onCreditChange,
      onProfileChange,
      pcNameInputRef,
      profile,
      spentCredit,
    ],
  );

  return sectionProps;
}

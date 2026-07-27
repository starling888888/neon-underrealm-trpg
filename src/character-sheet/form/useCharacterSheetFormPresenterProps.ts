import type { UseFormReturn } from "react-hook-form";

import type { CharacterSheetFormPresenterProps } from "../components/CharacterSheetFormPresenter";
import type { CharacterSheetFormValues } from "../form-values";
import type { CharacterImagePresenterState } from "./presenter-state";
import useBondsSectionProps from "./useBondsSectionProps";
import useBuildSectionProps from "./useBuildSectionProps";
import useChecksSectionProps from "./useChecksSectionProps";
import usePrimarySkillsSectionProps from "./usePrimarySkillsSectionProps";
import useProfileSectionProps from "./useProfileSectionProps";
import useSecondaryAttributesSectionProps from "./useSecondaryAttributesSectionProps";

type CharacterSheetPresenterOptions = {
  onPrimaryRyugiChangeRequested: (
    primaryRyugiId: string | null,
    trigger: HTMLSelectElement,
    applyChange: () => void,
  ) => void;
  onPrimarySkillPickerRequested: (
    rowId: string,
    trigger: HTMLButtonElement,
  ) => void;
};

/** Composes independently-owned section props for the form presenter. */
export default function useCharacterSheetFormPresenterProps(
  form: UseFormReturn<CharacterSheetFormValues>,
  imageState: CharacterImagePresenterState,
  {
    onPrimaryRyugiChangeRequested,
    onPrimarySkillPickerRequested,
  }: Partial<CharacterSheetPresenterOptions> = {},
): CharacterSheetFormPresenterProps {
  const build = useBuildSectionProps(form, { onPrimaryRyugiChangeRequested });
  const secondaryAttributes = useSecondaryAttributesSectionProps(
    form,
    build.derivedBuild,
  );
  const bondsSection = useBondsSectionProps(
    form,
    secondaryAttributes.derivedSecondaryAttributes,
  );
  const checksSection = useChecksSectionProps(form, build.derivedBuild);
  const profileSection = useProfileSectionProps(
    form,
    imageState,
    build.derivedBuild,
    build.onAcquiredExperienceChange,
  );
  const primarySkills = usePrimarySkillsSectionProps(form, {
    onPickerRequest: onPrimarySkillPickerRequested ?? (() => {}),
  });

  return {
    bondsSection,
    buildSection: {
      ...build.sectionProps,
      hasPrimarySkillLevelError:
        primarySkills.sectionProps.hasPrimarySkillLevelTotalError,
    },
    checksSection,
    primarySkillsSection: primarySkills.sectionProps,
    profileSection,
    secondaryAttributesSection: secondaryAttributes.sectionProps,
  };
}

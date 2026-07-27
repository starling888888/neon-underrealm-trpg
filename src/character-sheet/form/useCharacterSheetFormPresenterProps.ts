import type { UseFormReturn } from "react-hook-form";

import type { CharacterSheetFormPresenterProps } from "../components/CharacterSheetFormPresenter";
import type { CharacterSheetFormValues } from "../form-values";
import type { CharacterImagePresenterState } from "./presenter-state";
import useBondsSectionProps from "./useBondsSectionProps";
import useBuildSectionProps from "./useBuildSectionProps";
import useChecksSectionProps from "./useChecksSectionProps";
import useProfileSectionProps from "./useProfileSectionProps";
import useSecondaryAttributesSectionProps from "./useSecondaryAttributesSectionProps";

/** Composes independently-owned section props for the form presenter. */
export default function useCharacterSheetFormPresenterProps(
  form: UseFormReturn<CharacterSheetFormValues>,
  imageState: CharacterImagePresenterState,
): CharacterSheetFormPresenterProps {
  const build = useBuildSectionProps(form);
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

  return {
    bondsSection,
    buildSection: build.sectionProps,
    checksSection,
    profileSection,
    secondaryAttributesSection: secondaryAttributes.sectionProps,
  };
}

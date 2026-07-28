import type { UseFormReturn } from "react-hook-form";

import type { CharacterSheetFormPresenterProps } from "../components/CharacterSheetFormPresenter";
import type { CharacterSheetFormValues } from "../form-values";
import type { IkizamaSkillGroups } from "../master-data/ikizama-skills";
import type { OtherRyugiSkillGroups } from "../master-data/other-ryugi-skills";
import type { PrimarySkillGroups } from "../master-data/primary-skills";
import type { CharacterImagePresenterState } from "./presenter-state";
import useBondsSectionProps from "./useBondsSectionProps";
import useBuildSectionProps from "./useBuildSectionProps";
import useChecksSectionProps from "./useChecksSectionProps";
import useIkizamaSkillsSectionProps from "./useIkizamaSkillsSectionProps";
import useOtherRyugiSkillsSectionProps from "./useOtherRyugiSkillsSectionProps";
import usePrimarySkillsSectionProps from "./usePrimarySkillsSectionProps";
import useProfileSectionProps from "./useProfileSectionProps";
import useSecondaryAttributesSectionProps from "./useSecondaryAttributesSectionProps";

type CharacterSheetPresenterOptions = {
  onIkizamaChangeRequested: (
    ikizamaId: string | null,
    trigger: HTMLSelectElement,
    applyChange: () => void,
  ) => void;
  onPrimaryRyugiChangeRequested: (
    primaryRyugiId: string | null,
    trigger: HTMLSelectElement,
    applyChange: () => void,
  ) => void;
  onPrimarySkillPickerRequested: (
    rowId: string,
    trigger: HTMLButtonElement,
  ) => void;
  onIkizamaSkillPickerRequested: (
    rowId: string,
    trigger: HTMLButtonElement,
  ) => void;
  onOtherRyugiChangeRequested: (
    rowId: string,
    ryugiId: string | null,
    trigger: HTMLSelectElement,
    applyChange: () => void,
  ) => void;
  onOtherRyugiRemoveRequested: (
    rowId: string,
    trigger: HTMLButtonElement,
    applyChange: () => void,
  ) => void;
  onOtherRyugiSkillPickerRequested: (
    rowId: string,
    trigger: HTMLButtonElement,
  ) => void;
};

export type CharacterSheetContainerPresenterState =
  CharacterSheetFormPresenterProps & {
    ikizamaSkillPicker: {
      candidateGroups: IkizamaSkillGroups;
      clearSelection: () => void;
      onSelect: (rowId: string, skillId: string) => void;
    };
    otherRyugiSkillPicker: {
      getCandidateGroups: (ryugiRowId: string) => OtherRyugiSkillGroups;
      getSelectedSkillIds: (ryugiRowId: string) => readonly string[];
      onSelect: (rowId: string, skillId: string) => void;
    };
    otherRyugiSkills: {
      clearSelection: (ryugiRowId: string) => void;
      removeRows: (ryugiRowId: string) => void;
    };
    primarySkillPicker: {
      candidateGroups: PrimarySkillGroups;
      clearSelection: () => void;
      onSelect: (rowId: string, skillId: string) => void;
    };
  };

/** Composes independently-owned section props for the form presenter. */
export default function useCharacterSheetFormPresenterProps(
  form: UseFormReturn<CharacterSheetFormValues>,
  imageState: CharacterImagePresenterState,
  {
    onIkizamaChangeRequested,
    onIkizamaSkillPickerRequested,
    onOtherRyugiChangeRequested,
    onOtherRyugiRemoveRequested,
    onOtherRyugiSkillPickerRequested,
    onPrimaryRyugiChangeRequested,
    onPrimarySkillPickerRequested,
  }: Partial<CharacterSheetPresenterOptions> = {},
): CharacterSheetContainerPresenterState {
  const otherRyugiSkills = useOtherRyugiSkillsSectionProps(form, {
    onPickerRequest: onOtherRyugiSkillPickerRequested ?? (() => {}),
  });
  const build = useBuildSectionProps(form, {
    onIkizamaChangeRequested,
    onOtherRyugiAdded: otherRyugiSkills.addInitialRow,
    onOtherRyugiChangeRequested,
    onOtherRyugiRemoveRequested,
    onPrimaryRyugiChangeRequested,
  });
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
  const ikizamaSkills = useIkizamaSkillsSectionProps(form, {
    onPickerRequest: onIkizamaSkillPickerRequested ?? (() => {}),
  });

  return {
    bondsSection,
    buildSection: {
      ...build.sectionProps,
      hasIkizamaSkillLevelError:
        ikizamaSkills.sectionProps.hasIkizamaSkillLevelTotalError,
      invalidOtherRyugiSkillLevelRowIds:
        otherRyugiSkills.sectionProps.sections.flatMap((section) =>
          section.hasSkillLevelTotalError ? [section.ryugiRowId] : [],
        ),
      hasPrimarySkillLevelError:
        primarySkills.sectionProps.hasPrimarySkillLevelTotalError,
    },
    checksSection,
    ikizamaSkillsSection: ikizamaSkills.sectionProps,
    ikizamaSkillPicker: {
      candidateGroups: ikizamaSkills.candidateGroups,
      clearSelection: ikizamaSkills.clearSelection,
      onSelect: ikizamaSkills.onSelect,
    },
    otherRyugiSkillPicker: {
      getCandidateGroups: otherRyugiSkills.getCandidateGroups,
      getSelectedSkillIds: otherRyugiSkills.getSelectedSkillIds,
      onSelect: otherRyugiSkills.onSelect,
    },
    otherRyugiSkills: {
      clearSelection: otherRyugiSkills.clearSelection,
      removeRows: otherRyugiSkills.removeRows,
    },
    otherRyugiSkillsSection: otherRyugiSkills.sectionProps,
    primarySkillPicker: {
      candidateGroups: primarySkills.candidateGroups,
      clearSelection: primarySkills.clearSelection,
      onSelect: primarySkills.onSelect,
    },
    primarySkillsSection: primarySkills.sectionProps,
    profileSection,
    secondaryAttributesSection: secondaryAttributes.sectionProps,
  };
}

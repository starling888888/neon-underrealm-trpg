import { type RefObject, useCallback, useMemo, useRef } from "react";
import type { UseFormReturn } from "react-hook-form";
import type { CharacterSheetFormPresenterProps } from "../components/CharacterSheetFormPresenter";
import type { CyberneticsPickerTarget } from "../components/sections/CyberneticsSection";
import type { NanomachinesPickerTarget } from "../components/sections/NanomachinesSection";
import type { CharacterSheetErrorSummary } from "../logic/error-summary";
import type { IkizamaSkillGroups } from "../master-data/ikizama-skills";
import type { OtherRyugiSkillGroups } from "../master-data/other-ryugi-skills";
import type { PrimarySkillGroups } from "../master-data/primary-skills";
import type { CharacterImagePresenterState } from "./presenter-state";
import useBondsSectionProps from "./useBondsSectionProps";
import useBuildSectionProps from "./useBuildSectionProps";
import useCharacterSheetErrorSummary from "./useCharacterSheetErrorSummary";
import useChecksSectionProps from "./useChecksSectionProps";
import useCommonSkillsSectionProps from "./useCommonSkillsSectionProps";
import useCyberneticsSectionProps from "./useCyberneticsSectionProps";
import useDrugsSectionProps from "./useDrugsSectionProps";
import useIkizamaSkillsSectionProps from "./useIkizamaSkillsSectionProps";
import useNanomachinesSectionProps from "./useNanomachinesSectionProps";
import useOmamoriSectionProps from "./useOmamoriSectionProps";
import useOtherRyugiSkillsSectionProps from "./useOtherRyugiSkillsSectionProps";
import usePrimarySkillsSectionProps from "./usePrimarySkillsSectionProps";
import useProfileSectionProps from "./useProfileSectionProps";
import useSecondaryAttributesSectionProps from "./useSecondaryAttributesSectionProps";
import useSpecialItemsSectionProps from "./useSpecialItemsSectionProps";
import useWeaponsAndArmorSectionProps from "./useWeaponsAndArmorSectionProps";
import type { CharacterSheetFormValues } from "./values";

type CharacterSheetPresenterOptions = {
  formRestoreReturnFocusRef: RefObject<HTMLInputElement | null>;
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
  otherRyugiAddButtonRef: RefObject<HTMLButtonElement | null>;
  onOtherRyugiRemoveRequested: (
    rowId: string,
    trigger: HTMLButtonElement,
    applyChange: () => void,
  ) => void;
  onOtherRyugiSkillPickerRequested: (
    rowId: string,
    trigger: HTMLButtonElement,
  ) => void;
  onCommonSkillPickerRequested: (
    rowId: string,
    trigger: HTMLButtonElement,
  ) => void;
  onArmorPickerRequested: (trigger: HTMLButtonElement) => void;
  onOmamoriPickerRequested: (rowId: string, trigger: HTMLButtonElement) => void;
  onCyberneticsPickerRequested: (
    target: CyberneticsPickerTarget,
    trigger: HTMLButtonElement,
  ) => void;
  onDrugsPickerRequested: (rowId: string, trigger: HTMLButtonElement) => void;
  onNanomachinesPickerRequested: (
    target: NanomachinesPickerTarget,
    trigger: HTMLButtonElement,
  ) => void;
  onWeaponPickerRequested: (rowId: string, trigger: HTMLButtonElement) => void;
  onSpecialItemCategoryRemoveRequested: (
    category: import("./values").SpecialItemCategoryId,
    trigger: HTMLButtonElement,
    applyRemoval: () => void,
  ) => void;
  onSpecialItemCategoryRemoved: (
    category: import("./values").SpecialItemCategoryId,
  ) => void;
};

const noop = () => {};

export type CharacterSheetContainerPresenterState =
  CharacterSheetFormPresenterProps & {
    errorSummary: CharacterSheetErrorSummary;
    ikizamaSkillPicker: {
      candidateGroups: IkizamaSkillGroups;
      clearSelection: () => void;
      onSelect: (rowId: string, skillId: string) => void;
    };
    commonSkillPicker: {
      candidates: ReturnType<typeof useCommonSkillsSectionProps>["candidates"];
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
    otherRyugiAddButtonRef,
    onOtherRyugiRemoveRequested,
    onOtherRyugiSkillPickerRequested,
    onCommonSkillPickerRequested,
    onPrimaryRyugiChangeRequested,
    onPrimarySkillPickerRequested,
    onArmorPickerRequested,
    onCyberneticsPickerRequested,
    onDrugsPickerRequested,
    onNanomachinesPickerRequested,
    onOmamoriPickerRequested,
    onWeaponPickerRequested,
    onSpecialItemCategoryRemoved,
    onSpecialItemCategoryRemoveRequested,
    formRestoreReturnFocusRef,
  }: Partial<CharacterSheetPresenterOptions> = {},
): CharacterSheetContainerPresenterState {
  const shouldSynchronizeCyberneticsRef = useRef(false);
  const commonSkillPickerRequest = onCommonSkillPickerRequested ?? noop;
  const otherRyugiSkillPickerRequest = onOtherRyugiSkillPickerRequested ?? noop;
  const primarySkillPickerRequest = onPrimarySkillPickerRequested ?? noop;
  const ikizamaSkillPickerRequest = onIkizamaSkillPickerRequested ?? noop;
  const armorPickerRequest = onArmorPickerRequested ?? noop;
  const cyberneticsPickerRequest = onCyberneticsPickerRequested ?? noop;
  const drugsPickerRequest = onDrugsPickerRequested ?? noop;
  const nanomachinesPickerRequest = onNanomachinesPickerRequested ?? noop;
  const omamoriPickerRequest = onOmamoriPickerRequested ?? noop;
  const weaponPickerRequest = onWeaponPickerRequested ?? noop;
  const commonSkills = useCommonSkillsSectionProps(form, {
    onPickerRequest: commonSkillPickerRequest,
  });
  const otherRyugiSkills = useOtherRyugiSkillsSectionProps(form, {
    onPickerRequest: otherRyugiSkillPickerRequest,
  });
  const specialItems = useSpecialItemsSectionProps(form, {
    onCategoryRemoved: onSpecialItemCategoryRemoved,
    onRemoveRequested: onSpecialItemCategoryRemoveRequested,
    shouldSynchronizeCyberneticsRef,
  });
  const onIkizamaChange = useCallback(
    (
      ikizamaId: string | null,
      trigger: HTMLSelectElement,
      applyChange: () => void,
    ) => {
      const applyChangeAndUpdateCategories = () => {
        specialItems.updateForIkizamaChange(ikizamaId);
        applyChange();
      };
      if (onIkizamaChangeRequested !== undefined) {
        onIkizamaChangeRequested(
          ikizamaId,
          trigger,
          applyChangeAndUpdateCategories,
        );
        return;
      }
      applyChangeAndUpdateCategories();
    },
    [onIkizamaChangeRequested, specialItems.updateForIkizamaChange],
  );
  const buildOptions = useMemo(
    () => ({
      commonSkillLevelTotal: commonSkills.sectionProps.selectedLevelTotal,
      onIkizamaChangeRequested: onIkizamaChange,
      onOtherRyugiAdded: otherRyugiSkills.addInitialRow,
      otherRyugiAddButtonRef,
      onOtherRyugiChangeRequested,
      onOtherRyugiRemoveRequested,
      onPrimaryRyugiChangeRequested,
    }),
    [
      commonSkills.sectionProps.selectedLevelTotal,
      onIkizamaChange,
      onOtherRyugiChangeRequested,
      onOtherRyugiRemoveRequested,
      onPrimaryRyugiChangeRequested,
      otherRyugiAddButtonRef,
      otherRyugiSkills.addInitialRow,
    ],
  );
  const build = useBuildSectionProps(form, buildOptions);
  const secondaryAttributes = useSecondaryAttributesSectionProps(
    form,
    build.derivedBuild,
    specialItems.maximumHealthBonus,
    build.sectionProps.build.ikizamaId === "sumi",
  );
  const bondsSection = useBondsSectionProps(
    form,
    secondaryAttributes.derivedSecondaryAttributes,
  );
  const checksSection = useChecksSectionProps(form, build.derivedBuild);
  const cybernetics = useCyberneticsSectionProps(form, build.derivedBuild, {
    onPickerRequest: cyberneticsPickerRequest,
    shouldSynchronizeCyberneticsRef,
  });
  const nanomachines = useNanomachinesSectionProps(form, build.derivedBuild, {
    onPickerRequest: nanomachinesPickerRequest,
  });
  const drugs = useDrugsSectionProps(form, {
    onPickerRequest: drugsPickerRequest,
  });
  const profileSection = useProfileSectionProps(
    form,
    imageState,
    build.derivedBuild,
    commonSkills.sectionProps.selectedLevelTotal,
    commonSkills.sectionProps.levelLimit,
    commonSkills.sectionProps.hasCommonSkillLevelError,
    build.onAcquiredExperienceChange,
    specialItems.spentCredit,
    formRestoreReturnFocusRef,
  );
  const primarySkills = usePrimarySkillsSectionProps(form, {
    onPickerRequest: primarySkillPickerRequest,
  });
  const ikizamaSkills = useIkizamaSkillsSectionProps(form, {
    onPickerRequest: ikizamaSkillPickerRequest,
  });
  const weaponsAndArmor = useWeaponsAndArmorSectionProps(form, {
    onArmorPickerRequest: armorPickerRequest,
    onWeaponPickerRequest: weaponPickerRequest,
  });
  const omamori = useOmamoriSectionProps(form, {
    onPickerRequest: omamoriPickerRequest,
  });
  const errorSummary = useCharacterSheetErrorSummary({
    bondsSection,
    build,
    commonSkills,
    cybernetics,
    drugs,
    ikizamaSkills,
    nanomachines,
    otherRyugiSkills,
    primarySkills,
    profileSection,
  });
  const buildSection = useMemo(
    () => ({
      ...build.sectionProps,
      hasIkizamaSkillLevelError:
        ikizamaSkills.sectionProps.hasIkizamaSkillLevelTotalError,
      invalidOtherRyugiSkillLevelRowIds:
        otherRyugiSkills.sectionProps.sections.flatMap((section) =>
          section.hasSkillLevelTotalError ? [section.ryugiRowId] : [],
        ),
      hasPrimarySkillLevelError:
        primarySkills.sectionProps.hasPrimarySkillLevelTotalError,
      unlockedCommonSkillBonusLevels: commonSkills.unlockedBonusLevels,
    }),
    [
      build.sectionProps,
      commonSkills.unlockedBonusLevels,
      ikizamaSkills.sectionProps.hasIkizamaSkillLevelTotalError,
      otherRyugiSkills.sectionProps.sections,
      primarySkills.sectionProps.hasPrimarySkillLevelTotalError,
    ],
  );

  return {
    bondsSection,
    buildSection,
    checksSection,
    cyberneticsSection: cybernetics,
    drugsSection: drugs,
    errorSummary,
    commonSkillPicker: {
      candidates: commonSkills.candidates,
      onSelect: commonSkills.onSelect,
    },
    commonSkillsSection: commonSkills.sectionProps,
    ikizamaSkillsSection: ikizamaSkills.sectionProps,
    nanomachinesSection: nanomachines,
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
    omamoriSection: omamori,
    primarySkillPicker: {
      candidateGroups: primarySkills.candidateGroups,
      clearSelection: primarySkills.clearSelection,
      onSelect: primarySkills.onSelect,
    },
    primarySkillsSection: primarySkills.sectionProps,
    profileSection,
    secondaryAttributesSection: secondaryAttributes.sectionProps,
    specialItemsSection: specialItems.sectionProps,
    weaponsAndArmorSection: weaponsAndArmor,
  };
}

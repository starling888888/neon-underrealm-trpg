import { useCallback, useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { PickerDialogsProps } from "./components/PickerDialogs";
import { characterSheetDictionary } from "./dictionary";
import type { CharacterSheetContainerPresenterState } from "./form/useCharacterSheetFormPresenterProps";
import type { CharacterSheetFormValues } from "./form-values";
import { getCyberneticCandidateGroups } from "./master-data/cybernetics";
import { getDrugs } from "./master-data/drugs";
import { getNanomachines } from "./master-data/nanomachines";
import { getOmamori } from "./master-data/omamori";
import {
  getArmors,
  getWeaponCandidateGroups,
} from "./master-data/weapons-and-armor";
import type { PickerStates } from "./usePickerStates";

type UsePickersArgs = {
  form: UseFormReturn<CharacterSheetFormValues>;
  pickerStates: PickerStates;
  presenterProps: PickerPresenterState;
};

export type PickerPresenterState = {
  commonSkillPicker: Pick<
    CharacterSheetContainerPresenterState["commonSkillPicker"],
    "candidates" | "onSelect"
  >;
  commonSkillsSection: Pick<
    CharacterSheetContainerPresenterState["commonSkillsSection"],
    "rows"
  >;
  cyberneticsSection: Pick<
    CharacterSheetContainerPresenterState["cyberneticsSection"],
    "onSelect"
  >;
  drugsSection: Pick<
    CharacterSheetContainerPresenterState["drugsSection"],
    "onSelect"
  >;
  ikizamaSkillPicker: Pick<
    CharacterSheetContainerPresenterState["ikizamaSkillPicker"],
    "candidateGroups" | "onSelect"
  >;
  nanomachinesSection: Pick<
    CharacterSheetContainerPresenterState["nanomachinesSection"],
    "onSelect"
  >;
  omamoriSection: Pick<
    CharacterSheetContainerPresenterState["omamoriSection"],
    "onSelect"
  >;
  otherRyugiSkillPicker: Pick<
    CharacterSheetContainerPresenterState["otherRyugiSkillPicker"],
    "getCandidateGroups" | "getSelectedSkillIds" | "onSelect"
  >;
  primarySkillPicker: Pick<
    CharacterSheetContainerPresenterState["primarySkillPicker"],
    "candidateGroups" | "onSelect"
  >;
  primarySkillsSection: Pick<
    CharacterSheetContainerPresenterState["primarySkillsSection"],
    "rows"
  >;
  weaponsAndArmorSection: Pick<
    CharacterSheetContainerPresenterState["weaponsAndArmorSection"],
    "onArmorSelect" | "onWeaponSelect"
  >;
};

/** Connects picker UI state to form-presenter selection operations. */
export default function usePickers({
  form,
  pickerStates,
  presenterProps,
}: UsePickersArgs) {
  const onPrimarySkillSelected = useCallback(
    (skillId: string) => {
      if (pickerStates.primarySkill.rowId !== null) {
        presenterProps.primarySkillPicker.onSelect(
          pickerStates.primarySkill.rowId,
          skillId,
        );
      }
      pickerStates.primarySkill.close();
    },
    [
      pickerStates.primarySkill.close,
      pickerStates.primarySkill.rowId,
      presenterProps.primarySkillPicker,
    ],
  );
  const onIkizamaSkillSelected = useCallback(
    (skillId: string) => {
      if (pickerStates.ikizamaSkill.rowId !== null) {
        presenterProps.ikizamaSkillPicker.onSelect(
          pickerStates.ikizamaSkill.rowId,
          skillId,
        );
      }
      pickerStates.ikizamaSkill.close();
    },
    [
      pickerStates.ikizamaSkill.close,
      pickerStates.ikizamaSkill.rowId,
      presenterProps.ikizamaSkillPicker,
    ],
  );
  const onCommonSkillSelected = useCallback(
    (skillId: string) => {
      if (pickerStates.commonSkill.rowId !== null) {
        presenterProps.commonSkillPicker.onSelect(
          pickerStates.commonSkill.rowId,
          skillId,
        );
      }
      pickerStates.commonSkill.close();
    },
    [
      pickerStates.commonSkill.close,
      pickerStates.commonSkill.rowId,
      presenterProps.commonSkillPicker,
    ],
  );
  const onOtherRyugiSkillSelected = useCallback(
    (skillId: string) => {
      if (pickerStates.otherRyugiSkill.rowId !== null) {
        presenterProps.otherRyugiSkillPicker.onSelect(
          pickerStates.otherRyugiSkill.rowId,
          skillId,
        );
      }
      pickerStates.otherRyugiSkill.close();
    },
    [
      pickerStates.otherRyugiSkill.close,
      pickerStates.otherRyugiSkill.rowId,
      presenterProps.otherRyugiSkillPicker,
    ],
  );
  const onWeaponSelected = useCallback(
    (weaponId: string) => {
      if (pickerStates.weapon.rowId !== null) {
        presenterProps.weaponsAndArmorSection.onWeaponSelect(
          pickerStates.weapon.rowId,
          weaponId,
        );
      }
      pickerStates.weapon.close();
    },
    [
      pickerStates.weapon.close,
      pickerStates.weapon.rowId,
      presenterProps.weaponsAndArmorSection,
    ],
  );
  const onArmorSelected = useCallback(
    (armorId: string) => {
      presenterProps.weaponsAndArmorSection.onArmorSelect(armorId);
      pickerStates.armor.close();
    },
    [pickerStates.armor.close, presenterProps.weaponsAndArmorSection],
  );
  const onOmamoriSelected = useCallback(
    (omamoriId: string) => {
      if (pickerStates.omamori.rowId !== null) {
        presenterProps.omamoriSection.onSelect(
          pickerStates.omamori.rowId,
          omamoriId,
        );
      }
      pickerStates.omamori.close();
    },
    [
      pickerStates.omamori.close,
      pickerStates.omamori.rowId,
      presenterProps.omamoriSection,
    ],
  );
  const onDrugSelected = useCallback(
    (drugId: string) => {
      if (pickerStates.drugs.rowId !== null) {
        presenterProps.drugsSection.onSelect(pickerStates.drugs.rowId, drugId);
      }
      pickerStates.drugs.close();
    },
    [
      pickerStates.drugs.close,
      pickerStates.drugs.rowId,
      presenterProps.drugsSection,
    ],
  );
  const onCyberneticSelected = useCallback(
    (cyberneticId: string) => {
      if (pickerStates.cybernetics.target !== null) {
        presenterProps.cyberneticsSection.onSelect(
          pickerStates.cybernetics.target,
          cyberneticId,
        );
      }
      pickerStates.cybernetics.close();
    },
    [
      pickerStates.cybernetics.close,
      pickerStates.cybernetics.target,
      presenterProps.cyberneticsSection,
    ],
  );
  const onNanomachineSelected = useCallback(
    (nanomachineId: string) => {
      if (pickerStates.nanomachines.target !== null) {
        presenterProps.nanomachinesSection.onSelect(
          pickerStates.nanomachines.target,
          nanomachineId,
        );
      }
      pickerStates.nanomachines.close();
    },
    [
      pickerStates.nanomachines.close,
      pickerStates.nanomachines.target,
      presenterProps.nanomachinesSection,
    ],
  );

  const otherRyugiRowId =
    pickerStates.otherRyugiSkill.rowId === null
      ? ""
      : (form
          .getValues("otherRyugiSkills.rows")
          .find((row) => row.rowId === pickerStates.otherRyugiSkill.rowId)
          ?.ryugiRowId ?? "");
  const dialogsProps = useMemo<PickerDialogsProps>(
    () => ({
      armor: {
        armors: getArmors(),
        isOpen: pickerStates.armor.isOpen,
        onRequestClose: pickerStates.armor.close,
        onSelect: onArmorSelected,
        returnFocusRef: pickerStates.armor.triggerRef,
      },
      commonSkill: {
        groups: [
          {
            id: "common-skills",
            skills: presenterProps.commonSkillPicker.candidates,
          },
        ],
        isOpen: pickerStates.commonSkill.rowId !== null,
        onRequestClose: pickerStates.commonSkill.close,
        onSelect: onCommonSkillSelected,
        returnFocusRef: pickerStates.commonSkill.triggerRef,
        selectedSkillIds: presenterProps.commonSkillsSection.rows.flatMap(
          (row) => (row.skillId === null ? [] : [row.skillId]),
        ),
        selectionGuide:
          characterSheetDictionary.characterSheet.skills.selectionGuide,
        title: characterSheetDictionary.characterSheet.skills.chooseCommon,
      },
      cybernetics: {
        groups: getCyberneticCandidateGroups(
          pickerStates.cybernetics.target === null
            ? "other"
            : pickerStates.cybernetics.target.kind === "fixed"
              ? pickerStates.cybernetics.target.part
              : "other",
        ),
        isOpen: pickerStates.cybernetics.target !== null,
        onRequestClose: pickerStates.cybernetics.close,
        onSelect: onCyberneticSelected,
        returnFocusRef: pickerStates.cybernetics.triggerRef,
      },
      drugs: {
        candidates: getDrugs(),
        isOpen: pickerStates.drugs.rowId !== null,
        onRequestClose: pickerStates.drugs.close,
        onSelect: onDrugSelected,
        returnFocusRef: pickerStates.drugs.triggerRef,
        selectedDrugIds: form
          .getValues("drugs.rows")
          .flatMap((row) =>
            row.rowId === pickerStates.drugs.rowId || row.drugId === null
              ? []
              : [row.drugId],
          ),
      },
      ikizamaSkill: {
        groups: presenterProps.ikizamaSkillPicker.candidateGroups,
        isOpen: pickerStates.ikizamaSkill.rowId !== null,
        onRequestClose: pickerStates.ikizamaSkill.close,
        onSelect: onIkizamaSkillSelected,
        returnFocusRef: pickerStates.ikizamaSkill.triggerRef,
      },
      nanomachines: {
        candidates: getNanomachines(),
        isOpen: pickerStates.nanomachines.target !== null,
        onRequestClose: pickerStates.nanomachines.close,
        onSelect: onNanomachineSelected,
        returnFocusRef: pickerStates.nanomachines.triggerRef,
      },
      omamori: {
        candidates: getOmamori(),
        isOpen: pickerStates.omamori.rowId !== null,
        onRequestClose: pickerStates.omamori.close,
        onSelect: onOmamoriSelected,
        returnFocusRef: pickerStates.omamori.triggerRef,
      },
      otherRyugiSkill: {
        groups:
          pickerStates.otherRyugiSkill.rowId === null
            ? { advanced: [], basic: [] }
            : presenterProps.otherRyugiSkillPicker.getCandidateGroups(
                otherRyugiRowId,
              ),
        isOpen: pickerStates.otherRyugiSkill.rowId !== null,
        onRequestClose: pickerStates.otherRyugiSkill.close,
        onSelect: onOtherRyugiSkillSelected,
        returnFocusRef: pickerStates.otherRyugiSkill.triggerRef,
        selectedSkillIds:
          pickerStates.otherRyugiSkill.rowId === null
            ? []
            : presenterProps.otherRyugiSkillPicker.getSelectedSkillIds(
                otherRyugiRowId,
              ),
      },
      primarySkill: {
        groups: presenterProps.primarySkillPicker.candidateGroups,
        isOpen: pickerStates.primarySkill.rowId !== null,
        onRequestClose: pickerStates.primarySkill.close,
        onSelect: onPrimarySkillSelected,
        returnFocusRef: pickerStates.primarySkill.triggerRef,
        selectedSkillIds: presenterProps.primarySkillsSection.rows.flatMap(
          (row) => (row.skillId === null ? [] : [row.skillId]),
        ),
      },
      weapon: {
        groups: getWeaponCandidateGroups(form.getValues("build.ikizamaId")),
        isOpen: pickerStates.weapon.rowId !== null,
        onRequestClose: pickerStates.weapon.close,
        onSelect: onWeaponSelected,
        returnFocusRef: pickerStates.weapon.triggerRef,
      },
    }),
    [
      form,
      onArmorSelected,
      onCommonSkillSelected,
      onCyberneticSelected,
      onDrugSelected,
      onIkizamaSkillSelected,
      onNanomachineSelected,
      onOmamoriSelected,
      onOtherRyugiSkillSelected,
      onPrimarySkillSelected,
      onWeaponSelected,
      otherRyugiRowId,
      pickerStates.armor.close,
      pickerStates.armor.isOpen,
      pickerStates.armor.triggerRef,
      pickerStates.commonSkill.close,
      pickerStates.commonSkill.rowId,
      pickerStates.commonSkill.triggerRef,
      pickerStates.cybernetics.close,
      pickerStates.cybernetics.target,
      pickerStates.cybernetics.triggerRef,
      pickerStates.drugs.close,
      pickerStates.drugs.rowId,
      pickerStates.drugs.triggerRef,
      pickerStates.ikizamaSkill.close,
      pickerStates.ikizamaSkill.rowId,
      pickerStates.ikizamaSkill.triggerRef,
      pickerStates.nanomachines.close,
      pickerStates.nanomachines.target,
      pickerStates.nanomachines.triggerRef,
      pickerStates.omamori.close,
      pickerStates.omamori.rowId,
      pickerStates.omamori.triggerRef,
      pickerStates.otherRyugiSkill.close,
      pickerStates.otherRyugiSkill.rowId,
      pickerStates.otherRyugiSkill.triggerRef,
      pickerStates.primarySkill.close,
      pickerStates.primarySkill.rowId,
      pickerStates.primarySkill.triggerRef,
      pickerStates.weapon.close,
      pickerStates.weapon.rowId,
      pickerStates.weapon.triggerRef,
      presenterProps.commonSkillPicker.candidates,
      presenterProps.commonSkillsSection.rows,
      presenterProps.ikizamaSkillPicker.candidateGroups,
      presenterProps.otherRyugiSkillPicker,
      presenterProps.primarySkillPicker.candidateGroups,
      presenterProps.primarySkillsSection.rows,
    ],
  );

  return useMemo(() => ({ dialogsProps }), [dialogsProps]);
}

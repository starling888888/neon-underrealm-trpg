// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form/values";
import usePickerStates from "../../../src/character-sheet/hooks/usePickerStates";
import usePickers, {
  type PickerPresenterState,
} from "../../../src/character-sheet/hooks/usePickers";
import { getDrugs } from "../../../src/character-sheet/master-data/drugs";
import { getWeaponCandidateGroups } from "../../../src/character-sheet/master-data/weapons-and-armor";

describe("usePickers", () => {
  it("connects a picker selection to its presenter operation and closes that picker", () => {
    const onPrimarySkillSelect = vi.fn();
    const { result } = renderHook(() => {
      const form = useForm<CharacterSheetFormValues>({
        defaultValues: characterSheetDefaultValues,
      });
      const pickerStates = usePickerStates();
      const presenterProps = useMemo(
        () =>
          ({
            commonSkillPicker: { candidates: [], onSelect: vi.fn() },
            commonSkillsSection: { rows: [] },
            cyberneticsSection: { onSelect: vi.fn() },
            drugsSection: { onSelect: vi.fn() },
            ikizamaSkillPicker: {
              candidateGroups: { advanced: [], basic: [], bonus: [] },
              onSelect: vi.fn(),
            },
            nanomachinesSection: { onSelect: vi.fn() },
            omamoriSection: { onSelect: vi.fn() },
            otherRyugiSkillPicker: {
              getCandidateGroups: vi.fn(() => ({ advanced: [], basic: [] })),
              getSelectedSkillIds: vi.fn(() => []),
              onSelect: vi.fn(),
            },
            primarySkillPicker: {
              candidateGroups: { advanced: [], basic: [], bonus: [] },
              onSelect: onPrimarySkillSelect,
            },
            primarySkillsSection: { rows: [] },
            weaponsAndArmorSection: {
              onArmorSelect: vi.fn(),
              onWeaponSelect: vi.fn(),
            },
          }) as PickerPresenterState,
        [],
      );

      return {
        pickerStates,
        pickers: usePickers({ form, pickerStates, presenterProps }),
      };
    });
    const trigger = document.createElement("button");

    act(() => {
      result.current.pickerStates.requests.onPrimarySkillPickerRequested(
        "primary-row",
        trigger,
      );
    });

    expect(result.current.pickers.dialogsProps.primarySkill.isOpen).toBe(true);

    act(() => {
      result.current.pickers.dialogsProps.primarySkill.onSelect("skill-id");
    });

    expect(onPrimarySkillSelect).toHaveBeenCalledWith(
      "primary-row",
      "skill-id",
    );
    expect(result.current.pickerStates.primarySkill.rowId).toBeNull();
  });

  it("routes every picker selection to its requested row or target and closes it", () => {
    const callbacks = {
      armor: vi.fn(),
      common: vi.fn(),
      cybernetics: vi.fn(),
      drugs: vi.fn(),
      ikizama: vi.fn(),
      nanomachines: vi.fn(),
      omamori: vi.fn(),
      otherRyugi: vi.fn(),
      primary: vi.fn(),
      weapon: vi.fn(),
    };
    const getOtherRyugiCandidateGroups = vi.fn(() => ({
      advanced: [],
      basic: [],
    }));
    const getOtherRyugiSelectedSkillIds = vi.fn(() => []);
    const selectedDrug = getDrugs()[0];
    if (selectedDrug === undefined) {
      throw new Error("drug picker test用のmaster dataがありません。");
    }
    const { result } = renderHook(() => {
      const form = useForm<CharacterSheetFormValues>({
        defaultValues: characterSheetDefaultValues,
      });
      const pickerStates = usePickerStates();
      const presenterProps = useMemo(
        () =>
          ({
            commonSkillPicker: { candidates: [], onSelect: callbacks.common },
            commonSkillsSection: { rows: [] },
            cyberneticsSection: { onSelect: callbacks.cybernetics },
            drugsSection: { onSelect: callbacks.drugs },
            ikizamaSkillPicker: {
              candidateGroups: { advanced: [], basic: [], bonus: [] },
              onSelect: callbacks.ikizama,
            },
            nanomachinesSection: { onSelect: callbacks.nanomachines },
            omamoriSection: { onSelect: callbacks.omamori },
            otherRyugiSkillPicker: {
              getCandidateGroups: getOtherRyugiCandidateGroups,
              getSelectedSkillIds: getOtherRyugiSelectedSkillIds,
              onSelect: callbacks.otherRyugi,
            },
            primarySkillPicker: {
              candidateGroups: { advanced: [], basic: [], bonus: [] },
              onSelect: callbacks.primary,
            },
            primarySkillsSection: { rows: [] },
            weaponsAndArmorSection: {
              onArmorSelect: callbacks.armor,
              onWeaponSelect: callbacks.weapon,
            },
          }) as PickerPresenterState,
        [],
      );

      return {
        form,
        pickerStates,
        pickers: usePickers({ form, pickerStates, presenterProps }),
      };
    });
    const trigger = document.createElement("button");
    const cyberneticsTarget = { kind: "fixed", part: "head" } as const;

    act(() => {
      result.current.form.setValue("otherRyugiSkills.rows", [
        {
          level: 1,
          rowId: "other-skill-row",
          ryugiRowId: "other-ryugi-row",
          skillId: null,
        },
      ]);
      result.current.form.setValue("drugs.rows", [
        { drugId: selectedDrug.id, quantity: 1, rowId: "selected-drug-row" },
        { drugId: null, quantity: 1, rowId: "drug-row" },
      ]);
      result.current.pickerStates.requests.onPrimarySkillPickerRequested(
        "primary-row",
        trigger,
      );
      result.current.pickerStates.requests.onIkizamaSkillPickerRequested(
        "ikizama-row",
        trigger,
      );
      result.current.pickerStates.requests.onCommonSkillPickerRequested(
        "common-row",
        trigger,
      );
      result.current.pickerStates.requests.onOtherRyugiSkillPickerRequested(
        "other-skill-row",
        trigger,
      );
      result.current.pickerStates.requests.onWeaponPickerRequested(
        "weapon-row",
        trigger,
      );
      result.current.pickerStates.requests.onArmorPickerRequested(trigger);
      result.current.pickerStates.requests.onOmamoriPickerRequested(
        "omamori-row",
        trigger,
      );
      result.current.pickerStates.requests.onDrugsPickerRequested(
        "drug-row",
        trigger,
      );
      result.current.pickerStates.requests.onCyberneticsPickerRequested(
        cyberneticsTarget,
        trigger,
      );
      result.current.pickerStates.requests.onNanomachinesPickerRequested(
        "head",
        trigger,
      );
    });

    expect(result.current.pickers.dialogsProps.drugs.selectedDrugIds).toEqual([
      selectedDrug.id,
    ]);
    expect(getOtherRyugiCandidateGroups).toHaveBeenCalledWith(
      "other-ryugi-row",
    );
    expect(getOtherRyugiSelectedSkillIds).toHaveBeenCalledWith(
      "other-ryugi-row",
    );
    expect(result.current.pickers.dialogsProps.weapon.groups).toEqual(
      getWeaponCandidateGroups(null),
    );

    act(() => {
      result.current.pickers.dialogsProps.primarySkill.onSelect("primary-id");
      result.current.pickers.dialogsProps.ikizamaSkill.onSelect("ikizama-id");
      result.current.pickers.dialogsProps.commonSkill.onSelect("common-id");
      result.current.pickers.dialogsProps.otherRyugiSkill.onSelect("other-id");
      result.current.pickers.dialogsProps.weapon.onSelect("weapon-id");
      result.current.pickers.dialogsProps.armor.onSelect("armor-id");
      result.current.pickers.dialogsProps.omamori.onSelect("omamori-id");
      result.current.pickers.dialogsProps.drugs.onSelect("drug-id");
      result.current.pickers.dialogsProps.cybernetics.onSelect("cybernetic-id");
      result.current.pickers.dialogsProps.nanomachines.onSelect(
        "nanomachine-id",
      );
    });

    expect(callbacks.primary).toHaveBeenCalledWith("primary-row", "primary-id");
    expect(callbacks.ikizama).toHaveBeenCalledWith("ikizama-row", "ikizama-id");
    expect(callbacks.common).toHaveBeenCalledWith("common-row", "common-id");
    expect(callbacks.otherRyugi).toHaveBeenCalledWith(
      "other-skill-row",
      "other-id",
    );
    expect(callbacks.weapon).toHaveBeenCalledWith("weapon-row", "weapon-id");
    expect(callbacks.armor).toHaveBeenCalledWith("armor-id");
    expect(callbacks.omamori).toHaveBeenCalledWith("omamori-row", "omamori-id");
    expect(callbacks.drugs).toHaveBeenCalledWith("drug-row", "drug-id");
    expect(callbacks.cybernetics).toHaveBeenCalledWith(
      cyberneticsTarget,
      "cybernetic-id",
    );
    expect(callbacks.nanomachines).toHaveBeenCalledWith(
      "head",
      "nanomachine-id",
    );
    expect(result.current.pickerStates.primarySkill.rowId).toBeNull();
    expect(result.current.pickerStates.armor.isOpen).toBe(false);
    expect(result.current.pickerStates.cybernetics.target).toBeNull();
    expect(result.current.pickerStates.nanomachines.target).toBeNull();
  });
});

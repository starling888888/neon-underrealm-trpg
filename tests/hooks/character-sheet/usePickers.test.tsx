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
});

// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import usePickerStates from "../../../src/character-sheet/hooks/usePickerStates";

describe("usePickerStates", () => {
  it("keeps every picker target and focus trigger independent", () => {
    const { result } = renderHook(() => usePickerStates());
    const commonSkillBefore = result.current.commonSkill;
    const primaryTrigger = document.createElement("button");
    const drugTrigger = document.createElement("button");

    act(() => {
      result.current.requests.onPrimarySkillPickerRequested(
        "primary-row",
        primaryTrigger,
      );
    });

    expect(result.current.primarySkill.rowId).toBe("primary-row");
    expect(result.current.primarySkill.triggerRef.current).toBe(primaryTrigger);
    expect(result.current.commonSkill).toBe(commonSkillBefore);

    act(() => {
      result.current.requests.onDrugsPickerRequested("drug-row", drugTrigger);
    });

    expect(result.current.primarySkill.rowId).toBe("primary-row");
    expect(result.current.drugs.rowId).toBe("drug-row");
    expect(result.current.drugs.triggerRef.current).toBe(drugTrigger);

    act(() => {
      result.current.primarySkill.close();
    });

    expect(result.current.primarySkill.rowId).toBeNull();
    expect(result.current.drugs.rowId).toBe("drug-row");
  });

  it("keeps boolean and target picker state with their own return triggers", () => {
    const { result } = renderHook(() => usePickerStates());
    const armorTrigger = document.createElement("button");
    const cyberneticsTrigger = document.createElement("button");
    const nanomachinesTrigger = document.createElement("button");

    act(() => {
      result.current.requests.onArmorPickerRequested(armorTrigger);
      result.current.requests.onCyberneticsPickerRequested(
        { kind: "fixed", part: "head" },
        cyberneticsTrigger,
      );
      result.current.requests.onNanomachinesPickerRequested(
        "head",
        nanomachinesTrigger,
      );
    });

    expect(result.current.armor.isOpen).toBe(true);
    expect(result.current.armor.triggerRef.current).toBe(armorTrigger);
    expect(result.current.cybernetics.target).toEqual({
      kind: "fixed",
      part: "head",
    });
    expect(result.current.cybernetics.triggerRef.current).toBe(
      cyberneticsTrigger,
    );
    expect(result.current.nanomachines.target).toBe("head");
    expect(result.current.nanomachines.triggerRef.current).toBe(
      nanomachinesTrigger,
    );

    act(() => {
      result.current.armor.close();
      result.current.cybernetics.close();
      result.current.nanomachines.close();
    });

    expect(result.current.armor.isOpen).toBe(false);
    expect(result.current.cybernetics.target).toBeNull();
    expect(result.current.nanomachines.target).toBeNull();
  });
});

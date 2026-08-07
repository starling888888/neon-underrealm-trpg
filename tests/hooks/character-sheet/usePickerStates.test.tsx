// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import usePickerStates from "../../../src/character-sheet/usePickerStates";

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
});

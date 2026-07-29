// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import useCyberneticsSectionProps from "../../../src/character-sheet/form/useCyberneticsSectionProps";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form-values";
import { calculateBuild } from "../../../src/character-sheet/logic/build";
import { getCybernetics } from "../../../src/character-sheet/master-data/cybernetics";

function useCyberneticsHarness() {
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
  });
  const props = useCyberneticsSectionProps(
    form,
    calculateBuild(form.getValues("build")),
    { onPickerRequest: vi.fn() },
  );

  return { form, props };
}

describe("useCyberneticsSectionProps", () => {
  it("keeps fixed rows, limits other rows, and updates a selected row by stable identity", () => {
    const { result } = renderHook(() => useCyberneticsHarness());
    const item = getCybernetics()[0];
    if (item === undefined)
      throw new Error("サイバネmaster dataがありません。");
    const firstOther = result.current.form.getValues(
      "cybernetics.otherRows",
    )[0];
    if (firstOther === undefined) throw new Error("その他行がありません。");

    act(() => {
      result.current.props.onSelect({ kind: "fixed", part: "head" }, item.id);
      result.current.props.onSelect(
        { kind: "other", rowId: firstOther.rowId },
        item.id,
      );
      result.current.props.onAddOther();
      result.current.props.onAddOther();
      result.current.props.onAddOther();
      result.current.props.onAddOther();
    });

    expect(result.current.form.getValues("cybernetics.headId")).toBe(item.id);
    expect(result.current.form.getValues("cybernetics.otherRows")).toHaveLength(
      4,
    );
    act(() => result.current.props.onClearFixed("head"));
    expect(result.current.form.getValues("cybernetics.headId")).toBeNull();
  });

  it("resets all noncombat modifiers only when the final total crosses a threshold", () => {
    const { result } = renderHook(() => useCyberneticsHarness());

    act(() => {
      result.current.props.onModifierChange("implantTotalModifier", "6");
    });
    expect(
      result.current.form.getValues("checks.noncombat.intimidation.modifier"),
    ).toBe(-2);

    act(() => {
      result.current.form.setValue(
        "checks.noncombat.intimidation.modifier",
        12,
      );
      result.current.props.onModifierChange("implantTotalModifier", "7");
    });
    expect(
      result.current.form.getValues("checks.noncombat.intimidation.modifier"),
    ).toBe(12);

    act(() => {
      result.current.props.onModifierChange("implantTotalModifier", "11");
    });
    expect(
      result.current.form.getValues("checks.noncombat.intimidation.modifier"),
    ).toBe(-4);
  });
});

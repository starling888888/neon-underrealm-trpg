// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import useCyberneticsSectionProps from "../../../src/character-sheet/form/useCyberneticsSectionProps";
import useSpecialItemsSectionProps from "../../../src/character-sheet/form/useSpecialItemsSectionProps";
import {
  type BuildValues,
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form-values";
import { calculateBuild as calculateBuildFromSources } from "../../../src/character-sheet/logic/build";
import { getBuildSources } from "../../../src/character-sheet/master-data/build";
import { getCybernetics } from "../../../src/character-sheet/master-data/cybernetics";

function calculateBuild(build: BuildValues, commonSkillLevelTotal = 0) {
  return calculateBuildFromSources(
    build,
    getBuildSources(build),
    commonSkillLevelTotal,
  );
}

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

function useCyberneticsCategoryHarness() {
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
  });
  const shouldSynchronizeCyberneticsRef = useRef(false);
  const props = useCyberneticsSectionProps(
    form,
    calculateBuild(form.getValues("build")),
    { onPickerRequest: vi.fn(), shouldSynchronizeCyberneticsRef },
  );
  const specialItems = useSpecialItemsSectionProps(form, {
    onRemoveRequested: (_category, _trigger, applyRemoval) => applyRemoval(),
    shouldSynchronizeCyberneticsRef,
  });

  return { form, props, specialItems };
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

  it("marks a fixed row invalid when its selected cybernetic has another part", () => {
    const armCybernetic = getCybernetics().find(
      (cybernetic) => cybernetic.part === "腕",
    );
    if (armCybernetic === undefined) {
      throw new Error("サイバネmaster dataに腕部品がありません。");
    }
    const { result } = renderHook(() => useCyberneticsHarness());

    act(() => {
      result.current.props.onSelect(
        { kind: "fixed", part: "head" },
        armCybernetic.id,
      );
    });

    expect(
      result.current.props.fixedRows.find((row) => row.part === "head")
        ?.hasPartError,
    ).toBe(true);
  });

  it("does not carry a same-threshold user change into an external reset", () => {
    const { result } = renderHook(() => useCyberneticsHarness());
    const imported = structuredClone(characterSheetDefaultValues);
    imported.cybernetics.implantTotalModifier = 6;
    imported.checks.noncombat.intimidation.modifier = 12;

    act(() => {
      result.current.props.onModifierChange("implantTotalModifier", "1");
    });
    act(() => {
      result.current.form.reset(imported);
    });

    expect(
      result.current.form.getValues("checks.noncombat.intimidation.modifier"),
    ).toBe(12);
  });

  it("resets noncombat modifiers when a cybernetics category removal crosses a threshold", () => {
    const { result } = renderHook(() => useCyberneticsCategoryHarness());

    act(() => {
      result.current.specialItems.sectionProps.onAddCategory("cybernetics");
      result.current.props.onModifierChange("implantTotalModifier", "6");
    });
    expect(
      result.current.form.getValues("checks.noncombat.intimidation.modifier"),
    ).toBe(-2);

    act(() => {
      result.current.specialItems.sectionProps.onRemoveCategory(
        "cybernetics",
        document.createElement("button"),
      );
    });

    expect(
      result.current.form.getValues("cybernetics.implantTotalModifier"),
    ).toBe(0);
    expect(
      result.current.form.getValues("checks.noncombat.intimidation.modifier"),
    ).toBe(0);
  });
});

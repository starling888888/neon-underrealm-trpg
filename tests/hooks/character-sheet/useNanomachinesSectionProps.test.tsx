// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import useNanomachinesSectionProps from "../../../src/character-sheet/form/useNanomachinesSectionProps";
import {
  type BuildValues,
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form/values";
import { calculateBuild as calculateBuildFromSources } from "../../../src/character-sheet/logic/build";
import { getBuildSources } from "../../../src/character-sheet/master-data/build";
import { getNanomachines } from "../../../src/character-sheet/master-data/nanomachines";

function calculateBuild(build: BuildValues, commonSkillLevelTotal = 0) {
  return calculateBuildFromSources(
    build,
    getBuildSources(build),
    commonSkillLevelTotal,
  );
}

function useNanomachinesHarness() {
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
  });
  const props = useNanomachinesSectionProps(
    form,
    calculateBuild(form.getValues("build")),
    { onPickerRequest: vi.fn() },
  );

  return { form, props };
}

describe("useNanomachinesSectionProps", () => {
  it("keeps four fixed rows, accepts duplicate selections, clears a row, and stores modifiers", () => {
    const { result } = renderHook(() => useNanomachinesHarness());
    const item = getNanomachines()[0];
    if (item === undefined) {
      throw new Error("ナノマシンmaster dataがありません。");
    }

    expect(result.current.props.fixedRows).toHaveLength(4);
    act(() => {
      result.current.props.onSelect("head", item.id);
      result.current.props.onSelect("torso", item.id);
      result.current.props.onModifierChange("implantTotalModifier", "-1");
      result.current.props.onModifierChange("implantLimitModifier", "2");
    });

    expect(result.current.form.getValues("nanomachines.headId")).toBe(item.id);
    expect(result.current.form.getValues("nanomachines.torsoId")).toBe(item.id);
    expect(
      result.current.form.getValues("nanomachines.implantTotalModifier"),
    ).toBe(-1);
    expect(
      result.current.form.getValues("nanomachines.implantLimitModifier"),
    ).toBe(2);

    act(() => result.current.props.onClear("head"));
    expect(result.current.form.getValues("nanomachines.headId")).toBeNull();
  });
});

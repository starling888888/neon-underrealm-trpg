// @vitest-environment jsdom

import { zodResolver } from "@hookform/resolvers/zod";
import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import useCharacterSheetFormPresenterProps from "../../../src/character-sheet/form/useCharacterSheetFormPresenterProps";
import type { CharacterSheetFormValues } from "../../../src/character-sheet/form-values";
import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import { characterSheetFormSchema } from "../../../src/character-sheet/schemas/character-sheet-form";

function usePresenterHarness() {
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
    mode: "onChange",
    resolver: zodResolver(characterSheetFormSchema),
  });

  return {
    form,
    presenterProps: useCharacterSheetFormPresenterProps(form, {
      characterImage: null,
      isRootOperationInProgress: false,
      onCharacterImageCleared: async () => {},
      onCharacterImageSelected: async () => {},
      onCharacterImageOperationStarted: () => {},
    }),
  };
}

describe("useCharacterSheetFormPresenterProps", () => {
  it("connects normalized credit inputs and derived values through RHF", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const { profileSection } = result.current.presenterProps;

    act(() => {
      profileSection.onCreditChange("acquired", "15");
      profileSection.onCreditChange("provided", "-3");
      profileSection.onCreditChange("received", "4");
      profileSection.onCreditChange("changeAdjustment", "-2");
    });

    expect(result.current.form.getValues("credit")).toEqual({
      acquired: 15,
      changeAdjustment: -2,
      provided: 0,
      received: 4,
    });
    expect(result.current.presenterProps.profileSection.creditSummary).toEqual({
      change: 17,
      totalCredit: 19,
    });
  });

  it("returns an emptied credit field to zero and updates profile props", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.profileSection.onCreditBlur("acquired", "");
      result.current.presenterProps.profileSection.onProfileChange(
        "pcName",
        "ネオン",
      );
    });

    expect(result.current.form.getValues("credit.acquired")).toBe(0);
    expect(result.current.presenterProps.profileSection.profile.pcName).toBe(
      "ネオン",
    );
  });

  it("keeps consecutive build selections instead of overwriting the first one", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.buildSection.onPrimaryRyugiChange(
        "kenkaya",
      );
      result.current.presenterProps.buildSection.onIkizamaChange("burai");
    });

    expect(result.current.form.getValues("build.primaryRyugiId")).toBe(
      "kenkaya",
    );
    expect(result.current.form.getValues("build.ikizamaId")).toBe("burai");
    expect(
      result.current.presenterProps.buildSection.derived.reference
        .ikizamaHealthCoefficient,
    ).toBe(11);
  });

  it("connects acquired experience through the basic-information props", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.profileSection.experience.onAcquiredChange(
        "70",
      );
    });

    expect(result.current.form.getValues("build.acquiredExperience")).toBe(70);
    expect(
      result.current.presenterProps.profileSection.experience.acquired,
    ).toBe(70);
  });

  it("connects secondary corrections and temporary-value choices through RHF", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.secondaryAttributesSection.onNumberChange(
        "movementModifier",
        "-2",
      );
      result.current.presenterProps.secondaryAttributesSection.onTemporaryAppliedChange(
        "applyTemporaryMovement",
        true,
      );
    });

    expect(
      result.current.form.getValues("secondaryAttributes.movementModifier"),
    ).toBe(-2);
    expect(
      result.current.form.getValues(
        "secondaryAttributes.applyTemporaryMovement",
      ),
    ).toBe(true);
  });

  it("keeps resolved bonds locked until the resolve checkbox is removed", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const firstRowId = result.current.form.getValues("bonds.rows.0.rowId");

    act(() => {
      result.current.presenterProps.bondsSection.onRowChange(
        firstRowId,
        "target",
        "アキラ",
      );
      result.current.presenterProps.bondsSection.onRowChange(
        firstRowId,
        "isResolved",
        true,
      );
    });

    expect(result.current.form.getValues("bonds.rows.0")).toMatchObject({
      isResolved: true,
      target: "アキラ",
    });

    act(() => {
      result.current.presenterProps.bondsSection.onRowClear(firstRowId);
    });

    expect(result.current.form.getValues("bonds.rows.0")).toMatchObject({
      isResolved: true,
      rowId: firstRowId,
      target: "アキラ",
    });

    act(() => {
      result.current.presenterProps.bondsSection.onRowChange(
        firstRowId,
        "isResolved",
        false,
      );
      result.current.presenterProps.bondsSection.onRowClear(firstRowId);
    });

    expect(result.current.form.getValues("bonds.rows.0")).toMatchObject({
      isResolved: false,
      relation: "",
      rowId: firstRowId,
      target: "",
    });
  });

  it("removes empty bond rows after a limit decrease and preserves overflow rows", () => {
    const { result } = renderHook(() => usePresenterHarness());

    act(() => {
      result.current.presenterProps.secondaryAttributesSection.onNumberChange(
        "bondLimitModifier",
        "2",
      );
    });

    act(() => {
      result.current.presenterProps.bondsSection.onRowChange(
        result.current.form.getValues("bonds.rows.0.rowId"),
        "target",
        "アキラ",
      );
      result.current.presenterProps.bondsSection.onRowChange(
        result.current.form.getValues("bonds.rows.1.rowId"),
        "target",
        "ベラ",
      );
      result.current.presenterProps.secondaryAttributesSection.onNumberChange(
        "bondLimitModifier",
        "-3",
      );
    });

    expect(result.current.form.getValues("bonds.rows")).toHaveLength(2);
    expect(result.current.presenterProps.bondsSection.derived.isOverLimit).toBe(
      true,
    );
    expect(
      result.current.presenterProps.bondsSection.derived.overflowRowIds,
    ).toEqual([result.current.form.getValues("bonds.rows.1.rowId")]);

    act(() => {
      result.current.presenterProps.bondsSection.onRowDelete(
        result.current.form.getValues("bonds.rows.1.rowId"),
      );
    });

    expect(result.current.form.getValues("bonds.rows")).toHaveLength(1);
  });

  it("keeps attack rows, reaction rows, and their derived counts in the RHF boundary", () => {
    const { result } = renderHook(() => usePresenterHarness());
    const checks = result.current.presenterProps.checksSection;

    act(() => {
      checks.onAttackAdd();
      checks.onAttackSkillChange("attack-1", "shooting");
      checks.onAttackModifierChange("attack-1", "-2");
      checks.onReactionAttributeChange("defense", "agility");
      checks.onReactionModifierChange("defense", "3");
    });

    expect(result.current.form.getValues("checks.attacks")).toHaveLength(2);
    expect(result.current.form.getValues("checks.attacks.0")).toMatchObject({
      attribute: "perception",
      modifier: -2,
      skill: "shooting",
    });
    expect(result.current.form.getValues("checks.reactions.0")).toEqual({
      attribute: "agility",
      modifier: 3,
      name: "defense",
    });
    expect(
      result.current.presenterProps.checksSection.attacks[0],
    ).toMatchObject({
      permanentAttribute: null,
      permanentCheck: null,
      temporaryAttribute: null,
      temporaryCheck: null,
    });

    act(() => {
      result.current.presenterProps.checksSection.onAttackRemove("attack-1");
      result.current.presenterProps.checksSection.onAttackRemove(
        result.current.form.getValues("checks.attacks.0.rowId"),
      );
    });

    expect(result.current.form.getValues("checks.attacks")).toHaveLength(1);
  });
});

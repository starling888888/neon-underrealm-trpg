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
    expect(result.current.presenterProps.buildSection.derived.ikizamaName).toBe(
      "ブライ",
    );
  });
});

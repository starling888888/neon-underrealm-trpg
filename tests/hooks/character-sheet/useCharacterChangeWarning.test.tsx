// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form/values";
import useCharacterChangeWarning from "../../../src/character-sheet/hooks/useCharacterChangeWarning";

describe("useCharacterChangeWarning", () => {
  it("confirms a dependent primary ryugi change before clearing skills and applying it", () => {
    const clearPrimaryRyugiSkills = vi.fn();
    const applyChange = vi.fn();
    const { result } = renderHook(() => {
      const form = useForm<CharacterSheetFormValues>({
        defaultValues: characterSheetDefaultValues,
      });
      const warning = useCharacterChangeWarning({ form });
      warning.bindPresenterOperations({
        clearIkizamaSkills: vi.fn(),
        clearOtherRyugiSkills: vi.fn(),
        clearPrimaryRyugiSkills,
        removeOtherRyugiSkills: vi.fn(),
      });
      return { form, warning };
    });
    const trigger = document.createElement("select");

    act(() => {
      result.current.form.setValue("build.primaryRyugiId", "kenkaya");
      result.current.form.setValue("primarySkills.rows.0.skillId", "skill-id");
      result.current.warning.presenterOptions.onPrimaryRyugiChangeRequested(
        "emono",
        trigger,
        applyChange,
      );
    });

    expect(result.current.warning.dialogsProps.primaryRyugi.isOpen).toBe(true);
    expect(applyChange).not.toHaveBeenCalled();

    act(() => {
      result.current.warning.dialogsProps.primaryRyugi.onConfirm();
    });

    expect(clearPrimaryRyugiSkills).toHaveBeenCalledOnce();
    expect(applyChange).toHaveBeenCalledOnce();
    expect(result.current.warning.dialogsProps.primaryRyugi.isOpen).toBe(false);
  });

  it("clears unconfirmed other ryugi rows immediately and keeps a category removal pending until confirmation", () => {
    const clearOtherRyugiSkills = vi.fn();
    const applyOtherRyugiChange = vi.fn();
    const applyCategoryRemoval = vi.fn();
    const { result } = renderHook(() => {
      const form = useForm<CharacterSheetFormValues>({
        defaultValues: characterSheetDefaultValues,
      });
      const warning = useCharacterChangeWarning({ form });
      warning.bindPresenterOperations({
        clearIkizamaSkills: vi.fn(),
        clearOtherRyugiSkills,
        clearPrimaryRyugiSkills: vi.fn(),
        removeOtherRyugiSkills: vi.fn(),
      });
      return { form, warning };
    });
    const selectTrigger = document.createElement("select");
    const buttonTrigger = document.createElement("button");

    act(() => {
      result.current.form.setValue("build.otherRyugi", [
        { level: 1, rowId: "other-ryugi-row", ryugiId: "kenkaya" },
      ]);
      result.current.warning.presenterOptions.onOtherRyugiChangeRequested(
        "other-ryugi-row",
        "emono",
        selectTrigger,
        applyOtherRyugiChange,
      );
    });

    expect(clearOtherRyugiSkills).toHaveBeenCalledWith("other-ryugi-row");
    expect(applyOtherRyugiChange).toHaveBeenCalledOnce();
    expect(result.current.warning.dialogsProps.otherRyugiChange.isOpen).toBe(
      false,
    );

    act(() => {
      result.current.warning.presenterOptions.onSpecialItemCategoryRemoveRequested(
        "drugs",
        buttonTrigger,
        applyCategoryRemoval,
      );
    });

    expect(result.current.warning.dialogsProps.specialItemCategory.isOpen).toBe(
      true,
    );
    expect(applyCategoryRemoval).not.toHaveBeenCalled();

    act(() => {
      result.current.warning.dialogsProps.specialItemCategory.onConfirm();
    });

    expect(applyCategoryRemoval).toHaveBeenCalledOnce();
  });
});

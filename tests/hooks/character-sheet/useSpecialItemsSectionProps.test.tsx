// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import useSpecialItemsSectionProps from "../../../src/character-sheet/form/useSpecialItemsSectionProps";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form/values";

describe("useSpecialItemsSectionProps", () => {
  it("does not treat an unselected drug row's default quantity as category content", () => {
    const onRemoveRequested = vi.fn();
    const { result } = renderHook(() => {
      const form = useForm<CharacterSheetFormValues>({
        defaultValues: characterSheetDefaultValues,
      });
      const specialItems = useSpecialItemsSectionProps(form, {
        onRemoveRequested,
      });
      return { form, specialItems };
    });

    act(() => {
      result.current.form.setValue("specialItems.categories", ["drugs"]);
      result.current.specialItems.sectionProps.onRemoveCategory(
        "drugs",
        document.createElement("button"),
      );
    });

    expect(onRemoveRequested).not.toHaveBeenCalled();
    expect(result.current.form.getValues("specialItems.categories")).toEqual(
      [],
    );
  });
});

// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import useDrugsSectionProps from "../../../src/character-sheet/form/useDrugsSectionProps";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form-values";
import { getDrugs } from "../../../src/character-sheet/master-data/drugs";

function useDrugsHarness() {
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
  });
  const props = useDrugsSectionProps(form, { onPickerRequest: vi.fn() });

  return { form, props };
}

describe("useDrugsSectionProps", () => {
  it("normalizes quantities, preserves them across selection changes, and creates rows with one set", () => {
    const { result } = renderHook(() => useDrugsHarness());
    const drug = getDrugs()[0];
    if (drug === undefined)
      throw new Error("ドラッグmaster dataがありません。");
    const [firstRow, secondRow, thirdRow] =
      result.current.form.getValues("drugs.rows");

    if (
      firstRow === undefined ||
      secondRow === undefined ||
      thirdRow === undefined
    ) {
      throw new Error("ドラッグ初期行がありません。");
    }
    expect([firstRow, secondRow, thirdRow].map((row) => row.quantity)).toEqual([
      1, 1, 1,
    ]);

    act(() => {
      result.current.props.onQuantityChange(firstRow.rowId, "4.8");
    });
    expect(result.current.form.getValues("drugs.rows.0.quantity")).toBe(4);

    act(() => {
      result.current.props.onSelect(firstRow.rowId, drug.id);
    });
    expect(result.current.form.getValues("drugs.rows.0")).toMatchObject({
      drugId: drug.id,
      quantity: 4,
    });

    act(() => {
      result.current.props.onQuantityChange(firstRow.rowId, "-2");
      result.current.props.onQuantityChange(secondRow.rowId, "");
    });
    expect(result.current.form.getValues("drugs.rows.0.quantity")).toBe(0);
    expect(result.current.form.getValues("drugs.rows.1.quantity")).toBe(0);

    act(() => {
      result.current.props.onMove(thirdRow.rowId, "up");
      result.current.props.onRemove(firstRow.rowId);
      result.current.props.onRemove(secondRow.rowId);
      result.current.props.onRemove(thirdRow.rowId);
    });

    expect(result.current.form.getValues("drugs.rows")).toEqual([]);

    act(() => {
      result.current.props.onAdd();
    });
    const [restoredRow] = result.current.form.getValues("drugs.rows");
    expect(restoredRow).toMatchObject({ drugId: null, quantity: 1 });
    expect(restoredRow?.rowId).toBeTruthy();
    expect(restoredRow?.rowId).not.toBe(firstRow.rowId);
  });

  it("keeps duplicate selections visible as errors while the picker can disable them", () => {
    const { result } = renderHook(() => useDrugsHarness());
    const drug = getDrugs()[0];
    if (drug === undefined)
      throw new Error("ドラッグmaster dataがありません。");
    const [firstRow, secondRow] = result.current.form.getValues("drugs.rows");
    if (firstRow === undefined || secondRow === undefined) {
      throw new Error("ドラッグ初期行がありません。");
    }

    act(() => {
      result.current.props.onSelect(firstRow.rowId, drug.id);
      result.current.props.onSelect(secondRow.rowId, drug.id);
    });

    expect(
      result.current.props.rows
        .filter((row) => row.hasDuplicateSelection)
        .map((row) => row.rowId),
    ).toEqual([firstRow.rowId, secondRow.rowId]);
  });
});

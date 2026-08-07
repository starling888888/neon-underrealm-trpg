// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import useOmamoriSectionProps from "../../../src/character-sheet/form/useOmamoriSectionProps";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form/values";
import { getOmamori } from "../../../src/character-sheet/master-data/omamori";

function useOmamoriHarness() {
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
  });
  const props = useOmamoriSectionProps(form, { onPickerRequest: vi.fn() });

  return { form, props };
}

describe("useOmamoriSectionProps", () => {
  it("starts empty and supports duplicate selection, movement, and removal to zero rows", () => {
    const { result } = renderHook(() => useOmamoriHarness());
    const item = getOmamori()[0];
    if (item === undefined) throw new Error("お守りmaster dataがありません。");

    expect(result.current.form.getValues("omamori.rows")).toEqual([]);

    act(() => {
      result.current.props.onAdd();
      result.current.props.onAdd();
    });

    const [firstRow, secondRow] = result.current.form.getValues("omamori.rows");
    if (firstRow === undefined || secondRow === undefined) {
      throw new Error("お守り行を追加できません。");
    }

    act(() => {
      result.current.props.onSelect(firstRow.rowId, item.id);
      result.current.props.onSelect(secondRow.rowId, item.id);
      result.current.props.onMove(secondRow.rowId, "up");
    });

    expect(result.current.form.getValues("omamori.rows")).toEqual([
      { omamoriId: item.id, rowId: secondRow.rowId },
      { omamoriId: item.id, rowId: firstRow.rowId },
    ]);

    act(() => {
      result.current.props.onRemove(secondRow.rowId);
      result.current.props.onRemove(firstRow.rowId);
    });

    expect(result.current.form.getValues("omamori.rows")).toEqual([]);
  });

  it("updates only the row selected by stable row ID", () => {
    const { result } = renderHook(() => useOmamoriHarness());
    const [firstItem, secondItem] = getOmamori();
    if (firstItem === undefined || secondItem === undefined) {
      throw new Error("お守りmaster dataが不足しています。");
    }

    act(() => {
      result.current.props.onAdd();
      result.current.props.onAdd();
    });
    const [firstRow, secondRow] = result.current.form.getValues("omamori.rows");
    if (firstRow === undefined || secondRow === undefined) {
      throw new Error("お守り行を追加できません。");
    }

    act(() => {
      result.current.props.onSelect(firstRow.rowId, firstItem.id);
      result.current.props.onSelect(secondRow.rowId, secondItem.id);
      result.current.props.onSelect(secondRow.rowId, firstItem.id);
    });

    expect(result.current.form.getValues("omamori.rows")).toEqual([
      { omamoriId: firstItem.id, rowId: firstRow.rowId },
      { omamoriId: firstItem.id, rowId: secondRow.rowId },
    ]);
  });
});

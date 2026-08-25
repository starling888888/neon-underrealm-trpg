// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import useCharacterSheetToast from "../../../src/character-sheet/hooks/useCharacterSheetToast";

describe("useCharacterSheetToast", () => {
  it("stacks newer notifications first and expires one notification by ID", () => {
    const { result } = renderHook(() => useCharacterSheetToast());

    act(() => {
      result.current.notify("success", "saved");
      result.current.notify("error", "failed");
    });

    expect(result.current.messages).toEqual([
      { id: 1, kind: "error", message: "failed" },
      { id: 0, kind: "success", message: "saved" },
    ]);

    act(() => result.current.expire(1));
    expect(result.current.messages).toEqual([
      { id: 0, kind: "success", message: "saved" },
    ]);
  });
});

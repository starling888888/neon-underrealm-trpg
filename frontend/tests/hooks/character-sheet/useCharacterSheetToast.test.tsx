// @vitest-environment jsdom

import { act, cleanup, render, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import CharacterSheetToast from "../../../src/character-sheet/components/CharacterSheetToast";
import useCharacterSheetToast from "../../../src/character-sheet/hooks/useCharacterSheetToast";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

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

  it("expires each notification five seconds after that notification appears", () => {
    vi.useFakeTimers();
    const onExpire = vi.fn();
    const { rerender } = render(
      <CharacterSheetToast
        messages={[{ id: 0, kind: "success", message: "first" }]}
        onExpire={onExpire}
      />,
    );

    act(() => vi.advanceTimersByTime(4000));
    rerender(
      <CharacterSheetToast
        messages={[
          { id: 1, kind: "error", message: "second" },
          { id: 0, kind: "success", message: "first" },
        ]}
        onExpire={onExpire}
      />,
    );

    act(() => vi.advanceTimersByTime(1000));
    expect(onExpire).toHaveBeenCalledExactlyOnceWith(0);

    act(() => vi.advanceTimersByTime(4000));
    expect(onExpire).toHaveBeenLastCalledWith(1);
  });
});

// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import FormulaTooltip from "../../../src/character-sheet/components/FormulaTooltip";
import styles from "../../../src/character-sheet/components/FormulaTooltip.module.css";

function createRect({
  height = 0,
  left = 0,
  top = 0,
  width = 0,
}: {
  height?: number;
  left?: number;
  top?: number;
  width?: number;
} = {}): DOMRect {
  return {
    bottom: top + height,
    height,
    left,
    right: left + width,
    toJSON: () => ({}),
    top,
    width,
    x: left,
    y: top,
  } as DOMRect;
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("FormulaTooltip", () => {
  it("opens below a trigger when there is not enough space above", () => {
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        if (this.getAttribute("role") === "tooltip") {
          return createRect({ height: 48, width: 160 });
        }

        if (this.getAttribute("aria-label") === "計算式") {
          return createRect({ left: 24, top: 20, width: 64 });
        }

        return createRect();
      },
    );

    render(
      <FormulaTooltip ariaLabel="計算式" formula="確認用の計算式">
        <span>計算式</span>
      </FormulaTooltip>,
    );

    fireEvent.click(screen.getByRole("button", { name: "計算式" }));

    expect(screen.getByRole("tooltip").className).toContain(
      styles.belowTrigger,
    );
  });
});

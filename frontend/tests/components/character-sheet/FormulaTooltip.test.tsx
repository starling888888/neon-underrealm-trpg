// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import FormulaTooltip from "../../../src/character-sheet/components/_common/FormulaTooltip";
import styles from "../../../src/character-sheet/components/_common/FormulaTooltip.module.css";
import { characterSheetDictionary } from "../../../src/character-sheet/dictionary";

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
  it("keeps the tooltip outside the trigger and clamps it inside the viewport", () => {
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 120,
    });
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 200,
    });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        if (this.getAttribute("role") === "tooltip") {
          return createRect({ height: 48, width: 160 });
        }

        if (this.getAttribute("aria-label") === "計算式") {
          return createRect({ height: 20, left: 2, top: 20, width: 64 });
        }

        return createRect();
      },
    );

    const { container } = render(
      <FormulaTooltip ariaLabel="計算式" formula="確認用の計算式">
        <span>計算式</span>
      </FormulaTooltip>,
    );
    const trigger = screen.getByRole("button", { name: "計算式" });
    const indicator = container.querySelector(`.${styles.indicator}`);

    expect(indicator?.textContent).toBe("?");
    expect(indicator?.getAttribute("aria-hidden")).toBe("true");
    expect(indicator?.parentElement).toHaveProperty(
      "className",
      styles.triggerContent,
    );

    fireEvent.click(trigger);

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.parentElement).not.toBe(trigger);
    expect(tooltip.style.left).toBe("16px");
    expect(tooltip.style.top).toBe("44px");
  });

  it("keeps a lower-right tooltip inside the viewport", () => {
    Object.defineProperty(window, "innerHeight", {
      configurable: true,
      value: 120,
    });
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 200,
    });
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(
      function (this: HTMLElement) {
        if (this.getAttribute("role") === "tooltip") {
          return createRect({ height: 48, width: 160 });
        }

        if (this.getAttribute("aria-label") === "計算式") {
          return createRect({ height: 20, left: 180, top: 100, width: 16 });
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

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip.style.left).toBe("24px");
    expect(tooltip.style.top).toBe("48px");
  });

  it("keeps the trigger name stable and supports hover, Escape, blur, outside tap, and scroll dismissal", () => {
    render(
      <FormulaTooltip formula="能力値ポイントの算出式">
        <span>能力値ポイント</span>
      </FormulaTooltip>,
    );

    const trigger = screen.getByRole("button", { name: "能力値ポイント" });

    fireEvent.pointerEnter(trigger, { pointerType: "mouse" });
    expect(screen.getByRole("tooltip").textContent).toBe(
      "能力値ポイントの算出式",
    );
    expect(trigger.textContent).toBe("能力値ポイント?");

    fireEvent.pointerLeave(trigger, { pointerType: "mouse" });
    expect(screen.queryByRole("tooltip")).toBeNull();

    fireEvent.click(trigger);
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("tooltip")).toBeNull();

    fireEvent.click(trigger);
    fireEvent.blur(trigger);
    expect(screen.queryByRole("tooltip")).toBeNull();

    fireEvent.click(trigger);
    fireEvent.click(
      screen.getByRole("button", {
        name: characterSheetDictionary.general.closeFormulaTooltip,
      }),
    );
    expect(screen.queryByRole("tooltip")).toBeNull();

    fireEvent.click(trigger);
    fireEvent.scroll(window);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });
});

// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import NanomachinesSection, {
  type NanomachinesSectionProps,
} from "../../../src/character-sheet/components/sections/NanomachinesSection";
import { calculateNanomachines } from "../../../src/character-sheet/logic/nanomachines";
import { getNanomachines } from "../../../src/character-sheet/master-data/nanomachines";

function createProps(): NanomachinesSectionProps {
  const [nanomachine] = getNanomachines();
  if (nanomachine === undefined) {
    throw new Error("ナノマシンmaster dataが不足しています。");
  }

  return {
    derived: calculateNanomachines([nanomachine], 0, 3, 0),
    fixedRows: [
      { nanomachine, part: "head", rowId: "nanomachine-head" },
      { nanomachine: null, part: "torso", rowId: "nanomachine-torso" },
      { nanomachine: null, part: "arm", rowId: "nanomachine-arm" },
      { nanomachine: null, part: "leg", rowId: "nanomachine-leg" },
    ],
    implantLimitModifier: 0,
    implantTotalModifier: 0,
    onClear: vi.fn(),
    onModifierChange: vi.fn((_, value: string) => Number(value)),
    onPickerRequest: vi.fn(),
    onSelect: vi.fn(),
  };
}

afterEach(cleanup);

describe("NanomachinesSection", () => {
  it("shows four fixed rows, every requested header, and clear operations", () => {
    const props = createProps();
    render(<NanomachinesSection {...props} />);

    expect(screen.getByText("部位")).not.toBeNull();
    expect(screen.getByText("信用")).not.toBeNull();
    expect(screen.getByText(/埋め込み\s+点数/)).not.toBeNull();
    expect(screen.getByText(/発動\s+精神力/)).not.toBeNull();
    for (const label of ["頭", "胴体", "腕", "足"]) {
      expect(
        screen.getByRole("button", {
          name: new RegExp(`${label}：.*をクリア`),
        }),
      ).not.toBeNull();
    }
    expect(props.onClear).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /頭：.*をクリア/ }));
    expect(props.onClear).toHaveBeenCalledWith("head");
  });

  it("expands effects and accepts a negative modifier typed one key at a time", async () => {
    const user = userEvent.setup();
    const props = createProps();
    const nanomachine = props.fixedRows[0]?.nanomachine;
    if (nanomachine === null || nanomachine === undefined) {
      throw new Error("頭部ナノマシンがありません。");
    }
    render(<NanomachinesSection {...props} />);

    fireEvent.click(
      screen.getByRole("button", { name: `頭：${nanomachine.name}効果を開く` }),
    );
    expect(screen.getByText(nanomachine.effect)).not.toBeNull();
    const totalModifier = screen.getByLabelText("埋め込み点数合計の修正");
    await user.clear(totalModifier);
    await user.type(totalModifier, "-1");

    expect((totalModifier as HTMLInputElement).value).toBe("-1");
    expect(props.onModifierChange).toHaveBeenLastCalledWith(
      "implantTotalModifier",
      "-1",
    );
  });

  it("marks only the final implant value invalid when the limit is exceeded", () => {
    const props = createProps();
    props.derived = calculateNanomachines(
      [props.fixedRows[0]?.nanomachine ?? null],
      0,
      0,
      0,
    );
    const { container } = render(<NanomachinesSection {...props} />);

    const finalValue = container.querySelector(
      'output[aria-label="埋め込み点数合計の最終値／埋め込み上限の最終値"]',
    );
    if (finalValue === null) {
      throw new Error("埋め込み点数の最終値が見つかりません。");
    }
    expect(finalValue.getAttribute("aria-invalid")).toBe("true");
    expect(finalValue.closest('[data-invalid="true"]')).not.toBeNull();
    expect(finalValue.closest('[aria-invalid="true"]')).toBe(finalValue);
  });
});

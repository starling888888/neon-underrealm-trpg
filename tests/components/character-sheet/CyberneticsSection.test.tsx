// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CyberneticsSection, {
  type CyberneticsSectionProps,
} from "../../../src/character-sheet/components/CyberneticsSection";
import { calculateCybernetics } from "../../../src/character-sheet/logic/cybernetics";
import { getCybernetics } from "../../../src/character-sheet/master-data/cybernetics";

function createProps(): CyberneticsSectionProps {
  const [head, other] = getCybernetics();
  if (head === undefined || other === undefined) {
    throw new Error("サイバネmaster dataが不足しています。");
  }

  return {
    derived: calculateCybernetics([head, other], 0, 3, 0),
    fixedRows: [
      { cybernetic: head, part: "head", rowId: "cybernetic-head" },
      { cybernetic: null, part: "torso", rowId: "cybernetic-torso" },
      { cybernetic: null, part: "arm", rowId: "cybernetic-arm" },
      { cybernetic: null, part: "leg", rowId: "cybernetic-leg" },
    ],
    implantLimitModifier: 0,
    implantTotalModifier: 0,
    onAddOther: vi.fn(),
    onClearFixed: vi.fn(),
    onClearOther: vi.fn(),
    onModifierChange: vi.fn((_, value: string) => Number(value)),
    onPickerRequest: vi.fn(),
    onRemoveOther: vi.fn(),
    onSelect: vi.fn(),
    otherRows: [
      { cybernetic: other, rowId: "cybernetic-other-1" },
      { cybernetic: null, rowId: "cybernetic-other-2" },
    ],
  };
}

afterEach(cleanup);

describe("CyberneticsSection", () => {
  it("shows every summary column, uses clear for the first other row, and removes later rows", () => {
    const props = createProps();
    render(<CyberneticsSection {...props} />);

    expect(screen.getByText("部位")).not.toBeNull();
    expect(screen.getByText("信用")).not.toBeNull();
    expect(screen.getByText(/埋め込み\s+点数/)).not.toBeNull();
    expect(screen.getAllByRole("button", { name: "クリア" })).toHaveLength(5);
    fireEvent.click(
      screen.getByRole("button", { name: "その他：サイバネを選択を削除" }),
    );
    expect(props.onRemoveOther).toHaveBeenCalledWith("cybernetic-other-2");
  });

  it("opens details and forwards the two total modifier inputs", () => {
    const props = createProps();
    const head = props.fixedRows[0]?.cybernetic;
    if (head === null || head === undefined)
      throw new Error("頭部サイバネがありません。");
    render(<CyberneticsSection {...props} />);

    fireEvent.click(
      screen.getByRole("button", { name: `頭：${head.name}効果を開く` }),
    );
    expect(screen.getByText(head.effect)).not.toBeNull();
    fireEvent.change(screen.getAllByLabelText("埋め込み点数合計の修正")[0], {
      target: { value: "2" },
    });
    fireEvent.change(screen.getAllByLabelText("埋め込み上限の修正")[0], {
      target: { value: "-1" },
    });

    expect(props.onModifierChange).toHaveBeenCalledWith(
      "implantTotalModifier",
      "2",
    );
    expect(props.onModifierChange).toHaveBeenCalledWith(
      "implantLimitModifier",
      "-1",
    );
  });
});

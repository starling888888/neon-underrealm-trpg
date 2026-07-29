// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import CyberneticsSection, {
  type CyberneticsSectionProps,
} from "../../../src/character-sheet/components/CyberneticsSection";
import { calculateCybernetics } from "../../../src/character-sheet/logic/cybernetics";
import { getCybernetics } from "../../../src/character-sheet/master-data/cybernetics";

function createProps(): CyberneticsSectionProps {
  const [head] = getCybernetics();
  if (head === undefined) {
    throw new Error("サイバネmaster dataが不足しています。");
  }

  return {
    derived: calculateCybernetics([head, head], 0, 3, 0),
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
      { cybernetic: head, rowId: "cybernetic-other-1" },
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
    expect(
      screen.getByText(
        /埋め込み点数が一定値を上回る、あるいは下回るたびに非戦闘技能の修正が一括で更新されます。/,
      ),
    ).not.toBeNull();
    const cyberneticsRulesLink = screen.getByRole("link", {
      name: "サイバネのルール",
    });
    expect(cyberneticsRulesLink.getAttribute("href")).toBe(
      "/data/items/cybernetics",
    );
    expect(cyberneticsRulesLink.getAttribute("target")).toBe("_blank");
    expect(cyberneticsRulesLink.getAttribute("rel")).toBe(
      "noopener noreferrer",
    );
    const head = props.fixedRows[0]?.cybernetic;
    if (head === null || head === undefined)
      throw new Error("頭部サイバネがありません。");
    for (const label of [
      `頭：${head.name}をクリア`,
      "胴体：サイバネを選択をクリア",
      "腕：サイバネを選択をクリア",
      "足：サイバネを選択をクリア",
      `その他1：${head.name}をクリア`,
    ]) {
      expect(screen.getByRole("button", { name: label })).not.toBeNull();
    }
    expect(
      screen.getByRole("button", {
        name: `その他1：${head.name}`,
      }),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("button", { name: /その他の部位を追加$/ })
        .classList.contains("character-sheet-add-button"),
    ).toBe(true);
    fireEvent.click(
      screen.getByRole("button", {
        name: "その他2：サイバネを選択を削除",
      }),
    );
    expect(props.onRemoveOther).toHaveBeenCalledWith("cybernetic-other-2");
  });

  it("opens details and accepts negative modifier values typed one key at a time", async () => {
    const user = userEvent.setup();
    const props = createProps();
    const head = props.fixedRows[0]?.cybernetic;
    if (head === null || head === undefined)
      throw new Error("頭部サイバネがありません。");
    render(<CyberneticsSection {...props} />);

    fireEvent.click(
      screen.getByRole("button", { name: `頭：${head.name}効果を開く` }),
    );
    expect(screen.getByText(head.effect)).not.toBeNull();
    const totalModifier = screen.getAllByLabelText("埋め込み点数合計の修正")[0];
    if (totalModifier === undefined) {
      throw new Error("埋め込み点数合計の修正入力がありません。");
    }
    await user.clear(totalModifier);
    await user.type(totalModifier, "-1");

    expect((totalModifier as HTMLInputElement).value).toBe("-1");
    expect(props.onModifierChange).toHaveBeenLastCalledWith(
      "implantTotalModifier",
      "-1",
    );
    await user.tab();
    expect(props.onModifierChange).toHaveBeenLastCalledWith(
      "implantTotalModifier",
      "-1",
    );
  });
});

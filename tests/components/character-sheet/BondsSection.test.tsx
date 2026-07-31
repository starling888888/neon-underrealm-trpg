// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import BondsSection, {
  type BondsSectionProps,
} from "../../../src/character-sheet/components/BondsSection";
import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import { calculateBonds } from "../../../src/character-sheet/logic/bonds";

function createProps(): BondsSectionProps {
  const bonds = structuredClone(characterSheetDefaultValues.bonds);

  return {
    bonds: bonds.rows,
    derived: calculateBonds(bonds, 4),
    onEffectModifierChange: vi.fn((_, value: string) => Number(value)),
    onRowChange: vi.fn(),
    onRowClear: vi.fn(),
    onRowDelete: vi.fn(),
    onRowMove: vi.fn(),
  };
}

afterEach(cleanup);

describe("BondsSection", () => {
  it("keeps fixed rows, a resolve tooltip, and a non-delete clear action", () => {
    const props = createProps();

    render(<BondsSection {...props} />);

    expect(screen.getAllByRole("region", { name: "覚悟の効果" })).toHaveLength(
      1,
    );
    expect(screen.getByLabelText("縁1の対象")).not.toBeNull();
    expect(screen.getByLabelText("縁4の関係")).not.toBeNull();
    expect(screen.getByRole("group", { name: "縁1" })).not.toBeNull();
    const clearAction = screen.getByRole("button", {
      name: "縁1をクリア（行は削除しません）",
    });

    expect(clearAction.dataset.characterSheetAction).toBe("clear");
    expect(clearAction.querySelector("svg")).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "覚悟の説明" }));

    expect(screen.getByRole("tooltip").textContent).toBe(
      "シナリオ中、覚悟にした縁にチェックを入れます。チェックが入っている限り、変更もクリアもできません",
    );
  });

  it("locks a resolved row and keeps its clear action unavailable", () => {
    const props = createProps();
    props.bonds[0] = { ...props.bonds[0], isResolved: true };

    render(<BondsSection {...props} />);

    expect(screen.getByLabelText("縁1の対象")).toHaveProperty("disabled", true);
    expect(
      screen.getByRole("button", {
        name: "縁1をクリア（行は削除しません）",
      }),
    ).toHaveProperty("disabled", true);
  });

  it("uses a delete action only for an unresolved row over the bond limit", () => {
    const props = createProps();
    props.bonds[0] = { ...props.bonds[0], target: "アキラ" };
    props.bonds[1] = { ...props.bonds[1], target: "ベラ" };
    props.derived = calculateBonds(
      { ...characterSheetDefaultValues.bonds, rows: props.bonds },
      1,
    );

    render(<BondsSection {...props} />);

    const deleteAction = screen.getByRole("button", { name: "縁2を削除" });

    expect(deleteAction.dataset.characterSheetAction).toBe("delete");
    expect(deleteAction.querySelector("svg")).not.toBeNull();

    fireEvent.click(deleteAction);

    expect(props.onRowDelete).toHaveBeenCalledWith("bond-2");
    expect(
      screen.queryByRole("button", {
        name: "縁2をクリア（行は削除しません）",
      }),
    ).toBeNull();
  });

  it("keeps over-limit input backgrounds normal and exposes row reordering", () => {
    const props = createProps();
    props.bonds[0] = { ...props.bonds[0], target: "アキラ" };
    props.bonds[1] = { ...props.bonds[1], target: "ベラ" };
    props.derived = calculateBonds(
      { ...characterSheetDefaultValues.bonds, rows: props.bonds },
      1,
    );

    render(<BondsSection {...props} />);

    expect(screen.getByLabelText("縁2の対象").getAttribute("style")).toBeNull();
    expect(screen.queryByRole("button", { name: "縁1上へ移動" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "縁2上へ移動" }));
    expect(props.onRowMove).toHaveBeenCalledWith("bond-2", "up");
  });

  it("presents an over-limit bond count as an error", () => {
    const props = createProps();
    props.bonds[0] = { ...props.bonds[0], target: "アキラ" };
    props.bonds[1] = { ...props.bonds[1], target: "ベラ" };
    props.derived = calculateBonds(
      { ...characterSheetDefaultValues.bonds, rows: props.bonds },
      1,
    );

    render(<BondsSection {...props} />);

    expect(
      screen.getByText("入力済みの縁が結べる縁の上限を超えています。"),
    ).not.toBeNull();
  });

  it("groups the four modifier expressions under their effect names", () => {
    const props = createProps();

    render(<BondsSection {...props} />);

    expect(screen.getByText("覚悟の効果")).not.toBeNull();
    expect(screen.getByText("通常の縁／今生の縁")).not.toBeNull();
    expect(screen.getAllByText("10d6 ／ 15d6")).toHaveLength(2);
    expect(screen.getAllByText("2d ／ 3d")).toHaveLength(2);
    expect(
      screen.getByRole("heading", { name: "気絶からの回復" }),
    ).not.toBeNull();
    expect(screen.getByRole("heading", { name: "気合獲得" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "能動判定" })).not.toBeNull();
    expect(screen.getByRole("heading", { name: "受動判定" })).not.toBeNull();
    expect(
      screen.getByRole("group", { name: "気絶からの回復" }),
    ).not.toBeNull();
    expect(props.onEffectModifierChange).not.toHaveBeenCalled();
  });
});

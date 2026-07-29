// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import DrugsSection, {
  type DrugsSectionProps,
} from "../../../src/character-sheet/components/DrugsSection";
import { getDrugs } from "../../../src/character-sheet/master-data/drugs";

function createProps(): DrugsSectionProps {
  const [firstDrug, secondDrug] = getDrugs();
  if (firstDrug === undefined || secondDrug === undefined) {
    throw new Error("ドラッグmaster dataが不足しています。");
  }

  return {
    onAdd: vi.fn(),
    onMove: vi.fn(),
    onPickerRequest: vi.fn(),
    onQuantityChange: vi.fn((_, value) => Number(value)),
    onRemove: vi.fn(),
    onSelect: vi.fn(),
    rows: [
      {
        drug: firstDrug,
        drugId: firstDrug.id,
        hasDuplicateSelection: true,
        quantity: 2,
        rowId: "drug-a",
      },
      {
        drug: secondDrug,
        drugId: secondDrug.id,
        hasDuplicateSelection: false,
        quantity: 0,
        rowId: "drug-b",
      },
    ],
  };
}

afterEach(cleanup);

describe("DrugsSection", () => {
  it("exposes ordered row operations, an invalid duplicate row, and an editable quantity", () => {
    const props = createProps();
    const [firstDrug, secondDrug] = getDrugs();
    if (firstDrug === undefined || secondDrug === undefined) {
      throw new Error("ドラッグmaster dataが不足しています。");
    }
    render(<DrugsSection {...props} />);

    const firstRow = screen.getByRole("group", {
      name: `ドラッグ1：${firstDrug.name}`,
    });
    expect(firstRow.getAttribute("aria-invalid")).toBe("true");
    expect(
      (
        screen.getByRole("spinbutton", {
          name: `ドラッグ1：${firstDrug.name}所持数`,
        }) as HTMLInputElement
      ).value,
    ).toBe("2");

    fireEvent.click(
      screen.getByRole("button", {
        name: `ドラッグ2：${secondDrug.name}上へ移動`,
      }),
    );
    fireEvent.click(
      screen.getByRole("button", {
        name: `ドラッグ1：${firstDrug.name}を削除`,
      }),
    );

    expect(props.onMove).toHaveBeenCalledWith("drug-b", "up");
    expect(props.onRemove).toHaveBeenCalledWith("drug-a");
  });

  it("puts timing and set quantity before the expanded effect detail", () => {
    const props = createProps();
    const firstDrug = getDrugs()[0];
    if (firstDrug === undefined)
      throw new Error("ドラッグmaster dataがありません。");
    render(<DrugsSection {...props} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: `ドラッグ1：${firstDrug.name}効果を開く`,
      }),
    );

    const details = document.getElementById("drugs-details-drug-a");
    expect(details).not.toBeNull();
    expect(details?.textContent).toContain(
      `使用タイミング：${firstDrug.timing}`,
    );
    expect(details?.textContent).toContain(
      `1セット数量：${firstDrug.setQuantity}`,
    );
    expect(details?.textContent).toContain(firstDrug.effect);
  });
});

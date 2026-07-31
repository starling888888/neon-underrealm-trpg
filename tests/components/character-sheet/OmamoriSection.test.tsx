// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import OmamoriSection, {
  type OmamoriSectionProps,
} from "../../../src/character-sheet/components/OmamoriSection";
import { getOmamori } from "../../../src/character-sheet/master-data/omamori";

function createProps(): OmamoriSectionProps {
  const [firstItem, secondItem] = getOmamori();
  if (firstItem === undefined || secondItem === undefined) {
    throw new Error("お守りmaster dataが不足しています。");
  }

  return {
    onAdd: vi.fn(),
    onMove: vi.fn(),
    onPickerRequest: vi.fn(),
    onRemove: vi.fn(),
    onSelect: vi.fn(),
    rows: [
      { omamori: firstItem, omamoriId: firstItem.id, rowId: "omamori-a" },
      { omamori: secondItem, omamoriId: secondItem.id, rowId: "omamori-b" },
    ],
  };
}

afterEach(cleanup);

describe("OmamoriSection", () => {
  it("keeps selected effects in the row and exposes unique row operations", () => {
    const props = createProps();
    const [firstItem, secondItem] = getOmamori();
    if (firstItem === undefined || secondItem === undefined) {
      throw new Error("お守りmaster dataが不足しています。");
    }

    render(<OmamoriSection {...props} />);

    expect(
      screen.getByRole("group", { name: `お守り1：${firstItem.name}` }),
    ).not.toBeNull();
    expect(
      screen.getByRole("group", { name: `お守り2：${secondItem.name}` }),
    ).not.toBeNull();
    expect(screen.getByText(firstItem.effect)).not.toBeNull();
    expect(
      screen.getByRole("button", { name: `お守り1：${firstItem.name}を削除` }),
    ).not.toBeNull();

    fireEvent.click(
      screen.getByRole("button", {
        name: `お守り2：${secondItem.name}上へ移動`,
      }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: `お守り1：${firstItem.name}を削除` }),
    );

    expect(props.onMove).toHaveBeenCalledWith("omamori-b", "up");
    expect(props.onRemove).toHaveBeenCalledWith("omamori-a");
  });

  it("opens the mobile effect detail without removing the row effect", () => {
    const props = createProps();
    const firstItem = getOmamori()[0];
    if (firstItem === undefined)
      throw new Error("お守りmaster dataがありません。");

    render(<OmamoriSection {...props} />);

    fireEvent.click(
      screen.getByRole("button", {
        name: `お守り1：${firstItem.name}効果を開く`,
      }),
    );

    expect(
      screen.getByRole("button", {
        name: `お守り1：${firstItem.name}効果を閉じる`,
      }),
    ).not.toBeNull();
    expect(document.getElementById("omamori-details-omamori-a")).not.toBeNull();
  });
});

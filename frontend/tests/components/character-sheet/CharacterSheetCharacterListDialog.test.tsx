// @vitest-environment jsdom

import type { CharacterSheetSummary } from "@neon-underrealm/shared";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CharacterSheetCharacterListDialog from "../../../src/character-sheet/components/dialogs/CharacterSheetCharacterListDialog";

beforeEach(() => {
  Object.defineProperties(HTMLDialogElement.prototype, {
    close: {
      configurable: true,
      value() {
        this.open = false;
      },
    },
    showModal: {
      configurable: true,
      value() {
        this.open = true;
      },
    },
  });
});

afterEach(cleanup);

function summary(index: number): CharacterSheetSummary {
  return {
    id: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
    metadata: {
      createdAt: 0,
      ikizamaId: "burai",
      isOwner: index % 2 === 0,
      isPublic: true,
      pcName: `PC${index}`,
      plName: index === 1 ? null : `PL${index}`,
      primaryRyugiId: "kenkaya",
      rank: 2,
      type: "user",
      updatedAt: Date.UTC(2026, 7, 25),
    },
  };
}

describe("CharacterSheetCharacterListDialog", () => {
  it("paginates the user list and resets to the first page when the owner filter changes", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <CharacterSheetCharacterListDialog
        cache={{
          sample: [],
          user: Array.from({ length: 11 }, (_, index) => summary(index + 1)),
        }}
        isLoading={false}
        isOpen
        onRequestClose={vi.fn()}
        onSelect={onSelect}
      />,
    );

    expect(
      screen.getByRole("columnheader", { name: "流儀／生き様" }),
    ).not.toBeNull();
    expect(screen.queryByText("PC11")).toBeNull();
    const listRows = document.querySelector<HTMLElement>(
      "[data-character-sheet-character-list-rows]",
    );
    expect(listRows).not.toBeNull();
    if (listRows !== null) listRows.scrollTop = 120;
    await user.click(screen.getByRole("button", { name: "次へ" }));
    expect(screen.getByRole("button", { name: "PC11" })).not.toBeNull();
    expect(listRows?.scrollTop).toBe(0);

    await user.click(
      screen.getByRole("checkbox", { name: "自分で登録したキャラクターのみ" }),
    );
    expect(screen.queryByText("PC11")).toBeNull();
    await user.click(screen.getByRole("button", { name: "PC2" }));
    expect(onSelect).toHaveBeenCalledWith(summary(2).id);
  });

  it("disables the owner filter for samples without applying it", async () => {
    const user = userEvent.setup();
    render(
      <CharacterSheetCharacterListDialog
        cache={{
          sample: [
            {
              ...summary(1),
              metadata: { ...summary(1).metadata, type: "sample" },
            },
          ],
          user: [],
        }}
        isLoading={false}
        isOpen
        onRequestClose={vi.fn()}
        onSelect={vi.fn()}
      />,
    );

    await user.click(
      screen.getByRole("radio", { name: "サンプルキャラクター" }),
    );
    expect(
      (
        screen.getByRole("checkbox", {
          name: "自分で登録したキャラクターのみ",
        }) as HTMLInputElement
      ).disabled,
    ).toBe(true);
    expect(screen.getByRole("button", { name: "PC1" })).not.toBeNull();
  });
});

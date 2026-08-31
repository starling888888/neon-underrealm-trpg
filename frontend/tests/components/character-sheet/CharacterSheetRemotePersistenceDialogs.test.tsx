// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CharacterSheetCopySaveDialog from "../../../src/character-sheet/components/dialogs/CharacterSheetCopySaveDialog";
import CharacterSheetDeleteDialog from "../../../src/character-sheet/components/dialogs/CharacterSheetDeleteDialog";
import CharacterSheetSaveDialog from "../../../src/character-sheet/components/dialogs/CharacterSheetSaveDialog";
import CharacterSheetRemotePersistenceDialogs from "../../../src/character-sheet/components/dialogs/CharacterSheetRemotePersistenceDialogs";

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

describe("remote persistence dialogs", () => {
  it("groups the remote dialog set while mounting input dialogs only when opened", () => {
    render(
      <CharacterSheetRemotePersistenceDialogs
        characterList={{
          cache: null,
          isLoading: false,
          isOpen: false,
          onRequestClose: vi.fn(),
          onSelect: vi.fn(),
        }}
        copySave={{
          isOpen: false,
          isSaving: false,
          onConfirm: vi.fn(),
          onRequestClose: vi.fn(),
        }}
        delete={{
          isDeleting: false,
          isOpen: false,
          onConfirm: vi.fn(),
          onRequestClose: vi.fn(),
        }}
        save={{
          initialPcName: "PC",
          initialPublic: true,
          isOpen: true,
          isSaving: false,
          onConfirm: vi.fn(),
          onRequestClose: vi.fn(),
        }}
      />,
    );

    expect(screen.getByRole("dialog", { name: "保存" })).not.toBeNull();
    expect(screen.queryByRole("dialog", { name: "複製" })).toBeNull();
    expect(screen.queryByRole("dialog", { name: "削除" })).toBeNull();
  });

  it.each([
    {
      element: (
        <CharacterSheetSaveDialog
          initialPcName="PC"
          initialPublic
          isOpen
          isSaving={false}
          onConfirm={vi.fn()}
          onRequestClose={vi.fn()}
        />
      ),
      label: "保存",
      primaryAction: "保存",
    },
    {
      element: (
        <CharacterSheetCopySaveDialog
          isOpen
          isSaving={false}
          onConfirm={vi.fn()}
          onRequestClose={vi.fn()}
        />
      ),
      label: "複製",
      primaryAction: "保存",
    },
    {
      element: (
        <CharacterSheetDeleteDialog
          isDeleting={false}
          isOpen
          onConfirm={vi.fn()}
          onRequestClose={vi.fn()}
        />
      ),
      label: "削除",
      primaryAction: "削除",
    },
  ])("uses the shared dialog button contract for $label", ({
    element,
    label,
    primaryAction,
  }) => {
    render(element);

    expect(screen.getByRole("dialog", { name: label })).not.toBeNull();
    expect(screen.queryByRole("heading", { name: label })).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "キャンセル" })
        .getAttribute("data-character-sheet-button-color"),
    ).toBe("muted");
    expect(
      screen
        .getByRole("button", { name: "キャンセル" })
        .getAttribute("data-character-sheet-button-size"),
    ).toBe("medium");
    expect(
      screen
        .getByRole("button", { name: primaryAction })
        .getAttribute("data-character-sheet-button-size"),
    ).toBe("medium");
  });
});

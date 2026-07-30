// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CharacterSheetErrorDialog from "../../../src/character-sheet/components/dialogs/CharacterSheetErrorDialog";
import type { CharacterSheetErrorSummary } from "../../../src/character-sheet/logic/error-summary";

const errorSummary: CharacterSheetErrorSummary = {
  errors: [
    {
      code: "experience",
      message: "消費経験点が取得経験点を超えています。",
    },
  ],
  hasErrors: true,
};

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

afterEach(() => {
  cleanup();
});

describe("CharacterSheetErrorDialog", () => {
  it("uses an accessible error name without a visible title and presents the current errors as a list", () => {
    const onRequestClose = vi.fn();
    render(
      <CharacterSheetErrorDialog
        closeButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={errorSummary}
        isOpen
        onRequestClose={onRequestClose}
        returnFocusRef={createRef<HTMLElement>()}
      />,
    );

    expect(screen.getByRole("dialog", { name: "エラー" })).not.toBeNull();
    expect(screen.queryByRole("heading", { name: "エラー" })).toBeNull();
    expect(screen.getByText("エラーが1件あります。")).not.toBeNull();
    expect(screen.getByRole("list")).not.toBeNull();

    expect(
      screen
        .getByRole("button", { name: "閉じる" })
        .getAttribute("data-character-sheet-button-color"),
    ).toBe("muted");

    const closeButton = screen.getByRole("button", { name: "閉じる" });
    if (closeButton === undefined)
      throw new Error("閉じるbuttonがありません。");
    fireEvent.click(closeButton);
    expect(onRequestClose).toHaveBeenCalledOnce();
  });

  it("keeps the no-error text when opened from the desktop status", () => {
    render(
      <CharacterSheetErrorDialog
        closeButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={{ errors: [], hasErrors: false }}
        isOpen
        onRequestClose={() => {}}
        returnFocusRef={createRef<HTMLElement>()}
      />,
    );

    expect(screen.getByText("エラーはありません。")).not.toBeNull();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("uses distinct list keys for row-level errors with the same rule code", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    try {
      render(
        <CharacterSheetErrorDialog
          closeButtonRef={createRef<HTMLButtonElement>()}
          errorSummary={{
            errors: [
              {
                code: "primary-skill-maximum-level",
                message:
                  "プライマリ流儀スキル「受け流し強化」（Lv 7）：取得可能レベル外の値があります。",
                rowId: "primary-skill-1",
              },
              {
                code: "primary-skill-maximum-level",
                message:
                  "プライマリ流儀スキル「急所撃ち」（Lv 8）：取得可能レベル外の値があります。",
                rowId: "primary-skill-2",
              },
            ],
            hasErrors: true,
          }}
          isOpen
          onRequestClose={() => {}}
          returnFocusRef={createRef<HTMLElement>()}
        />,
      );

      expect(screen.getAllByRole("listitem")).toHaveLength(2);
      expect(consoleError).not.toHaveBeenCalled();
    } finally {
      consoleError.mockRestore();
    }
  });
});

// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";

import CharacterSheetActionPane from "../../../src/character-sheet/components/CharacterSheetActionPane";
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

describe("CharacterSheetActionPane", () => {
  it("shows the error count and list in the open mobile menu", () => {
    render(
      <CharacterSheetActionPane
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={errorSummary}
        isMenuOpen
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onMenuToggle={vi.fn()}
        onReviewErrors={vi.fn()}
      />,
    );

    expect(screen.getAllByText("エラーが1件あります。")).toHaveLength(2);
    expect(screen.queryByRole("heading", { name: "エラー" })).toBeNull();
    expect(
      screen.getByText("消費経験点が取得経験点を超えています。"),
    ).not.toBeNull();
    expect(
      screen
        .getByRole("button", { name: "確認" })
        .getAttribute("data-character-sheet-button-color"),
    ).toBe("danger");
    const floatingHelpButton = document.querySelector<HTMLButtonElement>(
      '[data-character-sheet-action-controls] button[aria-label="ヘルプ"]',
    );
    if (floatingHelpButton === null) {
      throw new Error("floating help buttonがありません。");
    }
    expect(floatingHelpButton.className).not.toContain("iconButtonDanger");
    expect(
      screen.getByRole("button", {
        name: "操作メニューを閉じる、エラーが1件あります。",
      }).className,
    ).toContain("iconButtonDanger");
  });

  it("includes the empty error state in the closed menu button name", () => {
    render(
      <CharacterSheetActionPane
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={{ errors: [], hasErrors: false }}
        isMenuOpen={false}
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onMenuToggle={vi.fn()}
        onReviewErrors={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "操作メニューを開く、エラーはありません。",
      }),
    ).not.toBeNull();
  });
});

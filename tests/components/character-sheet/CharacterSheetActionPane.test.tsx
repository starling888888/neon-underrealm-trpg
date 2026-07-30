// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

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

afterEach(() => cleanup());

describe("CharacterSheetActionPane", () => {
  it("reports the desktop and responsive help triggers through one callback", async () => {
    const user = userEvent.setup();
    const onHelp = vi.fn();

    render(
      <CharacterSheetActionPane
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={{ errors: [], hasErrors: false }}
        isCcfoliaCopyDisabled={false}
        isExportDisabled={false}
        isImportDisabled={false}
        isMenuOpen={false}
        isResetDisabled={false}
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onCcfoliaCopy={vi.fn()}
        onExport={vi.fn()}
        onHelp={onHelp}
        onImport={vi.fn()}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
        onReviewErrors={vi.fn()}
      />,
    );

    for (const button of screen.getAllByRole("button", { name: "ヘルプ" })) {
      await user.click(button);
    }

    expect(onHelp).toHaveBeenCalledTimes(2);
    expect(onHelp.mock.calls.map(([trigger]) => trigger)).toEqual(
      screen.getAllByRole("button", { name: "ヘルプ" }),
    );
  });

  it("uses the same export callback for desktop and responsive menu buttons", async () => {
    const user = userEvent.setup();
    const onExport = vi.fn();

    render(
      <CharacterSheetActionPane
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={{ errors: [], hasErrors: false }}
        isCcfoliaCopyDisabled={false}
        isExportDisabled={false}
        isImportDisabled={false}
        isResetDisabled={false}
        isMenuOpen
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onExport={onExport}
        onHelp={vi.fn()}
        onCcfoliaCopy={vi.fn()}
        onImport={vi.fn()}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
        onReviewErrors={vi.fn()}
      />,
    );

    for (const button of screen.getAllByRole("button", {
      name: "エクスポート",
    })) {
      await user.click(button);
    }

    expect(onExport).toHaveBeenCalledTimes(2);
  });

  it("shows the error count and list in the open mobile menu", () => {
    render(
      <CharacterSheetActionPane
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={errorSummary}
        isCcfoliaCopyDisabled={false}
        isExportDisabled={false}
        isImportDisabled={false}
        isResetDisabled={false}
        isMenuOpen
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onExport={vi.fn()}
        onHelp={vi.fn()}
        onCcfoliaCopy={vi.fn()}
        onImport={vi.fn()}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
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
        isCcfoliaCopyDisabled={false}
        isExportDisabled={false}
        isImportDisabled={false}
        isResetDisabled={false}
        isMenuOpen={false}
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onExport={vi.fn()}
        onHelp={vi.fn()}
        onCcfoliaCopy={vi.fn()}
        onImport={vi.fn()}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
        onReviewErrors={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "操作メニューを開く、エラーはありません。",
      }),
    ).not.toBeNull();
  });

  it("disables desktop and responsive export while an image is restoring", () => {
    render(
      <CharacterSheetActionPane
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={{ errors: [], hasErrors: false }}
        isCcfoliaCopyDisabled
        isExportDisabled
        isImportDisabled
        isResetDisabled
        isMenuOpen
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onExport={vi.fn()}
        onHelp={vi.fn()}
        onCcfoliaCopy={vi.fn()}
        onImport={vi.fn()}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
        onReviewErrors={vi.fn()}
      />,
    );

    for (const button of screen.getAllByRole("button", {
      name: "エクスポート",
    })) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    }

    for (const button of screen.getAllByRole("button", {
      name: "インポート",
    })) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    }

    for (const button of screen.getAllByRole("button", {
      name: "CCFOLIAコピー",
    })) {
      expect((button as HTMLButtonElement).disabled).toBe(true);
    }
  });

  it("uses the same CCFOLIA copy callback for desktop and responsive menu buttons", async () => {
    const user = userEvent.setup();
    const onCcfoliaCopy = vi.fn();

    render(
      <CharacterSheetActionPane
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={{ errors: [], hasErrors: false }}
        isCcfoliaCopyDisabled={false}
        isExportDisabled={false}
        isImportDisabled={false}
        isMenuOpen
        isResetDisabled={false}
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onCcfoliaCopy={onCcfoliaCopy}
        onExport={vi.fn()}
        onHelp={vi.fn()}
        onImport={vi.fn()}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
        onReviewErrors={vi.fn()}
      />,
    );

    for (const button of screen.getAllByRole("button", {
      name: "CCFOLIAコピー",
    })) {
      await user.click(button);
    }

    expect(onCcfoliaCopy).toHaveBeenCalledTimes(2);
  });
});

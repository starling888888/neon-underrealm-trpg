// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Authentication } from "../../../src/character-sheet/auth/types";
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

const sectionNavigation = {
  items: [
    { id: "profile" as const, label: "基本情報" },
    { id: "build" as const, label: "流儀・生き様と能力値" },
  ],
};

const authentication: Authentication = {
  getIdToken: async () => null,
  onLogin: async () => {},
  onLogout: async () => {},
  sessionKey: null,
  status: "signed-out",
};

afterEach(() => {
  cleanup();
});

describe("CharacterSheetActionPane", () => {
  it("mounts the authentication action in the open compact menu", () => {
    render(
      <CharacterSheetActionPane
        authentication={authentication}
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={{ errors: [], hasErrors: false }}
        isCcfoliaCopyDisabled={false}
        isMenuOpen
        isResetDisabled={false}
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onCcfoliaCopy={vi.fn()}
        onHelp={vi.fn()}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
        onReviewErrors={vi.fn()}
        onSectionJump={vi.fn()}
        sectionNavigation={sectionNavigation}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Googleでログイン" }),
    ).toBeTruthy();
  });

  it("reports the desktop and responsive help triggers through one callback", async () => {
    const user = userEvent.setup();
    const onHelp = vi.fn();

    render(
      <CharacterSheetActionPane
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={{ errors: [], hasErrors: false }}
        isCcfoliaCopyDisabled={false}
        isMenuOpen={false}
        isResetDisabled={false}
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onCcfoliaCopy={vi.fn()}
        onHelp={onHelp}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
        onReviewErrors={vi.fn()}
        onSectionJump={vi.fn()}
        sectionNavigation={sectionNavigation}
      />,
    );

    for (const button of screen.getAllByRole("button", { name: "ヘルプ" })) {
      await user.click(button);
    }

    expect(onHelp).toHaveBeenCalledOnce();
    expect(onHelp.mock.calls.map(([trigger]) => trigger)).toEqual(
      screen.getAllByRole("button", { name: "ヘルプ" }),
    );
  });

  it("does not render an export control", () => {
    render(
      <CharacterSheetActionPane
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={{ errors: [], hasErrors: false }}
        isCcfoliaCopyDisabled={false}
        isResetDisabled={false}
        isMenuOpen
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onHelp={vi.fn()}
        onCcfoliaCopy={vi.fn()}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
        onReviewErrors={vi.fn()}
        onSectionJump={vi.fn()}
        sectionNavigation={sectionNavigation}
      />,
    );

    expect(screen.queryByRole("button", { name: "エクスポート" })).toBeNull();
    for (const name of [
      "DB保存",
      "コピー保存",
      "DB削除",
      "初期化",
      "CCFOLIAコピー",
    ]) {
      expect(
        screen
          .getByRole("button", { name })
          .getAttribute("data-character-sheet-button-variant"),
      ).toBe("outline");
    }
  });

  it("shows the error count and list in the open mobile menu", () => {
    render(
      <CharacterSheetActionPane
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={errorSummary}
        isCcfoliaCopyDisabled={false}
        isResetDisabled={false}
        isMenuOpen
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onHelp={vi.fn()}
        onCcfoliaCopy={vi.fn()}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
        onReviewErrors={vi.fn()}
        onSectionJump={vi.fn()}
        sectionNavigation={sectionNavigation}
      />,
    );

    expect(screen.getAllByText("エラーが1件あります。")).toHaveLength(1);
    expect(screen.queryByRole("heading", { name: "エラー" })).toBeNull();
    expect(
      screen.getByText("消費経験点が取得経験点を超えています。"),
    ).not.toBeNull();
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

  it("keeps the error count outside the scrollable error list", () => {
    const errors = Array.from({ length: 16 }, (_, index) => ({
      code: "experience" as const,
      message: `エラー${index + 1}`,
    }));

    render(
      <CharacterSheetActionPane
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={{ errors, hasErrors: true }}
        isCcfoliaCopyDisabled={false}
        isResetDisabled={false}
        isMenuOpen
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onCcfoliaCopy={vi.fn()}
        onHelp={vi.fn()}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
        onReviewErrors={vi.fn()}
        onSectionJump={vi.fn()}
        sectionNavigation={sectionNavigation}
      />,
    );

    const menu = screen.getByRole("region", {
      name: "キャラクターシートの操作メニュー",
    });
    const errorCount = within(menu).getByText("エラーが16件あります。");
    const errorList = within(menu).getAllByRole("list")[1];

    expect(errorCount.parentElement).not.toBe(errorList);
    expect(within(errorList).getAllByRole("listitem")).toHaveLength(16);
    expect(
      errorList.style.getPropertyValue(
        "--character-sheet-error-list-max-block-size",
      ),
    ).toBe("12rem");
    expect(errorList.style.overflowY).toBe("auto");
  });

  it("includes the empty error state in the closed menu button name", () => {
    render(
      <CharacterSheetActionPane
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={{ errors: [], hasErrors: false }}
        isCcfoliaCopyDisabled={false}
        isResetDisabled={false}
        isMenuOpen={false}
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onHelp={vi.fn()}
        onCcfoliaCopy={vi.fn()}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
        onReviewErrors={vi.fn()}
        onSectionJump={vi.fn()}
        sectionNavigation={sectionNavigation}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "操作メニューを開く、エラーはありません。",
      }),
    ).not.toBeNull();
  });

  it("disables CCFOLIA copy while an image is restoring", () => {
    render(
      <CharacterSheetActionPane
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={{ errors: [], hasErrors: false }}
        isCcfoliaCopyDisabled
        isResetDisabled
        isMenuOpen
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onHelp={vi.fn()}
        onCcfoliaCopy={vi.fn()}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
        onReviewErrors={vi.fn()}
        onSectionJump={vi.fn()}
        sectionNavigation={sectionNavigation}
      />,
    );

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
        isMenuOpen
        isResetDisabled={false}
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onCcfoliaCopy={onCcfoliaCopy}
        onHelp={vi.fn()}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
        onReviewErrors={vi.fn()}
        onSectionJump={vi.fn()}
        sectionNavigation={sectionNavigation}
      />,
    );

    for (const button of screen.getAllByRole("button", {
      name: "CCFOLIAコピー",
    })) {
      await user.click(button);
    }

    expect(onCcfoliaCopy).toHaveBeenCalledOnce();
  });

  it("reports a section jump without owning scroll state", async () => {
    const user = userEvent.setup();
    const onSectionJump = vi.fn();

    render(
      <CharacterSheetActionPane
        errorReviewButtonRef={createRef<HTMLButtonElement>()}
        errorSummary={{ errors: [], hasErrors: false }}
        isCcfoliaCopyDisabled={false}
        isMenuOpen
        isResetDisabled={false}
        menuTriggerRef={createRef<HTMLButtonElement>()}
        onCcfoliaCopy={vi.fn()}
        onHelp={vi.fn()}
        onMenuToggle={vi.fn()}
        onReset={vi.fn()}
        onReviewErrors={vi.fn()}
        onSectionJump={onSectionJump}
        sectionNavigation={sectionNavigation}
      />,
    );

    await user.click(
      within(
        screen.getByRole("region", {
          name: "キャラクターシートの操作メニュー",
        }),
      ).getByRole("button", { name: "流儀・生き様と能力値" }),
    );

    expect(onSectionJump).toHaveBeenCalledWith("build");
    const navigation = within(
      screen.getByRole("region", {
        name: "キャラクターシートの操作メニュー",
      }),
    ).getByRole("navigation", { name: "セクションにジャンプ" });
    expect(navigation.querySelectorAll("button[aria-current]")).toHaveLength(0);
    expect(navigation.querySelectorAll("svg[aria-hidden='true']")).toHaveLength(
      2,
    );
  });
});

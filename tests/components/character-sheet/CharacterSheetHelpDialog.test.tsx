// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import CharacterSheetHelpDialog from "../../../src/character-sheet/components/dialogs/action-pane/CharacterSheetHelpDialog";

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

function HelpDialogHarness() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button onClick={() => setIsOpen(true)} ref={triggerRef} type="button">
        ヘルプを開く
      </button>
      <CharacterSheetHelpDialog
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        returnFocusRef={triggerRef}
      />
    </>
  );
}

describe("CharacterSheetHelpDialog", () => {
  it("renders help content with a header close control and restores focus", async () => {
    const user = userEvent.setup();
    render(<HelpDialogHarness />);

    const trigger = screen.getByRole("button", { name: "ヘルプを開く" });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "ヘルプ" });
    expect(dialog.querySelector("h2")?.textContent).toBe("ヘルプ");
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "キャラクターシートについて",
      }),
    ).not.toBeNull();
    expect(dialog.textContent).toContain("入力の進め方");
    expect(dialog.textContent).toContain("保存・引き継ぎ");
    expect(dialog.textContent).toContain("▸");
    expect(dialog.querySelector("footer")).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "閉じる" }),
    );

    await user.click(screen.getByRole("button", { name: "閉じる" }));
    expect(screen.queryByRole("dialog", { name: "ヘルプ" })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("closes on Escape and restores focus", async () => {
    const user = userEvent.setup();
    render(<HelpDialogHarness />);

    const trigger = screen.getByRole("button", { name: "ヘルプを開く" });
    await user.click(trigger);
    fireEvent(
      screen.getByRole("dialog", { name: "ヘルプ" }),
      new Event("cancel", { bubbles: true, cancelable: true }),
    );

    expect(screen.queryByRole("dialog", { name: "ヘルプ" })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });
});

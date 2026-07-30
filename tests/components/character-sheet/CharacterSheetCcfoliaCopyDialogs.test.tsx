// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CharacterSheetCcfoliaCopyConfirmDialog from "../../../src/character-sheet/components/dialogs/CharacterSheetCcfoliaCopyConfirmDialog";
import CharacterSheetCcfoliaCopyNoticeDialog from "../../../src/character-sheet/components/dialogs/CharacterSheetCcfoliaCopyNoticeDialog";

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

function ConfirmHarness({ onConfirm = vi.fn() }: { onConfirm?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button onClick={() => setIsOpen(true)} ref={triggerRef} type="button">
        CCFOLIAコピーを開く
      </button>
      <CharacterSheetCcfoliaCopyConfirmDialog
        isOpen={isOpen}
        onConfirm={() => {
          onConfirm();
          setIsOpen(false);
        }}
        onRequestClose={() => setIsOpen(false)}
        returnFocusRef={triggerRef}
      />
    </>
  );
}

function NoticeHarness() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button onClick={() => setIsOpen(true)} ref={triggerRef} type="button">
        通知を開く
      </button>
      <CharacterSheetCcfoliaCopyNoticeDialog
        confirmButtonRef={confirmButtonRef}
        dialogLabel="CCFOLIAコピー失敗"
        isOpen={isOpen}
        message={
          "クリップボードへのコピーに失敗しました。\nブラウザの権限設定を確認してください。"
        }
        onRequestClose={() => setIsOpen(false)}
        returnFocusRef={triggerRef}
      />
    </>
  );
}

describe("CCFOLIA copy dialogs", () => {
  it("uses the required title-less confirmation and does not copy on cancellation or Escape", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    render(<ConfirmHarness onConfirm={onConfirm} />);

    const trigger = screen.getByRole("button", { name: "CCFOLIAコピーを開く" });
    await user.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "CCFOLIAコピー" });
    expect(screen.queryByRole("heading")).toBeNull();
    expect(
      screen.getByText(
        "CCFOLIAのコマ作成データをクリップボードにコピーします。CCFOLIAの盤面で貼り付けを行うとコマが作成されます。",
      ),
    ).not.toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "キャンセル" }),
    );
    expect(
      screen
        .getByRole("button", { name: "キャンセル" })
        .getAttribute("data-character-sheet-button-color"),
    ).toBe("muted");
    expect(
      screen
        .getByRole("button", { name: "キャンセル" })
        .getAttribute("data-character-sheet-button-variant"),
    ).toBe("outline");
    expect(
      screen
        .getByRole("button", { name: "コピー" })
        .getAttribute("data-character-sheet-button-variant"),
    ).toBe("solid");

    fireEvent(dialog, new Event("cancel", { bubbles: true, cancelable: true }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(trigger);
  });

  it("shows a title-less failure notice with a visible line break", async () => {
    const user = userEvent.setup();
    render(<NoticeHarness />);

    await user.click(screen.getByRole("button", { name: "通知を開く" }));
    expect(screen.queryByRole("heading")).toBeNull();
    expect(
      screen.getByText("クリップボードへのコピーに失敗しました。", {
        exact: false,
      }),
    ).not.toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "確認" }),
    );
  });
});

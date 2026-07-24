// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useId, useRef, useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CharacterSheetDialog, {
  CharacterSheetDialogActions,
  CharacterSheetDialogContent,
  CharacterSheetDialogHeader,
} from "../../../src/character-sheet/components/dialogs/CharacterSheetDialog";

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

function DialogHarness({
  onConfirm = vi.fn(),
  primaryFirst = false,
}: {
  onConfirm?: () => void;
  primaryFirst?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  return (
    <>
      <button onClick={() => setIsOpen(true)} ref={triggerRef} type="button">
        確認ダイアログを開く
      </button>
      <CharacterSheetDialog
        ariaDescribedBy={descriptionId}
        ariaLabelledBy={titleId}
        initialFocusRef={cancelButtonRef}
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        returnFocusRef={triggerRef}
      >
        <CharacterSheetDialogHeader headingId={titleId}>
          確認
        </CharacterSheetDialogHeader>
        <CharacterSheetDialogContent>
          <p id={descriptionId}>確認内容です。</p>
        </CharacterSheetDialogContent>
        <CharacterSheetDialogActions>
          {primaryFirst ? (
            <>
              <button
                data-tone="primary"
                onClick={() => {
                  onConfirm();
                  setIsOpen(false);
                }}
                type="button"
              >
                OK
              </button>
              <button
                onClick={() => setIsOpen(false)}
                ref={cancelButtonRef}
                type="button"
              >
                キャンセル
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsOpen(false)}
                ref={cancelButtonRef}
                type="button"
              >
                キャンセル
              </button>
              <button
                data-tone="primary"
                onClick={() => {
                  onConfirm();
                  setIsOpen(false);
                }}
                type="button"
              >
                OK
              </button>
            </>
          )}
        </CharacterSheetDialogActions>
      </CharacterSheetDialog>
    </>
  );
}

function NoticeHarness() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <button onClick={() => setIsOpen(true)} ref={triggerRef} type="button">
        通知を開く
      </button>
      <CharacterSheetDialog
        ariaLabel="コピー完了の通知"
        initialFocusRef={closeButtonRef}
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        returnFocusRef={triggerRef}
      >
        <CharacterSheetDialogContent>
          <p>クリップボードにコピーしました。</p>
        </CharacterSheetDialogContent>
        <CharacterSheetDialogActions>
          <button
            data-tone="primary"
            onClick={() => setIsOpen(false)}
            ref={closeButtonRef}
            type="button"
          >
            閉じる
          </button>
        </CharacterSheetDialogActions>
      </CharacterSheetDialog>
    </>
  );
}

function HeaderOnlyHarness() {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  return (
    <>
      <button onClick={() => setIsOpen(true)} ref={triggerRef} type="button">
        ヘルプを開く
      </button>
      <CharacterSheetDialog
        ariaLabelledBy={titleId}
        initialFocusRef={closeButtonRef}
        isOpen={isOpen}
        onRequestClose={() => setIsOpen(false)}
        returnFocusRef={triggerRef}
      >
        <CharacterSheetDialogHeader
          closeButtonRef={closeButtonRef}
          headingId={titleId}
          onRequestClose={() => setIsOpen(false)}
        >
          ヘルプ
        </CharacterSheetDialogHeader>
        <CharacterSheetDialogContent>
          <p>現在のキャラクターシートについて説明します。</p>
          <p>内容はルール更新により変わる場合があります。</p>
          <ul>
            <li>入力内容は端末内に保存されます。</li>
          </ul>
        </CharacterSheetDialogContent>
      </CharacterSheetDialog>
    </>
  );
}

describe("CharacterSheetDialog", () => {
  it("opens a labelled modal and returns focus after cancellation", async () => {
    const user = userEvent.setup();

    render(<DialogHarness />);

    const trigger = screen.getByRole("button", {
      name: "確認ダイアログを開く",
    });
    await user.click(trigger);

    const dialog = screen.getByRole("dialog", { name: "確認" });
    expect(dialog.getAttribute("aria-modal")).toBe("true");
    const description = screen.getByText("確認内容です。");
    expect(dialog.getAttribute("aria-describedby")).toBe(description.id);
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "キャンセル" }),
    );

    await user.click(screen.getByRole("button", { name: "キャンセル" }));

    expect(screen.queryByRole("dialog", { name: "確認" })).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it("focuses an explicit non-destructive action even when it follows the primary action", async () => {
    const user = userEvent.setup();

    render(<DialogHarness primaryFirst />);

    await user.click(
      screen.getByRole("button", { name: "確認ダイアログを開く" }),
    );

    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "キャンセル" }),
    );
  });

  it("closes on Escape and reports the primary action once", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();

    render(<DialogHarness onConfirm={onConfirm} />);

    await user.click(
      screen.getByRole("button", { name: "確認ダイアログを開く" }),
    );
    fireEvent(
      screen.getByRole("dialog", { name: "確認" }),
      new Event("cancel", { bubbles: true, cancelable: true }),
    );

    expect(screen.queryByRole("dialog", { name: "確認" })).toBeNull();
    expect(onConfirm).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole("button", { name: "確認ダイアログを開く" }),
    );
    await user.click(screen.getByRole("button", { name: "OK" }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("dialog", { name: "確認" })).toBeNull();
  });

  it("supports a title-less dialog with an aria-label and no description", async () => {
    const user = userEvent.setup();

    render(<NoticeHarness />);

    await user.click(screen.getByRole("button", { name: "通知を開く" }));

    const dialog = screen.getByRole("dialog", { name: "コピー完了の通知" });
    expect(dialog.getAttribute("aria-describedby")).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "閉じる" }),
    );
  });

  it("supports a header-only close button as the initial focus target", async () => {
    const user = userEvent.setup();

    render(<HeaderOnlyHarness />);

    await user.click(screen.getByRole("button", { name: "ヘルプを開く" }));
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "閉じる" }),
    );

    await user.click(screen.getByRole("button", { name: "閉じる" }));

    expect(screen.queryByRole("dialog", { name: "ヘルプ" })).toBeNull();
    expect(document.activeElement).toBe(
      screen.getByRole("button", { name: "ヘルプを開く" }),
    );
  });
});

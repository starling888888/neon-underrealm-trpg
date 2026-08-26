// @vitest-environment jsdom

import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CharacterSheetFatalErrorBoundary from "../../../src/character-sheet/components/CharacterSheetFatalErrorBoundary";
import CharacterSheetFatalErrorDialog from "../../../src/character-sheet/components/dialogs/CharacterSheetFatalErrorDialog";

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

describe("CharacterSheetFatalErrorDialog", () => {
  it("has one reload action, focuses it, and cannot be dismissed", async () => {
    render(<CharacterSheetFatalErrorDialog />);

    const dialog = screen.getByRole("dialog", {
      name: "予期しないエラーが発生しました",
    });
    const reload = screen.getByRole("button", { name: "再読み込み" });
    expect(
      screen.getByText(
        "ページを再読み込みしてください。未保存の変更は失われます。",
      ),
    ).toBeTruthy();
    expect(screen.queryByRole("button", { name: "閉じる" })).toBeNull();
    await waitFor(() => expect(document.activeElement).toBe(reload));

    fireEvent(dialog, new Event("cancel", { cancelable: true }));
    expect(dialog.hasAttribute("open")).toBe(true);
  });
});

describe("CharacterSheetFatalErrorBoundary", () => {
  it("shows the reload dialog for an uncaught React error", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const ThrowingChild = () => {
      throw new Error("unexpected");
    };

    render(
      <CharacterSheetFatalErrorBoundary>
        <ThrowingChild />
      </CharacterSheetFatalErrorBoundary>,
    );

    expect(
      screen.getByRole("dialog", { name: "予期しないエラーが発生しました" }),
    ).toBeTruthy();
    consoleError.mockRestore();
  });
});

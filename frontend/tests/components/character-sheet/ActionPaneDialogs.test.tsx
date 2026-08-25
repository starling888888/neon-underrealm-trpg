// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ActionPaneDialogs from "../../../src/character-sheet/components/dialogs/action-pane";
import type { ActionPaneDialogsState } from "../../../src/character-sheet/hooks/useActionPane";

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

function createState(
  overrides: Partial<ActionPaneDialogsState["actions"]> = {},
): ActionPaneDialogsState {
  return {
    actions: {
      ccfoliaCopyTriggerRef: createRef<HTMLButtonElement>(),
      closeCcfoliaCopyConfirm: vi.fn(),
      closeHelp: vi.fn(),
      closeResetConfirm: vi.fn(),
      confirmCcfoliaCopy: vi.fn(async () => {}),
      confirmReset: vi.fn(),
      helpTriggerRef: createRef<HTMLButtonElement>(),
      isCcfoliaCopyConfirmOpen: false,
      isHelpOpen: false,
      isResetConfirmOpen: false,
      resetTriggerRef: createRef<HTMLButtonElement>(),
      ...overrides,
    },
    errors: {
      closeErrorSummary: vi.fn(),
      errorSummaryCloseButtonRef: createRef<HTMLButtonElement>(),
      errorSummaryTriggerRef: createRef<HTMLButtonElement>(),
      isErrorSummaryOpen: false,
    },
  };
}

const props = {
  errorSummary: { errors: [], hasErrors: false },
  isJsonImportErrorOpen: false,
  isJsonImportImageErrorOpen: false,
  isJsonImportPending: false,
  jsonImportErrorConfirmButtonRef: createRef<HTMLButtonElement>(),
  jsonImportReturnFocusRef: createRef<HTMLButtonElement>(),
  onJsonImportConfirmed: vi.fn(),
  onJsonImportErrorClose: vi.fn(),
  onJsonImportImageErrorClose: vi.fn(),
  onJsonImportPendingClose: vi.fn(),
};

describe("ActionPaneDialogs", () => {
  it("delegates CCFOLIA confirmation through the action-pane state", async () => {
    const user = userEvent.setup();
    const confirmCcfoliaCopy = vi.fn(async () => {});

    render(
      <ActionPaneDialogs
        {...props}
        state={createState({
          confirmCcfoliaCopy,
          isCcfoliaCopyConfirmOpen: true,
        })}
      />,
    );

    await user.click(screen.getByRole("button", { name: "コピー" }));
    expect(confirmCcfoliaCopy).toHaveBeenCalledOnce();
  });
});

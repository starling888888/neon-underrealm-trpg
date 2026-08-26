// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { useCallback, useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import useActionPane from "../../../src/character-sheet/hooks/useActionPane";

const emptyErrorSummary = { errors: [], hasErrors: false };

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function renderActionPane({
  isResetErrorOpen = false,
  isRootOperationInProgress = false,
}: {
  isResetErrorOpen?: boolean;
  isRootOperationInProgress?: boolean;
} = {}) {
  const onCcfoliaCopyConfirmed = vi.fn(async () => true);
  const onCcfoliaCopyResult = vi.fn();
  const onResetConfirmed = vi.fn(async () => {});
  const hook = renderHook(
    ({ isResetErrorOpen, isRootOperationInProgress }) =>
      useActionPane({
        errorSummary: emptyErrorSummary,
        isCcfoliaCopyDisabled: false,
        isResetErrorOpen,
        isRootOperationInProgress,
        isResetDisabled: false,
        onCcfoliaCopyConfirmed,
        onCcfoliaCopyResult,
        onResetConfirmed,
      }),
    { initialProps: { isResetErrorOpen, isRootOperationInProgress } },
  );

  return {
    ...hook,
    onCcfoliaCopyConfirmed,
    onCcfoliaCopyResult,
    onResetConfirmed,
  };
}

function renderDeferredResetActionPane() {
  let resolveReset: (() => void) | undefined;
  const resetOperation = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        resolveReset = resolve;
      }),
  );
  const onCcfoliaCopyConfirmed = vi.fn(async () => true);
  const hook = renderHook(() => {
    const [isRootOperationInProgress, setIsRootOperationInProgress] =
      useState(false);
    const onResetConfirmed = useCallback(async () => {
      setIsRootOperationInProgress(true);
      try {
        await resetOperation();
      } finally {
        setIsRootOperationInProgress(false);
      }
    }, []);

    return useActionPane({
      errorSummary: emptyErrorSummary,
      isCcfoliaCopyDisabled: false,
      isResetErrorOpen: false,
      isRootOperationInProgress,
      isResetDisabled: false,
      onCcfoliaCopyConfirmed,
      onResetConfirmed,
    });
  });

  return {
    ...hook,
    completeReset: () => resolveReset?.(),
    resetOperation,
  };
}

describe("useActionPane", () => {
  it("owns menu, help, reset, and error-dialog state without exposing it to the action pane component", async () => {
    const { result, onResetConfirmed } = renderActionPane();
    const helpTrigger = document.createElement("button");
    const resetTrigger = document.createElement("button");
    const menuTrigger = document.createElement("button");
    result.current.actionPaneProps.menuTriggerRef.current = menuTrigger;

    act(() => {
      result.current.actionPaneProps.onMenuToggle();
      result.current.actionPaneProps.onHelp(helpTrigger);
      result.current.actionPaneProps.onReviewErrors();
    });

    expect(result.current.actionPaneProps.isMenuOpen).toBe(true);
    expect(result.current.dialogs.actions.isHelpOpen).toBe(true);
    expect(result.current.dialogs.actions.helpTriggerRef.current).toBe(
      helpTrigger,
    );
    expect(result.current.dialogs.errors.isErrorSummaryOpen).toBe(true);

    act(() => {
      result.current.dialogs.actions.closeHelp();
      result.current.dialogs.errors.closeErrorSummary();
      result.current.actionPaneProps.onReset(resetTrigger);
    });

    expect(result.current.actionPaneProps.isMenuOpen).toBe(false);
    expect(result.current.dialogs.actions.isHelpOpen).toBe(false);
    expect(result.current.dialogs.errors.isErrorSummaryOpen).toBe(false);
    expect(result.current.dialogs.actions.isResetConfirmOpen).toBe(true);
    expect(result.current.dialogs.actions.resetTriggerRef.current).toBe(
      menuTrigger,
    );

    act(() => result.current.dialogs.actions.confirmReset());
    expect(onResetConfirmed).toHaveBeenCalledOnce();
    expect(result.current.dialogs.actions.isResetConfirmOpen).toBe(false);
  });

  it("closes the responsive menu with Escape and restores its trigger focus", async () => {
    const { result } = renderActionPane();
    const trigger = document.createElement("button");
    document.body.append(trigger);
    result.current.actionPaneProps.menuTriggerRef.current = trigger;

    act(() => result.current.actionPaneProps.onMenuToggle());
    act(() =>
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })),
    );

    expect(result.current.actionPaneProps.isMenuOpen).toBe(false);
    await waitFor(() => expect(document.activeElement).toBe(trigger));
    trigger.remove();
  });

  it("waits for the root reset operation before restoring reset trigger focus", async () => {
    const trigger = document.createElement("button");
    const fallback = document.createElement("button");
    document.body.append(trigger);
    document.body.append(fallback);
    fallback.focus();
    const { completeReset, resetOperation, result } =
      renderDeferredResetActionPane();

    act(() => result.current.actionPaneProps.onReset(trigger));
    act(() => result.current.dialogs.actions.confirmReset());
    await waitFor(() => expect(resetOperation).toHaveBeenCalledOnce());
    expect(document.activeElement).toBe(fallback);

    await act(async () => {
      completeReset();
      await Promise.resolve();
    });
    await waitFor(() => expect(document.activeElement).toBe(trigger));

    trigger.remove();
    fallback.remove();
  });

  it("does not take focus from an error dialog after a failed reset", async () => {
    const trigger = document.createElement("button");
    const fallback = document.createElement("button");
    document.body.append(trigger);
    document.body.append(fallback);
    fallback.focus();
    const { result, rerender } = renderActionPane();

    act(() => result.current.actionPaneProps.onReset(trigger));
    act(() => {
      result.current.dialogs.actions.confirmReset();
      rerender({
        isResetErrorOpen: true,
        isRootOperationInProgress: false,
      });
    });

    await new Promise((resolve) => window.requestAnimationFrame(resolve));
    expect(document.activeElement).toBe(fallback);

    trigger.remove();
    fallback.remove();
  });

  it("reports CCFOLIA copy success and failure after closing its confirmation", async () => {
    const { result, onCcfoliaCopyConfirmed, onCcfoliaCopyResult } =
      renderActionPane();
    const trigger = document.createElement("button");

    act(() => result.current.actionPaneProps.onCcfoliaCopy(trigger));
    expect(result.current.dialogs.actions.isCcfoliaCopyConfirmOpen).toBe(true);

    await act(async () => {
      await result.current.dialogs.actions.confirmCcfoliaCopy();
    });
    expect(onCcfoliaCopyConfirmed).toHaveBeenCalledOnce();
    expect(result.current.dialogs.actions.isCcfoliaCopyConfirmOpen).toBe(false);
    expect(onCcfoliaCopyResult).toHaveBeenLastCalledWith(true);

    onCcfoliaCopyConfirmed.mockResolvedValueOnce(false);
    act(() => result.current.actionPaneProps.onCcfoliaCopy(trigger));
    await act(async () => {
      await result.current.dialogs.actions.confirmCcfoliaCopy();
    });
    expect(onCcfoliaCopyResult).toHaveBeenLastCalledWith(false);
  });

  it("scrolls a first-level section beneath the site header without owning active-section state", () => {
    const { result } = renderActionPane();
    const target = document.createElement("section");
    target.id = "profile";
    document.body.append(target);
    const header = document.createElement("header");
    header.dataset.siteHeader = "";
    document.body.append(header);
    vi.spyOn(header, "getBoundingClientRect").mockReturnValue({
      bottom: 48,
      height: 48,
      left: 0,
      right: 0,
      top: 0,
      width: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
      bottom: 220,
      height: 20,
      left: 0,
      right: 0,
      top: 120,
      width: 0,
      x: 0,
      y: 120,
      toJSON: () => ({}),
    });
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    Object.defineProperty(window, "scrollY", { configurable: true, value: 80 });

    act(() => result.current.actionPaneProps.onSectionJump("profile"));

    expect(scrollTo).toHaveBeenCalledWith({ behavior: "smooth", top: 152 });
    target.remove();
    header.remove();
  });
});

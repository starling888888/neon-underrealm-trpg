// @vitest-environment jsdom

import { zodResolver } from "@hookform/resolvers/zod";
import {
  cleanup,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CharacterSheetContainer from "../../../src/character-sheet/CharacterSheetContainer";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form/values";
import { characterSheetFormSchema } from "../../../src/character-sheet/schemas/character-sheet-form";

const { useRootStateMock } = vi.hoisted(() => ({ useRootStateMock: vi.fn() }));
const { onCcfoliaCopy } = vi.hoisted(() => ({ onCcfoliaCopy: vi.fn() }));

vi.mock(
  "../../../src/character-sheet/hooks/useCharacterSheetRootState",
  () => ({ default: useRootStateMock }),
);

function useRootStateHarness() {
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
    mode: "onChange",
    resolver: zodResolver(characterSheetFormSchema),
  });
  const imageErrorCloseButtonRef = useRef<HTMLButtonElement>(null);
  const imageReturnFocusRef = useRef<HTMLButtonElement>(null);
  const formRestoreConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const formRestoreReturnFocusRef = useRef<HTMLInputElement>(null);
  const jsonImportErrorConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const jsonImportInputRef = useRef<HTMLInputElement>(null);
  const jsonImportReturnFocusRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    form.setValue("profile.pcName", "テストPC");
  }, [form]);

  return {
    characterImage: null,
    form,
    formResetVersion: 0,
    formRestoreConfirmButtonRef,
    formRestoreReturnFocusRef,
    imageError: null,
    imageErrorCloseButtonRef,
    imageReturnFocusRef,
    isCharacterImageRestoring: false,
    isFormRestoreErrorOpen: false,
    isFormRestoring: false,
    isImageErrorFromJsonImport: false,
    isImageErrorFromReset: false,
    isJsonImportErrorOpen: false,
    isJsonImportImageErrorOpen: false,
    isRootOperationInProgress: false,
    jsonImportErrorConfirmButtonRef,
    jsonImportInputRef,
    jsonImportReturnFocusRef,
    onCcfoliaCopy,
    onCharacterImageCleared: async () => {},
    onCharacterImageOperationStarted: () => {},
    onCharacterImageSelected: async () => {},
    onJsonExport: () => {},
    onJsonImportConfirmed: async () => {},
    onJsonImportFileSelected: async () => {},
    onJsonImportRequested: () => {},
    onResetConfirmed: async () => {},
    pendingJsonImport: null,
    rootOperation: null,
    setImageError: () => {},
    setIsFormRestoreErrorOpen: () => {},
    setIsJsonImportErrorOpen: () => {},
    setIsJsonImportImageErrorOpen: () => {},
    setPendingJsonImport: () => {},
  };
}

beforeEach(() => {
  useRootStateMock.mockImplementation(useRootStateHarness);
  onCcfoliaCopy.mockResolvedValue(true);
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
  onCcfoliaCopy.mockReset();
  useRootStateMock.mockReset();
});

describe("CharacterSheetContainer", () => {
  it("connects the form's current character to the root CCFOLIA clipboard operation", async () => {
    const user = userEvent.setup();
    render(<CharacterSheetContainer />);

    await waitFor(() =>
      expect((screen.getByLabelText("PC名") as HTMLInputElement).value).toBe(
        "テストPC",
      ),
    );
    const trigger = screen.getAllByRole("button", { name: "CCFOLIAコピー" })[0];
    if (trigger === undefined)
      throw new Error("CCFOLIAコピーbuttonがありません。");
    await user.click(trigger);
    await user.click(
      within(screen.getByRole("dialog", { name: "CCFOLIAコピー" })).getByRole(
        "button",
        { name: "コピー" },
      ),
    );

    await waitFor(() => expect(onCcfoliaCopy).toHaveBeenCalledOnce());
    expect(
      JSON.parse(onCcfoliaCopy.mock.calls[0]?.[0] as string),
    ).toMatchObject({
      data: { name: "テストPC" },
      kind: "character",
    });
  });
});

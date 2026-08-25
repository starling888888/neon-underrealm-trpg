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
import { type ReactNode, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CharacterSheetContainer from "../../../src/character-sheet/CharacterSheetContainer";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form/values";
import { characterSheetFormSchema } from "../../../src/character-sheet/schemas/character-sheet-form";

const { useRemotePersistenceMock, useRootStateMock } = vi.hoisted(() => ({
  useRemotePersistenceMock: vi.fn(),
  useRootStateMock: vi.fn(),
}));
const { onCcfoliaCopy } = vi.hoisted(() => ({ onCcfoliaCopy: vi.fn() }));

let rootStateInitial = {
  imageError: null as { code: "storage" } | null,
  isFormRestoreErrorOpen: false,
};

vi.mock(
  "../../../src/character-sheet/hooks/useCharacterSheetRootState",
  () => ({ default: useRootStateMock }),
);

vi.mock(
  "../../../src/character-sheet/hooks/useRemoteCharacterPersistence",
  () => ({ default: useRemotePersistenceMock }),
);

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: () => null,
  GoogleOAuthProvider: ({ children }: { children: ReactNode }) => children,
  googleLogout: vi.fn(),
  useGoogleOneTapLogin: vi.fn(),
}));

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
  const [imageError, setImageError] = useState(rootStateInitial.imageError);
  const [isFormRestoreErrorOpen, setIsFormRestoreErrorOpen] = useState(
    rootStateInitial.isFormRestoreErrorOpen,
  );

  useEffect(() => {
    form.setValue("profile.pcName", "テストPC");
  }, [form]);

  return {
    bindRemoteSummary: () => {},
    characterImage: null,
    clearCharacterImageForCopy: async () => true,
    clearRemoteCharacter: () => {},
    form,
    formResetVersion: 0,
    formRestoreConfirmButtonRef,
    formRestoreReturnFocusRef,
    imageError,
    imageErrorCloseButtonRef,
    imageReturnFocusRef,
    isCharacterImageRestoring: false,
    isFormRestoreErrorOpen,
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
    remoteCharacter: null,
    restoreRemoteCharacter: async () => false,
    setImageError,
    setIsFormRestoreErrorOpen,
    setIsJsonImportErrorOpen: () => {},
    setIsJsonImportImageErrorOpen: () => {},
    setPendingJsonImport: () => {},
    updateRemoteCharacterMetadata: () => {},
  };
}

beforeEach(() => {
  rootStateInitial = { imageError: null, isFormRestoreErrorOpen: false };
  useRootStateMock.mockImplementation(useRootStateHarness);
  useRemotePersistenceMock.mockReturnValue({
    dialogProps: {
      characterList: {
        cache: null,
        isLoading: false,
        isOpen: false,
        onRequestClose: vi.fn(),
        onSelect: vi.fn(),
      },
      copySave: {
        isOpen: false,
        isSaving: false,
        onConfirm: vi.fn(),
        onRequestClose: vi.fn(),
      },
      delete: {
        isDeleting: false,
        isOpen: false,
        onConfirm: vi.fn(),
        onRequestClose: vi.fn(),
      },
      save: {
        initialPcName: "",
        initialPublic: true,
        isOpen: false,
        isSaving: false,
        onConfirm: vi.fn(),
        onRequestClose: vi.fn(),
      },
    },
    isCopySaveDisabled: false,
    isDeleteDisabled: false,
    isEditable: true,
    isSaveDisabled: false,
    openCharacterList: vi.fn(),
    openCopySave: vi.fn(),
    openDelete: vi.fn(),
    openSave: vi.fn(),
  });
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
  useRemotePersistenceMock.mockReset();
  useRootStateMock.mockReset();
});

describe("CharacterSheetContainer", () => {
  it("connects the form's current character to the root CCFOLIA clipboard operation", async () => {
    const user = userEvent.setup();
    render(<CharacterSheetContainer googleClientId="test-client-id" />);

    await waitFor(() =>
      expect((screen.getByLabelText("PC名") as HTMLInputElement).value).toBe(
        "テストPC",
      ),
    );
    await user.click(
      screen.getByRole("button", {
        name: "操作メニューを開く、エラーはありません。",
      }),
    );
    const trigger = screen.getByRole("button", { name: "CCFOLIAコピー" });
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
  }, 10_000);

  it("reports image and automatic-restore failures through Toast", async () => {
    rootStateInitial = {
      imageError: { code: "storage" },
      isFormRestoreErrorOpen: true,
    };
    render(<CharacterSheetContainer googleClientId="test-client-id" />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "画像を保存できませんでした。もう一度お試しください。",
        ),
      ).toBeTruthy();
      expect(screen.getByText("自動復元に失敗しました。")).toBeTruthy();
    });
    expect(
      screen.queryByRole("dialog", { name: "画像を処理できませんでした" }),
    ).toBeNull();
    expect(screen.queryByRole("dialog", { name: "自動復元の失敗" })).toBeNull();
  });
});

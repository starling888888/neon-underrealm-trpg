// @vitest-environment jsdom

import { zodResolver } from "@hookform/resolvers/zod";
import { act, cleanup, render, screen } from "@testing-library/react";
import { useMemo, useRef } from "react";
import { useForm } from "react-hook-form";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import CharacterSheetContainer from "../../../src/character-sheet/CharacterSheetContainer";
import type { CharacterSheetFormPresenterProps } from "../../../src/character-sheet/components/CharacterSheetFormPresenter";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form/values";
import { characterSheetFormSchema } from "../../../src/character-sheet/schemas/character-sheet-form";

const { actionPaneSpy, presenterSpy, useRootStateMock } = vi.hoisted(() => ({
  actionPaneSpy: vi.fn(),
  presenterSpy: vi.fn(),
  useRootStateMock: vi.fn(),
}));

vi.mock(
  "../../../src/character-sheet/hooks/useCharacterSheetRootState",
  () => ({
    default: useRootStateMock,
  }),
);

vi.mock(
  "../../../src/character-sheet/components/CharacterSheetFormPresenter",
  () => ({
    default: (props: CharacterSheetFormPresenterProps) => {
      presenterSpy(props);
      return null;
    },
  }),
);

vi.mock(
  "../../../src/character-sheet/components/CharacterSheetActionPane",
  () => ({
    default: (props: {
      errorSummary: unknown;
      onHelp: (trigger: HTMLButtonElement) => void;
    }) => {
      actionPaneSpy(props);
      return (
        <button
          onClick={(event) => props.onHelp(event.currentTarget)}
          type="button"
        >
          ヘルプ
        </button>
      );
    },
  }),
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

  return useMemo(
    () => ({
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
      onCcfoliaCopy: async () => true,
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
    }),
    [form],
  );
}

beforeEach(() => {
  useRootStateMock.mockImplementation(useRootStateHarness);
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value() {
      this.open = false;
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value() {
      this.open = true;
    },
  });
});

afterEach(() => {
  cleanup();
  actionPaneSpy.mockReset();
  presenterSpy.mockReset();
  useRootStateMock.mockReset();
});

describe("CharacterSheetContainer memo boundaries", () => {
  it("keeps presenter and action pane props stable when its help dialog state changes", () => {
    render(<CharacterSheetContainer />);
    const before = presenterSpy.mock
      .lastCall?.[0] as CharacterSheetFormPresenterProps;
    const beforeActionPane = actionPaneSpy.mock.lastCall?.[0] as {
      errorSummary: unknown;
      onCcfoliaCopy: unknown;
      onExport: unknown;
      onHelp: unknown;
      onImport: unknown;
      onMenuToggle: unknown;
      onReset: unknown;
      onReviewErrors: unknown;
      onSectionJump: unknown;
      sectionNavigation: unknown;
    };

    act(() => {
      screen.getAllByRole("button", { name: "ヘルプ" })[0]?.click();
    });

    const after = presenterSpy.mock
      .lastCall?.[0] as CharacterSheetFormPresenterProps;
    const afterActionPane = actionPaneSpy.mock
      .lastCall?.[0] as typeof beforeActionPane;

    expect(afterActionPane.errorSummary).toBe(beforeActionPane.errorSummary);
    expect(afterActionPane.onCcfoliaCopy).toBe(beforeActionPane.onCcfoliaCopy);
    expect(afterActionPane.onExport).toBe(beforeActionPane.onExport);
    expect(afterActionPane.onHelp).toBe(beforeActionPane.onHelp);
    expect(afterActionPane.onImport).toBe(beforeActionPane.onImport);
    expect(afterActionPane.onMenuToggle).toBe(beforeActionPane.onMenuToggle);
    expect(afterActionPane.onReset).toBe(beforeActionPane.onReset);
    expect(afterActionPane.onReviewErrors).toBe(
      beforeActionPane.onReviewErrors,
    );
    expect(afterActionPane.onSectionJump).toBe(beforeActionPane.onSectionJump);
    expect(afterActionPane.sectionNavigation).toBe(
      beforeActionPane.sectionNavigation,
    );
    expect(after.bondsSection).toBe(before.bondsSection);
    expect(after.buildSection).toBe(before.buildSection);
    expect(after.checksSection).toBe(before.checksSection);
    expect(after.commonSkillsSection).toBe(before.commonSkillsSection);
    expect(after.cyberneticsSection).toBe(before.cyberneticsSection);
    expect(after.drugsSection).toBe(before.drugsSection);
    expect(after.ikizamaSkillsSection).toBe(before.ikizamaSkillsSection);
    expect(after.nanomachinesSection).toBe(before.nanomachinesSection);
    expect(after.omamoriSection).toBe(before.omamoriSection);
    expect(after.otherRyugiSkillsSection).toBe(before.otherRyugiSkillsSection);
    expect(after.primarySkillsSection).toBe(before.primarySkillsSection);
    expect(after.profileSection).toBe(before.profileSection);
    expect(after.secondaryAttributesSection).toBe(
      before.secondaryAttributesSection,
    );
    expect(after.specialItemsSection).toBe(before.specialItemsSection);
    expect(after.weaponsAndArmorSection).toBe(before.weaponsAndArmorSection);
  });
});

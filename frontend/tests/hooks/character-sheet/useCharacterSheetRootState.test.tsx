// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { characterSheetDefaultValues } from "../../../src/character-sheet/form/values";
import useCharacterSheetRootState from "../../../src/character-sheet/hooks/useCharacterSheetRootState";
import type { CharacterImageRecord } from "../../../src/character-sheet/schemas/character-image";
import { CharacterImageError } from "../../../src/character-sheet/schemas/character-image";

const storedImage: CharacterImageRecord = {
  base64: "UklGRiIAAABXRUJQVlA4IBYAAADQAQCdASoBAAEALmk0mk0iIiIiIgBoSywA",
  mimeType: "image/webp",
};
const replacementImage: CharacterImageRecord = {
  base64: "UklGRiIAAABXRUJQVlA4IBYAAADQAQCdASoBAAEALmk0mk0iIiIiIgBoSywB",
  mimeType: "image/webp",
};

function createFile(): File {
  return new File(["image"], "character.png", { type: "image/png" });
}

function createJsonFile(): File {
  return new File(["{}"], "character.json", { type: "application/json" });
}

describe("useCharacterSheetRootState", () => {
  it("restores a valid saved form before starting automatic saves", async () => {
    const values = structuredClone(characterSheetDefaultValues);
    values.profile.pcName = "復元されたPC";
    values.build.ikizamaId = "burai";
    values.ikizamaSkills.bonusLevel = 3;
    values.cybernetics.implantTotalModifier = 100;
    for (const noncombat of Object.values(values.checks.noncombat)) {
      noncombat.modifier = 7;
    }
    const writeCharacterSheetForm = vi.fn();
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        readCharacterImage: vi.fn(async () => null),
        readCharacterSheetForm: vi.fn(() => JSON.stringify(values)),
        writeCharacterSheetForm,
      }),
    );

    await waitFor(() => expect(result.current.isFormRestoring).toBe(false));

    expect(result.current.form.getValues("profile.pcName")).toBe(
      "復元されたPC",
    );
    expect(result.current.form.getValues("ikizamaSkills.bonusLevel")).toBe(3);
    expect(
      result.current.form.getValues("checks.noncombat.acrobatics.modifier"),
    ).toBe(7);
    expect(writeCharacterSheetForm).not.toHaveBeenCalled();
  });

  it("opens the restore error dialog without writing when stored JSON is malformed", async () => {
    const writeCharacterSheetForm = vi.fn();
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        readCharacterImage: vi.fn(async () => null),
        readCharacterSheetForm: vi.fn(() => "{broken"),
        writeCharacterSheetForm,
      }),
    );

    await waitFor(() => expect(result.current.isFormRestoring).toBe(false));

    expect(result.current.isFormRestoreErrorOpen).toBe(true);
    expect(writeCharacterSheetForm).not.toHaveBeenCalled();
  });

  it("waits for initial image restoration before exporting JSON", async () => {
    let resolveRead:
      | ((record: CharacterImageRecord | null) => void)
      | undefined;
    const downloadJsonFile = vi.fn();
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        downloadJsonFile,
        readCharacterImage: vi.fn(
          () =>
            new Promise<CharacterImageRecord | null>((resolve) => {
              resolveRead = resolve;
            }),
        ),
        readCharacterSheetForm: vi.fn(() => null),
      }),
    );

    expect(result.current.isCharacterImageRestoring).toBe(true);
    act(() => {
      result.current.onJsonExport();
    });
    expect(downloadJsonFile).not.toHaveBeenCalled();

    await act(async () => {
      resolveRead?.(storedImage);
    });

    expect(result.current.isCharacterImageRestoring).toBe(false);
    act(() => {
      result.current.onJsonExport();
    });

    const exportedJson = downloadJsonFile.mock.calls[0]?.[0] as string;
    expect(JSON.parse(exportedJson).imageBase64String).toBe(storedImage.base64);
  });

  it("copies CCFOLIA JSON through the replaceable Clipboard adapter and reports failures", async () => {
    const writeTextToClipboard = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        readCharacterImage: vi.fn(async () => null),
        readCharacterSheetForm: vi.fn(() => null),
        writeTextToClipboard,
      }),
    );

    await waitFor(() =>
      expect(result.current.isCharacterImageRestoring).toBe(false),
    );
    let copied = false;
    await act(async () => {
      copied = await result.current.onCcfoliaCopy('{"kind":"character"}');
    });
    expect(copied).toBe(true);
    expect(writeTextToClipboard).toHaveBeenCalledWith('{"kind":"character"}');

    writeTextToClipboard.mockRejectedValueOnce(new Error("denied"));
    await act(async () => {
      copied = await result.current.onCcfoliaCopy('{"kind":"character"}');
    });
    expect(copied).toBe(false);
  });

  it("confirms JSON form replacement and clears an image-less import", async () => {
    const values = structuredClone(characterSheetDefaultValues);
    values.profile.pcName = "JSONから復元したPC";
    values.build.ikizamaId = "burai";
    values.ikizamaSkills.bonusLevel = 3;
    values.cybernetics.implantTotalModifier = 100;
    for (const noncombat of Object.values(values.checks.noncombat)) {
      noncombat.modifier = 7;
    }
    const deleteCharacterImage = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        deleteCharacterImage,
        readCharacterImage: vi.fn(async () => storedImage),
        readCharacterSheetForm: vi.fn(() => null),
        readCharacterSheetJsonFile: vi.fn(async () =>
          JSON.stringify({ ...values, imageBase64String: null }),
        ),
        writeCharacterSheetForm: vi.fn(),
      }),
    );

    await waitFor(() =>
      expect(result.current.characterImage).toEqual(storedImage),
    );

    await act(async () => {
      await result.current.onJsonImportFileSelected(createFile());
    });

    expect(result.current.pendingJsonImport).not.toBeNull();
    await act(async () => {
      await result.current.onJsonImportConfirmed();
    });

    expect(result.current.form.getValues("profile.pcName")).toBe(
      "JSONから復元したPC",
    );
    expect(result.current.form.getValues("ikizamaSkills.bonusLevel")).toBe(3);
    expect(
      result.current.form.getValues("checks.noncombat.acrobatics.modifier"),
    ).toBe(7);
    expect(deleteCharacterImage).toHaveBeenCalledOnce();
    expect(result.current.characterImage).toBeNull();
  });

  it("restores form data and removes the previous image for a malformed import image", async () => {
    const values = structuredClone(characterSheetDefaultValues);
    values.profile.pcName = "画像エラーでも復元するPC";
    const deleteCharacterImage = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        decodeImportedCharacterImage: vi.fn(async () => {
          throw new CharacterImageError("decode");
        }),
        deleteCharacterImage,
        readCharacterImage: vi.fn(async () => storedImage),
        readCharacterSheetForm: vi.fn(() => null),
        readCharacterSheetJsonFile: vi.fn(async () =>
          JSON.stringify({ ...values, imageBase64String: 123 }),
        ),
        writeCharacterSheetForm: vi.fn(),
      }),
    );

    await waitFor(() =>
      expect(result.current.characterImage).toEqual(storedImage),
    );
    await act(async () => {
      await result.current.onJsonImportFileSelected(createFile());
    });
    await act(async () => {
      await result.current.onJsonImportConfirmed();
    });

    expect(result.current.form.getValues("profile.pcName")).toBe(
      "画像エラーでも復元するPC",
    );
    expect(deleteCharacterImage).toHaveBeenCalledOnce();
    expect(result.current.characterImage).toBeNull();
    expect(result.current.isJsonImportImageErrorOpen).toBe(true);
  });

  it("keeps the current character unchanged when JSON input is malformed", async () => {
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        readCharacterImage: vi.fn(async () => null),
        readCharacterSheetForm: vi.fn(() => null),
        readCharacterSheetJsonFile: vi.fn(async () => "{invalid"),
        writeCharacterSheetForm: vi.fn(),
      }),
    );
    result.current.form.setValue("profile.pcName", "現在のPC");

    await act(async () => {
      await result.current.onJsonImportFileSelected(createFile());
    });

    expect(result.current.isJsonImportErrorOpen).toBe(true);
    expect(result.current.pendingJsonImport).toBeNull();
    expect(result.current.form.getValues("profile.pcName")).toBe("現在のPC");
  });

  it("locks JSON file reading so a second selection cannot replace its candidate", async () => {
    let resolveRead: ((text: string) => void) | undefined;
    const values = structuredClone(characterSheetDefaultValues);
    values.profile.pcName = "最初のJSON";
    const readCharacterSheetJsonFile = vi.fn(
      () =>
        new Promise<string>((resolve) => {
          resolveRead = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        readCharacterImage: vi.fn(async () => null),
        readCharacterSheetForm: vi.fn(() => null),
        readCharacterSheetJsonFile,
      }),
    );

    await waitFor(() =>
      expect(result.current.isCharacterImageRestoring).toBe(false),
    );
    let firstRead: Promise<void> = Promise.resolve();
    act(() => {
      firstRead = result.current.onJsonImportFileSelected(createJsonFile());
      void result.current.onJsonImportFileSelected(createJsonFile());
    });

    expect(result.current.isRootOperationInProgress).toBe(true);
    expect(readCharacterSheetJsonFile).toHaveBeenCalledOnce();
    await act(async () => {
      resolveRead?.(JSON.stringify({ ...values, imageBase64String: null }));
      await firstRead;
    });

    expect(result.current.pendingJsonImport?.values.profile.pcName).toBe(
      "最初のJSON",
    );
    expect(result.current.isJsonImportErrorOpen).toBe(false);
  });

  it("does not start JSON input until initial image restoration completes", async () => {
    let resolveImage:
      | ((record: CharacterImageRecord | null) => void)
      | undefined;
    const click = vi.fn();
    const trigger = document.createElement("button");
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        readCharacterImage: vi.fn(
          () =>
            new Promise<CharacterImageRecord | null>((resolve) => {
              resolveImage = resolve;
            }),
        ),
        readCharacterSheetForm: vi.fn(() => null),
      }),
    );
    result.current.jsonImportInputRef.current = {
      click,
    } as unknown as HTMLInputElement;

    act(() => {
      result.current.onJsonImportRequested(trigger);
    });
    expect(click).not.toHaveBeenCalled();

    await act(async () => {
      resolveImage?.(null);
    });
    act(() => {
      result.current.onJsonImportRequested(trigger);
    });
    expect(click).toHaveBeenCalledOnce();
  });

  it("keeps the imported form and existing image when image deletion fails", async () => {
    const values = structuredClone(characterSheetDefaultValues);
    values.profile.pcName = "削除失敗でも復元するPC";
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        deleteCharacterImage: vi.fn(async () => {
          throw new CharacterImageError("storage");
        }),
        readCharacterImage: vi.fn(async () => storedImage),
        readCharacterSheetForm: vi.fn(() => null),
        readCharacterSheetJsonFile: vi.fn(async () =>
          JSON.stringify({ ...values, imageBase64String: null }),
        ),
        writeCharacterSheetForm: vi.fn(),
      }),
    );

    await waitFor(() =>
      expect(result.current.characterImage).toEqual(storedImage),
    );
    await act(async () => {
      await result.current.onJsonImportFileSelected(createJsonFile());
    });
    await act(async () => {
      await result.current.onJsonImportConfirmed();
    });

    expect(result.current.form.getValues("profile.pcName")).toBe(
      "削除失敗でも復元するPC",
    );
    expect(result.current.characterImage).toEqual(storedImage);
    expect(result.current.imageError).toEqual({ code: "storage" });
    expect(result.current.isImageErrorFromJsonImport).toBe(true);
  });

  it("keeps the imported form when malformed-image deletion fails", async () => {
    const values = structuredClone(characterSheetDefaultValues);
    values.profile.pcName = "不正画像削除失敗でも復元するPC";
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        decodeImportedCharacterImage: vi.fn(async () => {
          throw new CharacterImageError("decode");
        }),
        deleteCharacterImage: vi.fn(async () => {
          throw new CharacterImageError("storage");
        }),
        readCharacterImage: vi.fn(async () => storedImage),
        readCharacterSheetForm: vi.fn(() => null),
        readCharacterSheetJsonFile: vi.fn(async () =>
          JSON.stringify({ ...values, imageBase64String: 123 }),
        ),
        writeCharacterSheetForm: vi.fn(),
      }),
    );

    await waitFor(() =>
      expect(result.current.characterImage).toEqual(storedImage),
    );
    await act(async () => {
      await result.current.onJsonImportFileSelected(createJsonFile());
    });
    await act(async () => {
      await result.current.onJsonImportConfirmed();
    });

    expect(result.current.form.getValues("profile.pcName")).toBe(
      "不正画像削除失敗でも復元するPC",
    );
    expect(result.current.characterImage).toEqual(storedImage);
    expect(result.current.isJsonImportImageErrorOpen).toBe(true);
  });

  it("switches imported images only after a successful JSON-image write", async () => {
    const values = structuredClone(characterSheetDefaultValues);
    values.profile.pcName = "画像も復元するPC";
    const writeCharacterImage = vi.fn(async () => {});
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        decodeImportedCharacterImage: vi.fn(async () => replacementImage),
        readCharacterImage: vi.fn(async () => storedImage),
        readCharacterSheetForm: vi.fn(() => null),
        readCharacterSheetJsonFile: vi.fn(async () =>
          JSON.stringify({
            ...values,
            imageBase64String: replacementImage.base64,
          }),
        ),
        writeCharacterImage,
        writeCharacterSheetForm: vi.fn(),
      }),
    );

    await waitFor(() =>
      expect(result.current.characterImage).toEqual(storedImage),
    );
    await act(async () => {
      await result.current.onJsonImportFileSelected(createJsonFile());
    });
    await act(async () => {
      await result.current.onJsonImportConfirmed();
    });

    expect(writeCharacterImage).toHaveBeenCalledWith(replacementImage);
    expect(result.current.characterImage).toEqual(replacementImage);
    expect(result.current.form.getValues("profile.pcName")).toBe(
      "画像も復元するPC",
    );
  });

  it("keeps the prior image when a JSON-image write fails", async () => {
    const values = structuredClone(characterSheetDefaultValues);
    values.profile.pcName = "書込み失敗でも復元するPC";
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        decodeImportedCharacterImage: vi.fn(async () => replacementImage),
        readCharacterImage: vi.fn(async () => storedImage),
        readCharacterSheetForm: vi.fn(() => null),
        readCharacterSheetJsonFile: vi.fn(async () =>
          JSON.stringify({
            ...values,
            imageBase64String: replacementImage.base64,
          }),
        ),
        writeCharacterImage: vi.fn(async () => {
          throw new CharacterImageError("storage");
        }),
        writeCharacterSheetForm: vi.fn(),
      }),
    );

    await waitFor(() =>
      expect(result.current.characterImage).toEqual(storedImage),
    );
    await act(async () => {
      await result.current.onJsonImportFileSelected(createJsonFile());
    });
    await act(async () => {
      await result.current.onJsonImportConfirmed();
    });

    expect(result.current.form.getValues("profile.pcName")).toBe(
      "書込み失敗でも復元するPC",
    );
    expect(result.current.characterImage).toEqual(storedImage);
    expect(result.current.imageError).toEqual({ code: "storage" });
    expect(result.current.isImageErrorFromJsonImport).toBe(true);
  });

  it("flushes a pending save when the root state unmounts", async () => {
    const writeCharacterSheetForm = vi.fn();
    const { result, unmount } = renderHook(() =>
      useCharacterSheetRootState({
        readCharacterImage: vi.fn(async () => null),
        readCharacterSheetForm: vi.fn(() => null),
        writeCharacterSheetForm,
      }),
    );

    await waitFor(() => expect(result.current.isFormRestoring).toBe(false));
    act(() => {
      result.current.form.setValue("profile.pcName", "離脱前のPC");
    });
    unmount();

    expect(writeCharacterSheetForm).toHaveBeenCalledWith(
      window.localStorage,
      expect.objectContaining({
        profile: expect.objectContaining({ pcName: "離脱前のPC" }),
      }),
    );
  });

  it("flushes a pending save on pagehide", async () => {
    const writeCharacterSheetForm = vi.fn();
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        readCharacterImage: vi.fn(async () => null),
        readCharacterSheetForm: vi.fn(() => null),
        writeCharacterSheetForm,
      }),
    );

    await waitFor(() => expect(result.current.isFormRestoring).toBe(false));
    act(() => {
      result.current.form.setValue("profile.pcName", "ページ離脱前のPC");
      window.dispatchEvent(new Event("pagehide"));
    });

    expect(writeCharacterSheetForm).toHaveBeenCalledWith(
      window.localStorage,
      expect.objectContaining({
        profile: expect.objectContaining({ pcName: "ページ離脱前のPC" }),
      }),
    );
  });

  it("writes a changed form after the debounce delay", async () => {
    const writeCharacterSheetForm = vi.fn();
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        readCharacterImage: vi.fn(async () => null),
        readCharacterSheetForm: vi.fn(() => null),
        writeCharacterSheetForm,
      }),
    );

    await waitFor(() => expect(result.current.isFormRestoring).toBe(false));
    vi.useFakeTimers();
    act(() => {
      result.current.form.setValue("profile.pcName", "自動保存PC");
      vi.advanceTimersByTime(200);
    });

    expect(writeCharacterSheetForm).toHaveBeenCalledWith(
      window.localStorage,
      expect.objectContaining({
        profile: expect.objectContaining({ pcName: "自動保存PC" }),
      }),
    );
    vi.useRealTimers();
  });

  it("logs a write exception while retaining the current edit state", async () => {
    const error = new Error("storage write failed");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        readCharacterImage: vi.fn(async () => null),
        readCharacterSheetForm: vi.fn(() => null),
        writeCharacterSheetForm: vi.fn(() => {
          throw error;
        }),
      }),
    );

    await waitFor(() => expect(result.current.isFormRestoring).toBe(false));
    vi.useFakeTimers();
    act(() => {
      result.current.form.setValue("profile.pcName", "保持するPC");
      vi.advanceTimersByTime(200);
    });

    expect(consoleError).toHaveBeenCalledWith(error);
    expect(result.current.form.getValues("profile.pcName")).toBe("保持するPC");
    consoleError.mockRestore();
    vi.useRealTimers();
  });

  it("logs localStorage exceptions without opening the restore error dialog", async () => {
    const error = new Error("storage unavailable");
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        readCharacterImage: vi.fn(async () => null),
        readCharacterSheetForm: vi.fn(() => {
          throw error;
        }),
      }),
    );

    await waitFor(() => expect(result.current.isFormRestoring).toBe(false));

    expect(consoleError).toHaveBeenCalledWith(error);
    expect(result.current.isFormRestoreErrorOpen).toBe(false);
    consoleError.mockRestore();
  });

  it("switches the displayed image only after a successful write", async () => {
    let resolveWrite: (() => void) | undefined;
    const writeCharacterImage = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveWrite = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        convertCharacterImage: vi.fn(async () => replacementImage),
        readCharacterImage: vi.fn(async () => storedImage),
        writeCharacterImage,
      }),
    );

    await waitFor(() =>
      expect(result.current.characterImage).toEqual(storedImage),
    );

    let operation: Promise<void> = Promise.resolve();
    act(() => {
      operation = result.current.onCharacterImageSelected(createFile());
    });

    expect(result.current.isRootOperationInProgress).toBe(true);
    expect(result.current.rootOperation?.label).toBe("画像を処理しています");
    expect(result.current.characterImage).toEqual(storedImage);
    await waitFor(() =>
      expect(writeCharacterImage).toHaveBeenCalledWith(replacementImage),
    );

    await act(async () => {
      resolveWrite?.();
      await operation;
    });

    expect(result.current.isRootOperationInProgress).toBe(false);
    expect(result.current.characterImage).toEqual(replacementImage);
  });

  it("keeps the prior image and classifies conversion or write failures", async () => {
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        convertCharacterImage: vi.fn(async () => {
          throw new CharacterImageError("decode");
        }),
        readCharacterImage: vi.fn(async () => storedImage),
        writeCharacterImage: vi.fn(async () => {}),
      }),
    );

    await waitFor(() =>
      expect(result.current.characterImage).toEqual(storedImage),
    );

    await act(async () => {
      await result.current.onCharacterImageSelected(createFile());
    });

    expect(result.current.characterImage).toEqual(storedImage);
    expect(result.current.imageError).toEqual({ code: "decode" });
    expect(result.current.isRootOperationInProgress).toBe(false);
  });

  it("keeps the prior image when IndexedDB writing fails", async () => {
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        convertCharacterImage: vi.fn(async () => replacementImage),
        readCharacterImage: vi.fn(async () => storedImage),
        writeCharacterImage: vi.fn(async () => {
          throw new CharacterImageError("storage");
        }),
      }),
    );

    await waitFor(() =>
      expect(result.current.characterImage).toEqual(storedImage),
    );

    await act(async () => {
      await result.current.onCharacterImageSelected(createFile());
    });

    expect(result.current.characterImage).toEqual(storedImage);
    expect(result.current.imageError).toEqual({ code: "storage" });
  });

  it("keeps form initialization independent when image restoration fails", async () => {
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        convertCharacterImage: vi.fn(async () => replacementImage),
        readCharacterImage: vi.fn(async () => {
          throw new CharacterImageError("decode");
        }),
        readCharacterSheetForm: vi.fn(() => null),
        writeCharacterImage: vi.fn(async () => {}),
      }),
    );

    await waitFor(() =>
      expect(result.current.imageError).toEqual({ code: "restore" }),
    );

    expect(result.current.form.getValues("profile.pcName")).toBe("");
    expect(result.current.characterImage).toBeNull();
  });

  it("does not let a late initial restore replace a newly saved image", async () => {
    let resolveRead: ((record: CharacterImageRecord) => void) | undefined;
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        convertCharacterImage: vi.fn(async () => replacementImage),
        readCharacterImage: vi.fn(
          () =>
            new Promise<CharacterImageRecord>((resolve) => {
              resolveRead = resolve;
            }),
        ),
        writeCharacterImage: vi.fn(async () => {}),
      }),
    );

    await act(async () => {
      await result.current.onCharacterImageSelected(createFile());
    });

    await act(async () => {
      resolveRead?.(storedImage);
    });

    expect(result.current.characterImage).toEqual(replacementImage);
  });

  it("restores the saved image when a replacement cannot be converted", async () => {
    let resolveRead: ((record: CharacterImageRecord) => void) | undefined;
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        convertCharacterImage: vi.fn(async () => {
          throw new CharacterImageError("decode");
        }),
        readCharacterImage: vi.fn(
          () =>
            new Promise<CharacterImageRecord>((resolve) => {
              resolveRead = resolve;
            }),
        ),
        writeCharacterImage: vi.fn(async () => {}),
      }),
    );

    await act(async () => {
      await result.current.onCharacterImageSelected(createFile());
    });
    await act(async () => {
      resolveRead?.(storedImage);
    });

    expect(result.current.characterImage).toEqual(storedImage);
    expect(result.current.imageError).toEqual({ code: "decode" });
  });

  it("restores the saved image when writing a replacement fails", async () => {
    let resolveRead: ((record: CharacterImageRecord) => void) | undefined;
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        convertCharacterImage: vi.fn(async () => replacementImage),
        readCharacterImage: vi.fn(
          () =>
            new Promise<CharacterImageRecord>((resolve) => {
              resolveRead = resolve;
            }),
        ),
        writeCharacterImage: vi.fn(async () => {
          throw new CharacterImageError("storage");
        }),
      }),
    );

    await act(async () => {
      await result.current.onCharacterImageSelected(createFile());
    });
    await act(async () => {
      resolveRead?.(storedImage);
    });

    expect(result.current.characterImage).toEqual(storedImage);
    expect(result.current.imageError).toEqual({ code: "storage" });
  });

  it("ignores a late restore failure after saving a replacement", async () => {
    let rejectRead: ((error: Error) => void) | undefined;
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        convertCharacterImage: vi.fn(async () => replacementImage),
        readCharacterImage: vi.fn(
          () =>
            new Promise<CharacterImageRecord>((_, reject) => {
              rejectRead = reject;
            }),
        ),
        writeCharacterImage: vi.fn(async () => {}),
      }),
    );

    await act(async () => {
      await result.current.onCharacterImageSelected(createFile());
    });
    await act(async () => {
      rejectRead?.(new CharacterImageError("decode"));
    });

    expect(result.current.characterImage).toEqual(replacementImage);
    expect(result.current.imageError).toBeNull();
  });

  it("clears the saved image only after IndexedDB deletion succeeds", async () => {
    let resolveDelete: (() => void) | undefined;
    const deleteCharacterImage = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveDelete = resolve;
        }),
    );
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        deleteCharacterImage,
        readCharacterImage: vi.fn(async () => storedImage),
      }),
    );

    await waitFor(() =>
      expect(result.current.characterImage).toEqual(storedImage),
    );

    let operation: Promise<void> = Promise.resolve();
    act(() => {
      operation = result.current.onCharacterImageCleared();
    });

    expect(result.current.isRootOperationInProgress).toBe(true);
    expect(result.current.rootOperation?.label).toBe("画像をクリアしています");
    expect(result.current.characterImage).toEqual(storedImage);
    await waitFor(() => expect(deleteCharacterImage).toHaveBeenCalledOnce());

    await act(async () => {
      resolveDelete?.();
      await operation;
    });

    expect(result.current.characterImage).toBeNull();
    expect(result.current.isRootOperationInProgress).toBe(false);
  });

  it("resets the form and both browser snapshots only after confirming reset", async () => {
    const deleteCharacterImage = vi.fn(async () => {});
    const deleteCharacterSheetForm = vi.fn();
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        deleteCharacterImage,
        deleteCharacterSheetForm,
        readCharacterImage: vi.fn(async () => storedImage),
        readCharacterSheetForm: vi.fn(() => null),
        writeCharacterSheetForm: vi.fn(),
      }),
    );

    await waitFor(() =>
      expect(result.current.characterImage).toEqual(storedImage),
    );
    act(() => {
      result.current.form.setValue("profile.pcName", "初期化前PC");
    });

    await act(async () => {
      await result.current.onResetConfirmed();
    });

    expect(deleteCharacterImage).toHaveBeenCalledOnce();
    expect(deleteCharacterSheetForm).toHaveBeenCalledWith(window.localStorage);
    expect(result.current.characterImage).toBeNull();
    expect(result.current.form.getValues()).toEqual(
      characterSheetDefaultValues,
    );
  });

  it("restores the form snapshot when reset cannot delete the image record", async () => {
    const deleteCharacterSheetForm = vi.fn();
    const writeCharacterSheetForm = vi.fn();
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        deleteCharacterImage: vi.fn(async () => {
          throw new CharacterImageError("storage");
        }),
        deleteCharacterSheetForm,
        readCharacterImage: vi.fn(async () => storedImage),
        readCharacterSheetForm: vi.fn(() => null),
        writeCharacterSheetForm,
      }),
    );

    await waitFor(() =>
      expect(result.current.characterImage).toEqual(storedImage),
    );
    act(() => {
      result.current.form.setValue("profile.pcName", "初期化前PC");
    });

    await act(async () => {
      await result.current.onResetConfirmed();
    });

    expect(deleteCharacterSheetForm).toHaveBeenCalledWith(window.localStorage);
    expect(writeCharacterSheetForm).toHaveBeenCalledWith(
      window.localStorage,
      expect.objectContaining({
        profile: expect.objectContaining({ pcName: "初期化前PC" }),
      }),
    );
    expect(result.current.characterImage).toEqual(storedImage);
    expect(result.current.form.getValues("profile.pcName")).toBe("初期化前PC");
    expect(result.current.imageError).toEqual({ code: "storage" });
    expect(result.current.isImageErrorFromReset).toBe(true);
  });

  it("keeps the current snapshots when reset cannot delete the saved form", async () => {
    const deleteCharacterImage = vi.fn(async () => {});
    const deleteCharacterSheetForm = vi.fn(() => {
      throw new Error("storage unavailable");
    });
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        deleteCharacterImage,
        deleteCharacterSheetForm,
        readCharacterImage: vi.fn(async () => storedImage),
        readCharacterSheetForm: vi.fn(() => null),
        writeCharacterSheetForm: vi.fn(),
      }),
    );

    await waitFor(() =>
      expect(result.current.characterImage).toEqual(storedImage),
    );
    act(() => {
      result.current.form.setValue("profile.pcName", "初期化前PC");
    });

    await act(async () => {
      await result.current.onResetConfirmed();
    });

    expect(deleteCharacterSheetForm).toHaveBeenCalledWith(window.localStorage);
    expect(deleteCharacterImage).not.toHaveBeenCalled();
    expect(result.current.characterImage).toEqual(storedImage);
    expect(result.current.form.getValues("profile.pcName")).toBe("初期化前PC");
    expect(result.current.imageError).toEqual({ code: "storage" });
    expect(result.current.isImageErrorFromReset).toBe(true);
  });

  it("keeps the saved image when IndexedDB deletion fails", async () => {
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        deleteCharacterImage: vi.fn(async () => {
          throw new CharacterImageError("storage");
        }),
        readCharacterImage: vi.fn(async () => storedImage),
      }),
    );

    await waitFor(() =>
      expect(result.current.characterImage).toEqual(storedImage),
    );

    await act(async () => {
      await result.current.onCharacterImageCleared();
    });

    expect(result.current.characterImage).toEqual(storedImage);
    expect(result.current.imageError).toEqual({ code: "storage" });
  });

  it("does not let a late restore restore an image after it was cleared", async () => {
    let resolveRead: ((record: CharacterImageRecord) => void) | undefined;
    const { result } = renderHook(() =>
      useCharacterSheetRootState({
        deleteCharacterImage: vi.fn(async () => {}),
        readCharacterImage: vi.fn(
          () =>
            new Promise<CharacterImageRecord>((resolve) => {
              resolveRead = resolve;
            }),
        ),
      }),
    );

    await act(async () => {
      await result.current.onCharacterImageCleared();
    });
    await act(async () => {
      resolveRead?.(storedImage);
    });

    expect(result.current.characterImage).toBeNull();
  });
});

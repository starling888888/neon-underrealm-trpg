// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CharacterImageRecord } from "../../../src/character-sheet/character-image";
import { CharacterImageError } from "../../../src/character-sheet/character-image";
import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import useCharacterSheetRootState from "../../../src/character-sheet/useCharacterSheetRootState";

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

describe("useCharacterSheetRootState", () => {
  it("restores a valid saved form before starting automatic saves", async () => {
    const values = structuredClone(characterSheetDefaultValues);
    values.profile.pcName = "復元されたPC";
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

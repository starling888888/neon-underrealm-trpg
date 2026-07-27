// @vitest-environment jsdom

import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { CharacterImageRecord } from "../../../src/character-sheet/character-image";
import { CharacterImageError } from "../../../src/character-sheet/character-image";
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

    expect(result.current.isImageProcessing).toBe(true);
    expect(result.current.characterImage).toEqual(storedImage);
    await waitFor(() =>
      expect(writeCharacterImage).toHaveBeenCalledWith(replacementImage),
    );

    await act(async () => {
      resolveWrite?.();
      await operation;
    });

    expect(result.current.isImageProcessing).toBe(false);
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
    expect(result.current.isImageProcessing).toBe(false);
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
});

import { expect, test } from "vitest";

import {
  CharacterImageError,
  characterImageMaximumBytes,
  isWebpBase64,
  validateCharacterImageFile,
} from "../../../../src/character-sheet/browser/character-image";

test("accepts an image file at the configured size limit", () => {
  expect(() => {
    validateCharacterImageFile({
      size: characterImageMaximumBytes,
      type: "image/png",
    });
  }).not.toThrow();
});

test("rejects a non-image file and an image above the size limit", () => {
  expectCharacterImageError(
    () => validateCharacterImageFile({ size: 1, type: "text/plain" }),
    "invalid-type",
  );
  expectCharacterImageError(
    () =>
      validateCharacterImageFile({
        size: characterImageMaximumBytes + 1,
        type: "image/png",
      }),
    "file-too-large",
  );
});

test("recognizes WebP base64 and rejects malformed or non-WebP data", () => {
  expect(
    isWebpBase64(
      "UklGRiIAAABXRUJQVlA4IBYAAADQAQCdASoBAAEALmk0mk0iIiIiIgBoSywA",
    ),
  ).toBe(true);
  expect(isWebpBase64("not base64")).toBe(false);
  expect(isWebpBase64("cG5nIGJ5dGVz")).toBe(false);
});

function expectCharacterImageError(
  operation: () => void,
  code: CharacterImageError["code"],
): void {
  try {
    operation();
  } catch (error) {
    expect(error).toBeInstanceOf(CharacterImageError);
    expect(error).toMatchObject({ code });
    return;
  }
  throw new Error("Expected CharacterImageError.");
}

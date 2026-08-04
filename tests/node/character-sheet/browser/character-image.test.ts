import assert from "node:assert/strict";
import { test } from "vitest";

import {
  CharacterImageError,
  characterImageMaximumBytes,
  isWebpBase64,
  validateCharacterImageFile,
} from "../../../../src/character-sheet/browser/character-image";

test("accepts an image file at the configured size limit", () => {
  assert.doesNotThrow(() => {
    validateCharacterImageFile({
      size: characterImageMaximumBytes,
      type: "image/png",
    });
  });
});

test("rejects a non-image file and an image above the size limit", () => {
  assert.throws(
    () => validateCharacterImageFile({ size: 1, type: "text/plain" }),
    (error: unknown) =>
      error instanceof CharacterImageError && error.code === "invalid-type",
  );
  assert.throws(
    () =>
      validateCharacterImageFile({
        size: characterImageMaximumBytes + 1,
        type: "image/png",
      }),
    (error: unknown) =>
      error instanceof CharacterImageError && error.code === "file-too-large",
  );
});

test("recognizes WebP base64 and rejects malformed or non-WebP data", () => {
  assert.equal(
    isWebpBase64(
      "UklGRiIAAABXRUJQVlA4IBYAAADQAQCdASoBAAEALmk0mk0iIiIiIgBoSywA",
    ),
    true,
  );
  assert.equal(isWebpBase64("not base64"), false);
  assert.equal(isWebpBase64("cG5nIGJ5dGVz"), false);
});

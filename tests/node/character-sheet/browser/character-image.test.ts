import assert from "node:assert/strict";
import test from "node:test";

import {
  CharacterImageError,
  characterImageMaximumBytes,
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

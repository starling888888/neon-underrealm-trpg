import assert from "node:assert/strict";
import test from "node:test";

import { CharacterImageError } from "../../../../src/character-sheet/character-image";
import {
  type CharacterImagePersistence,
  readCharacterImage,
  writeCharacterImage,
} from "../../../../src/character-sheet/persistence/character-image";

const record = {
  base64: "UklGRiIAAABXRUJQVlA4IBYAAADQAQCdASoBAAEALmk0mk0iIiIiIgBoSywA",
  mimeType: "image/webp",
} as const;

test("writes and reads one valid character image record", async () => {
  let stored: unknown = null;
  const persistence: CharacterImagePersistence = {
    read: async () => stored,
    write: async (nextRecord) => {
      stored = nextRecord;
    },
  };

  await writeCharacterImage(record, persistence);

  assert.deepEqual(
    await readCharacterImage(persistence, async () => {}),
    record,
  );
});

test("leaves a missing record unselected and rejects a malformed record", async () => {
  const missing: CharacterImagePersistence = {
    read: async () => null,
    write: async () => {},
  };
  const malformed: CharacterImagePersistence = {
    read: async () => ({ base64: "not-an-image", mimeType: "image/png" }),
    write: async () => {},
  };

  assert.equal(await readCharacterImage(missing, async () => {}), null);
  await assert.rejects(() => readCharacterImage(malformed, async () => {}));
});

test("rejects a structurally valid record when the browser cannot decode it", async () => {
  const persistence: CharacterImagePersistence = {
    read: async () => record,
    write: async () => {},
  };

  await assert.rejects(
    () =>
      readCharacterImage(persistence, async () => {
        throw new CharacterImageError("decode");
      }),
    (error: unknown) =>
      error instanceof CharacterImageError && error.code === "decode",
  );
});

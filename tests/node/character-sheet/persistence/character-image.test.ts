import assert from "node:assert/strict";
import { test } from "vitest";

import { CharacterImageError } from "../../../../src/character-sheet/character-image";
import {
  type CharacterImagePersistence,
  deleteCharacterImage,
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
    delete: async () => {
      stored = null;
    },
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
    delete: async () => {},
    read: async () => null,
    write: async () => {},
  };
  const malformed: CharacterImagePersistence = {
    delete: async () => {},
    read: async () => ({ base64: "not-an-image", mimeType: "image/png" }),
    write: async () => {},
  };

  assert.equal(await readCharacterImage(missing, async () => {}), null);
  await assert.rejects(() => readCharacterImage(malformed, async () => {}));
});

test("rejects a structurally valid record when the browser cannot decode it", async () => {
  const persistence: CharacterImagePersistence = {
    delete: async () => {},
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

test("deletes the current image record and reports a storage failure", async () => {
  let stored: unknown = record;
  const persistence: CharacterImagePersistence = {
    delete: async () => {
      stored = null;
    },
    read: async () => stored,
    write: async () => {},
  };

  await deleteCharacterImage(persistence);
  assert.equal(await persistence.read(), null);

  await assert.rejects(
    () =>
      deleteCharacterImage({
        delete: async () => {
          throw new Error("IndexedDB unavailable");
        },
        read: async () => null,
        write: async () => {},
      }),
    (error: unknown) =>
      error instanceof CharacterImageError && error.code === "storage",
  );
});

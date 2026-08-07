import { expect, test } from "vitest";
import {
  type CharacterImagePersistence,
  deleteCharacterImage,
  readCharacterImage,
  writeCharacterImage,
} from "../../../../src/character-sheet/persistence/character-image";
import { CharacterImageError } from "../../../../src/character-sheet/schemas/character-image";

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

  expect(await readCharacterImage(persistence, async () => {})).toEqual(record);
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

  expect(await readCharacterImage(missing, async () => {})).toBe(null);
  await expect(readCharacterImage(malformed, async () => {})).rejects.toThrow();
});

test("rejects a structurally valid record when the browser cannot decode it", async () => {
  const persistence: CharacterImagePersistence = {
    delete: async () => {},
    read: async () => record,
    write: async () => {},
  };

  const result = readCharacterImage(persistence, async () => {
    throw new CharacterImageError("decode");
  });
  await expect(result).rejects.toBeInstanceOf(CharacterImageError);
  await expect(result).rejects.toMatchObject({ code: "decode" });
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
  expect(await persistence.read()).toBe(null);

  const result = deleteCharacterImage({
    delete: async () => {
      throw new Error("IndexedDB unavailable");
    },
    read: async () => null,
    write: async () => {},
  });
  await expect(result).rejects.toBeInstanceOf(CharacterImageError);
  await expect(result).rejects.toMatchObject({ code: "storage" });
});

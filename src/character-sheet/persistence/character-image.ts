import { createStore, get, set } from "idb-keyval";
import { decodeCharacterImageRecord } from "../browser/character-image";
import {
  CharacterImageError,
  type CharacterImageRecord,
  characterImageRecordSchema,
} from "../character-image";

const characterImageStore = createStore(
  "neon-underrealm-character-sheet",
  "character-images",
);
const characterImageKey = "current-character-image";

export type CharacterImagePersistence = {
  read: () => Promise<unknown>;
  write: (record: CharacterImageRecord) => Promise<void>;
};

export type CharacterImageDecoder = (
  record: CharacterImageRecord,
) => Promise<void>;

const indexedDbCharacterImagePersistence: CharacterImagePersistence = {
  read: () => get(characterImageKey, characterImageStore),
  write: (record) => set(characterImageKey, record, characterImageStore),
};

export async function readCharacterImage(
  persistence: CharacterImagePersistence = indexedDbCharacterImagePersistence,
  decode: CharacterImageDecoder = decodeCharacterImageRecord,
): Promise<CharacterImageRecord | null> {
  try {
    const record = await persistence.read();

    if (record === undefined || record === null) {
      return null;
    }

    const parsedRecord = characterImageRecordSchema.safeParse(record);

    if (!parsedRecord.success) {
      throw new CharacterImageError("decode");
    }

    await decode(parsedRecord.data);

    return parsedRecord.data;
  } catch (error) {
    if (error instanceof CharacterImageError) {
      throw error;
    }

    throw new CharacterImageError("decode");
  }
}

export async function writeCharacterImage(
  record: CharacterImageRecord,
  persistence: CharacterImagePersistence = indexedDbCharacterImagePersistence,
): Promise<void> {
  try {
    await persistence.write(record);
  } catch {
    throw new CharacterImageError("storage");
  }
}

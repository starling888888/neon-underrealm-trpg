export const remoteCharacterStorageKey =
  "neon-underrealm-character-sheet-remote-character";

type StorageLike = Pick<Storage, "getItem" | "removeItem" | "setItem">;

/** Persists only the current remote record ID, never its authorization state. */
export function readRemoteCharacterId(storage: StorageLike): string | null {
  return storage.getItem(remoteCharacterStorageKey);
}

export function writeRemoteCharacterId(storage: StorageLike, id: string): void {
  storage.setItem(remoteCharacterStorageKey, id);
}

export function deleteRemoteCharacterId(storage: StorageLike): void {
  storage.removeItem(remoteCharacterStorageKey);
}

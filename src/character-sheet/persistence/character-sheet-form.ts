import type { CharacterSheetFormValues } from "../form-values";

export const characterSheetFormStorageKey =
  "neon-underrealm-character-sheet-form";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function readCharacterSheetForm(storage: StorageLike): string | null {
  return storage.getItem(characterSheetFormStorageKey);
}

export function writeCharacterSheetForm(
  storage: StorageLike,
  values: CharacterSheetFormValues,
): void {
  storage.setItem(characterSheetFormStorageKey, JSON.stringify(values));
}

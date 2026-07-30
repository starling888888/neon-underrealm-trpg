import type { CharacterImageRecord } from "./character-image";
import type { CharacterSheetFormValues } from "./form-values";

export type CharacterSheetJsonExport = CharacterSheetFormValues & {
  imageBase64String: string | null;
};

/** Combines the independently persisted image with the current form at export time. */
export function createCharacterSheetJsonExport(
  values: CharacterSheetFormValues,
  characterImage: CharacterImageRecord | null,
): CharacterSheetJsonExport {
  return {
    ...values,
    imageBase64String: characterImage?.base64 ?? null,
  };
}

export function serializeCharacterSheetJsonExport(
  values: CharacterSheetFormValues,
  characterImage: CharacterImageRecord | null,
): string {
  return JSON.stringify(
    createCharacterSheetJsonExport(values, characterImage),
    null,
    2,
  );
}

export function createCharacterSheetJsonFilename(
  values: Pick<CharacterSheetFormValues, "profile">,
  date: Date,
): string {
  const datePart = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  return `neon-underrealm_character-sheet_${datePart}_${values.profile.playerName}_${values.profile.pcName}.json`;
}

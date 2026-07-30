import type { CharacterSheetFormValues } from "../form-values";
import { characterSheetFormSchema } from "./character-sheet-form";

/** Parses an external snapshot without changing the current RHF state. */
export function parseCharacterSheetRestoreValue(
  value: unknown,
): CharacterSheetFormValues | null {
  const parsed = characterSheetFormSchema.safeParse(value);
  return parsed.success ? parsed.data : null;
}

/** Shared boundary for localStorage and the future JSON import Gate. */
export function parseCharacterSheetRestoreJson(
  text: string,
): CharacterSheetFormValues | null {
  try {
    return parseCharacterSheetRestoreValue(JSON.parse(text));
  } catch {
    return null;
  }
}

import { characterSheetInputSchema } from "@neon-underrealm/shared";
import type { CharacterSheetInput } from "@neon-underrealm/shared";
import { ApplicationError } from "../application-error.js";

export async function parseCharacterSheetInput(
  request: Request,
): Promise<CharacterSheetInput> {
  const text = await request.text();

  let value: unknown;

  try {
    value = JSON.parse(text);
  } catch {
    throw new ApplicationError("bad_request");
  }

  const result = characterSheetInputSchema.safeParse(value);

  if (!result.success) throw new ApplicationError("bad_request");

  return result.data;
}

export function parseCharacterSheetId(id: string): string {
  if (!characterSheetInputSchema.shape.id.safeParse(id).success) {
    throw new ApplicationError("bad_request");
  }

  return id;
}

import { characterSheetInputSchema } from "@neon-underrealm/shared";
import type { CharacterSheetInput } from "@neon-underrealm/shared";
import { ApplicationError } from "../application-error.js";

export const maximumRequestBodyBytes = 8 * 1024 * 1024;

export async function parseCharacterSheetInput(
  request: Request,
): Promise<CharacterSheetInput> {
  const contentLength = request.headers.get("Content-Length");

  if (
    contentLength !== null &&
    Number.isFinite(Number(contentLength)) &&
    Number(contentLength) > maximumRequestBodyBytes
  ) {
    throw new ApplicationError("payload_too_large");
  }

  const text = await request.text();

  if (new TextEncoder().encode(text).byteLength > maximumRequestBodyBytes) {
    throw new ApplicationError("payload_too_large");
  }

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

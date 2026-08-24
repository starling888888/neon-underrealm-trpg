import { characterSheetInputSchema } from "@neon-underrealm/shared";
import type { CharacterSheetInput } from "@neon-underrealm/shared";
import { ApiError } from "./api-error.js";

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
    throw new ApiError(413, "payload_too_large");
  }

  const text = await request.text();

  if (new TextEncoder().encode(text).byteLength > maximumRequestBodyBytes) {
    throw new ApiError(413, "payload_too_large");
  }

  let value: unknown;

  try {
    value = JSON.parse(text);
  } catch {
    throw new ApiError(400, "bad_request");
  }

  const result = characterSheetInputSchema.safeParse(value);

  if (!result.success) throw new ApiError(400, "bad_request");

  return result.data;
}

export function parseBearerToken(
  authorization: string | undefined,
): string | undefined {
  if (authorization === undefined) return undefined;

  const match = /^Bearer ([^\s]+)$/.exec(authorization);

  if (match?.[1] === undefined) throw new ApiError(401, "invalid_token");

  return match[1];
}

export function parseCharacterSheetId(id: string): string {
  if (!characterSheetInputSchema.shape.id.safeParse(id).success) {
    throw new ApiError(400, "bad_request");
  }

  return id;
}

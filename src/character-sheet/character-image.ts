import { z } from "zod";

export const characterImageMimeType = "image/webp";

export type CharacterImageRecord = {
  base64: string;
  mimeType: typeof characterImageMimeType;
};

export const characterImageRecordSchema = z.object({
  base64: z.string().min(1),
  mimeType: z.literal(characterImageMimeType),
});

export type CharacterImageErrorCode =
  | "decode"
  | "file-too-large"
  | "invalid-type"
  | "storage";

export class CharacterImageError extends Error {
  code: CharacterImageErrorCode;

  constructor(code: CharacterImageErrorCode) {
    super(code);
    this.code = code;
  }
}

export function characterImageDataUrl({
  base64,
  mimeType,
}: CharacterImageRecord): string {
  return `data:${mimeType};base64,${base64}`;
}

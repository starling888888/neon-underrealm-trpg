import {
  CharacterImageError,
  type CharacterImageRecord,
  characterImageDataUrl,
  characterImageMimeType,
} from "../character-image";

export const characterImageMaximumBytes = 5_242_880;
export const characterImageMaximumSide = 500;
export const characterImageWebpQuality = 0.8;

export { CharacterImageError } from "../character-image";

type ImageFile = Pick<File, "size" | "type">;

export function validateCharacterImageFile(file: ImageFile): void {
  if (!file.type.startsWith("image/")) {
    throw new CharacterImageError("invalid-type");
  }

  if (file.size > characterImageMaximumBytes) {
    throw new CharacterImageError("file-too-large");
  }
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new CharacterImageError("decode"));
    };
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.src = url;
  });
}

/** Rejects persisted records that the browser cannot decode as an image. */
export function decodeCharacterImageRecord(
  record: CharacterImageRecord,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onerror = () => reject(new CharacterImageError("decode"));
    image.onload = () => resolve();
    image.src = characterImageDataUrl(record);
  });
}

function toBase64(dataUrl: string): string {
  const prefix = `data:${characterImageMimeType};base64,`;

  if (!dataUrl.startsWith(prefix)) {
    throw new CharacterImageError("decode");
  }

  return dataUrl.slice(prefix.length);
}

export async function convertCharacterImage(
  file: File,
): Promise<CharacterImageRecord> {
  validateCharacterImageFile(file);

  const image = await loadImage(file);
  const scale = Math.min(
    1,
    characterImageMaximumSide /
      Math.max(image.naturalWidth, image.naturalHeight),
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (context === null) {
    throw new CharacterImageError("decode");
  }

  canvas.width = width;
  canvas.height = height;
  context.drawImage(image, 0, 0, width, height);

  return {
    base64: toBase64(
      canvas.toDataURL(characterImageMimeType, characterImageWebpQuality),
    ),
    mimeType: characterImageMimeType,
  };
}

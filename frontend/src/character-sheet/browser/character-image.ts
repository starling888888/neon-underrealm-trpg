import {
  CharacterImageError,
  type CharacterImageRecord,
  characterImageDataUrl,
  characterImageMimeType,
} from "../schemas/character-image";

export const characterImageMaximumBytes = 4 * 1024 * 1024;
export const characterImageMaximumSide = 500;
export const characterImageWebpQuality = 0.8;

export { CharacterImageError } from "../schemas/character-image";

type ImageFile = Pick<File, "size" | "type">;

export function validateCharacterImageFile(file: ImageFile): void {
  if (!file.type.startsWith("image/")) {
    throw new CharacterImageError("invalid-type");
  }

  if (file.size > characterImageMaximumBytes) {
    throw new CharacterImageError("file-too-large");
  }
}

/** Checks that an exported image string is base64-encoded WebP data. */
export function isWebpBase64(base64: string): boolean {
  if (
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      base64,
    )
  ) {
    return false;
  }

  try {
    const bytes = atob(base64);

    return (
      bytes.length >= 12 &&
      bytes.slice(0, 4) === "RIFF" &&
      bytes.slice(8, 12) === "WEBP"
    );
  } catch {
    return false;
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

/** Validates an imported image independently from imported form values. */
export async function decodeImportedCharacterImage(
  base64: string,
): Promise<CharacterImageRecord> {
  if (!isWebpBase64(base64)) {
    throw new CharacterImageError("decode");
  }

  const record = { base64, mimeType: characterImageMimeType } as const;
  await decodeCharacterImageRecord(record);
  return record;
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

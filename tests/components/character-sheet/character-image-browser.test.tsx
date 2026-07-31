// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";

import { decodeCharacterImageRecord } from "../../../src/character-sheet/browser/character-image";
import type { CharacterImageRecord } from "../../../src/character-sheet/character-image";

const validRecord: CharacterImageRecord = {
  base64: "UklGRiIAAABXRUJQVlA4IBYAAADQAQCdASoBAAEALmk0mk0iIiIiIgBoSywA",
  mimeType: "image/webp",
};

afterEach(() => vi.unstubAllGlobals());

describe("decodeCharacterImageRecord", () => {
  it("rejects a record that the browser image decoder cannot load", async () => {
    class RejectingImage {
      onerror: (() => void) | null = null;
      onload: (() => void) | null = null;

      set src(_: string) {
        queueMicrotask(() => this.onerror?.());
      }
    }

    vi.stubGlobal("Image", RejectingImage);

    await expect(decodeCharacterImageRecord(validRecord)).rejects.toThrow(
      "decode",
    );
  });
});

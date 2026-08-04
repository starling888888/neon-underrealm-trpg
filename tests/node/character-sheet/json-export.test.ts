import { expect, test } from "vitest";

import { downloadJsonFile } from "../../../src/character-sheet/browser/json-download";
import { characterImageMimeType } from "../../../src/character-sheet/character-image";
import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import {
  createCharacterSheetJsonExport,
  createCharacterSheetJsonFilename,
  serializeCharacterSheetJsonExport,
} from "../../../src/character-sheet/json-export";

test("creates JSON export with the selected image base64 string", () => {
  const values = {
    ...characterSheetDefaultValues,
    profile: {
      ...characterSheetDefaultValues.profile,
      pcName: "テストPC",
      playerName: "テストPL",
    },
  };

  const exported = createCharacterSheetJsonExport(values, {
    base64: "image-base64",
    mimeType: characterImageMimeType,
  });

  expect(exported.imageBase64String).toBe("image-base64");
  expect(exported.profile.pcName).toBe("テストPC");
  expect(serializeCharacterSheetJsonExport(values, null)).toBe(
    JSON.stringify({ ...values, imageBase64String: null }, null, 2),
  );
});

test("uses the specified date, player name, and PC name for JSON filenames", () => {
  expect(
    createCharacterSheetJsonFilename(
      {
        profile: {
          ...characterSheetDefaultValues.profile,
          pcName: "PC名",
          playerName: "PL名",
        },
      },
      new Date(2026, 6, 30),
    ),
  ).toBe("neon-underrealm_character-sheet_2026-07-30_PL名_PC名.json");
});

test("downloads JSON through replaceable browser dependencies and revokes its URL", async () => {
  let clicked = false;
  const createdBlobs: Blob[] = [];
  const anchor = {
    click: () => {
      clicked = true;
    },
    download: "",
    href: "",
  } as unknown as HTMLAnchorElement;
  const revokedUrls: string[] = [];

  downloadJsonFile('{"test":true}', "character.json", {
    createAnchor: () => anchor,
    createObjectUrl: (blob) => {
      createdBlobs.push(blob);
      return "blob:test";
    },
    revokeObjectUrl: (url) => revokedUrls.push(url),
  });

  expect(clicked).toBe(true);
  expect(anchor.href).toBe("blob:test");
  expect(anchor.download).toBe("character.json");
  expect(revokedUrls).toEqual(["blob:test"]);
  const createdBlob = createdBlobs[0];
  expect(createdBlob).not.toBe(undefined);
  expect(await createdBlob.text()).toBe('{"test":true}');
  expect(createdBlob.type).toBe("application/json;charset=utf-8");
});

test("revokes the object URL when starting the download throws", () => {
  const error = new Error("download failed");
  const revokedUrls: string[] = [];
  const anchor = {
    click: () => {
      throw error;
    },
    download: "",
    href: "",
  } as unknown as HTMLAnchorElement;

  expect(() =>
    downloadJsonFile('{"test":true}', "character.json", {
      createAnchor: () => anchor,
      createObjectUrl: () => "blob:test",
      revokeObjectUrl: (url) => revokedUrls.push(url),
    }),
  ).toThrow(error);

  expect(revokedUrls).toEqual(["blob:test"]);
});

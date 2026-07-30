import assert from "node:assert/strict";
import test from "node:test";

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

  assert.equal(exported.imageBase64String, "image-base64");
  assert.equal(exported.profile.pcName, "テストPC");
  assert.equal(
    serializeCharacterSheetJsonExport(values, null),
    JSON.stringify({ ...values, imageBase64String: null }, null, 2),
  );
});

test("uses the specified date, player name, and PC name for JSON filenames", () => {
  assert.equal(
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
    "neon-underrealm_character-sheet_2026-07-30_PL名_PC名.json",
  );
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
  } as HTMLAnchorElement;
  const revokedUrls: string[] = [];

  downloadJsonFile('{"test":true}', "character.json", {
    createAnchor: () => anchor,
    createObjectUrl: (blob) => {
      createdBlobs.push(blob);
      return "blob:test";
    },
    revokeObjectUrl: (url) => revokedUrls.push(url),
  });

  assert.equal(clicked, true);
  assert.equal(anchor.href, "blob:test");
  assert.equal(anchor.download, "character.json");
  assert.deepEqual(revokedUrls, ["blob:test"]);
  const createdBlob = createdBlobs[0];
  assert.notEqual(createdBlob, undefined);
  assert.equal(await createdBlob.text(), '{"test":true}');
  assert.equal(createdBlob.type, "application/json;charset=utf-8");
});

import {
  characterSheetInputSchema,
  characterSheetMaximumImageBase64Bytes,
} from "@neon-underrealm/shared";
import { expect, test } from "vitest";
import { createCharacterSheetInput } from "../../../../src/character-sheet/api/character-sheet-input";
import { characterSheetDefaultValues } from "../../../../src/character-sheet/form/values";

test("builds metadata and snapshots from the same edited profile", () => {
  const input = createCharacterSheetInput({
    image: null,
    isPublic: false,
    pcName: "保存PC",
    plName: "保存PL",
    values: characterSheetDefaultValues,
  });

  expect(input.id).toBeUndefined();
  expect(input.metadata).toMatchObject({
    isPublic: false,
    pcName: "保存PC",
    plName: "保存PL",
    rank: 2,
  });
  expect(input.snapshot).toMatchObject({
    imageBase64String: null,
    profile: { pcName: "保存PC", playerName: "保存PL" },
  });
});

test("accepts a 4 MiB image base64 string and rejects one byte more", () => {
  const input = createCharacterSheetInput({
    image: null,
    isPublic: true,
    pcName: "境界PC",
    plName: "",
    values: characterSheetDefaultValues,
  });

  expect(
    characterSheetInputSchema.safeParse({
      ...input,
      snapshot: {
        ...input.snapshot,
        imageBase64String: "A".repeat(characterSheetMaximumImageBase64Bytes),
      },
    }).success,
  ).toBe(true);
  expect(
    characterSheetInputSchema.safeParse({
      ...input,
      snapshot: {
        ...input.snapshot,
        imageBase64String: "A".repeat(
          characterSheetMaximumImageBase64Bytes + 1,
        ),
      },
    }).success,
  ).toBe(false);
});

import { expect, test } from "vitest";

import { writeTextToClipboard } from "../../../../src/character-sheet/browser/ccfolia-clipboard";

test("writes the serialized CCFOLIA payload through a replaceable clipboard writer", async () => {
  const written: string[] = [];

  await writeTextToClipboard('{"kind":"character"}', {
    writeText: async (text) => {
      written.push(text);
    },
  });

  expect(written).toEqual(['{"kind":"character"}']);
});

test("keeps clipboard writer failures observable to the caller", async () => {
  const error = new Error("denied");

  await expect(
    writeTextToClipboard("test", {
      writeText: async () => {
        throw error;
      },
    }),
  ).rejects.toThrow(error);
});

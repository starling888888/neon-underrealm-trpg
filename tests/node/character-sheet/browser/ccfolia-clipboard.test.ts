import assert from "node:assert/strict";
import test from "node:test";

import { writeTextToClipboard } from "../../../../src/character-sheet/browser/ccfolia-clipboard";

test("writes the serialized CCFOLIA payload through a replaceable clipboard writer", async () => {
  const written: string[] = [];

  await writeTextToClipboard('{"kind":"character"}', {
    writeText: async (text) => {
      written.push(text);
    },
  });

  assert.deepEqual(written, ['{"kind":"character"}']);
});

test("keeps clipboard writer failures observable to the caller", async () => {
  const error = new Error("denied");

  await assert.rejects(
    () =>
      writeTextToClipboard("test", {
        writeText: async () => {
          throw error;
        },
      }),
    error,
  );
});

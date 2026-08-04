import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  getOmamori,
  getOmamoriById,
} from "../../../src/character-sheet/master-data/omamori";
import { getItemsData } from "../../../src/lib/data/items";

describe("character sheet omamori", () => {
  it("keeps generated-data order and resolves only known IDs", () => {
    const omamori = getOmamori();
    const first = omamori[0];
    if (first === undefined) throw new Error("お守りmaster dataがありません。");

    assert.deepEqual(
      omamori.map((item) => item.id),
      getItemsData().omamori.map((item) => item.id),
    );
    assert.equal(getOmamoriById(first.id)?.id, first.id);
    assert.equal(getOmamoriById(null), null);
    assert.equal(getOmamoriById("unknown-omamori"), null);
  });
});

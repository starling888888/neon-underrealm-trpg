import { describe, expect, it } from "vitest";

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

    expect(omamori.map((item) => item.id)).toEqual(
      getItemsData().omamori.map((item) => item.id),
    );
    expect(getOmamoriById(first.id)?.id).toBe(first.id);
    expect(getOmamoriById(null)).toBe(null);
    expect(getOmamoriById("unknown-omamori")).toBe(null);
  });
});

import { describe, expect, it } from "vitest";

import { getBuildSources } from "../../../src/character-sheet/master-data/build";

describe("character sheet build master data", () => {
  it("returns null sources for unknown selected IDs", () => {
    expect(
      getBuildSources({
        ikizamaId: "unknown-ikizama",
        primaryRyugiId: "unknown-ryugi",
      }),
    ).toEqual({ ikizama: null, primaryRyugi: null });
  });
});

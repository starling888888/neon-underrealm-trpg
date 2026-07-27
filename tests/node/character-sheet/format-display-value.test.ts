import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatDisplayValue } from "../../../src/character-sheet/format-display-value";

describe("formatDisplayValue", () => {
  it("uses the shared unavailable marker only for nullish values", () => {
    assert.equal(formatDisplayValue(null), "-");
    assert.equal(formatDisplayValue(undefined), "-");
    assert.equal(formatDisplayValue(0), "0");
    assert.equal(formatDisplayValue(""), "");
  });
});

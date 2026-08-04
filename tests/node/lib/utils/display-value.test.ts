import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  formatDisplayText,
  formatDisplayValue,
} from "../../../../src/lib/utils/display-value";

describe("formatDisplayValue", () => {
  it("uses the shared unavailable marker for nullish and blank values", () => {
    assert.equal(formatDisplayValue(null), "-");
    assert.equal(formatDisplayValue(undefined), "-");
    assert.equal(formatDisplayValue(""), "-");
    assert.equal(formatDisplayValue("  "), "-");
    assert.equal(formatDisplayValue(0), "0");
  });
});

describe("formatDisplayText", () => {
  it("keeps optional prose empty when it is absent or blank", () => {
    assert.equal(formatDisplayText(null), "");
    assert.equal(formatDisplayText(undefined), "");
    assert.equal(formatDisplayText(""), "");
    assert.equal(formatDisplayText("  "), "");
    assert.equal(formatDisplayText(" 効果 "), "効果");
  });
});

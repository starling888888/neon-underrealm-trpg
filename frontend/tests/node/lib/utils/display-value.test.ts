import { describe, expect, it } from "vitest";

import {
  formatDisplayText,
  formatDisplayValue,
} from "../../../../src/lib/utils/display-value";

describe("formatDisplayValue", () => {
  it("uses the shared unavailable marker for nullish and blank values", () => {
    expect(formatDisplayValue(null)).toBe("-");
    expect(formatDisplayValue(undefined)).toBe("-");
    expect(formatDisplayValue("")).toBe("-");
    expect(formatDisplayValue("  ")).toBe("-");
    expect(formatDisplayValue(0)).toBe("0");
  });
});

describe("formatDisplayText", () => {
  it("keeps optional prose empty when it is absent or blank", () => {
    expect(formatDisplayText(null)).toBe("");
    expect(formatDisplayText(undefined)).toBe("");
    expect(formatDisplayText("")).toBe("");
    expect(formatDisplayText("  ")).toBe("");
    expect(formatDisplayText(" 効果 ")).toBe("効果");
  });
});

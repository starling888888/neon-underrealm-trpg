import { describe, expect, it } from "vitest";

import { toAbsoluteUrl, withBase } from "../../src/lib/utils/paths";

describe("withBase", () => {
  it.each([
    ["/rules/", "/rules/"],
    ["rules/", "/rules/"],
    ["", ""],
    ["#section", "#section"],
    ["//static.example.com/script.js", "//static.example.com/script.js"],
    ["https://example.com/rules/", "https://example.com/rules/"],
  ])("returns %s as %s", (path, expected) => {
    expect(withBase(path)).toBe(expected);
  });
});

describe("toAbsoluteUrl", () => {
  const site = new URL("https://example.com/");

  it.each([
    ["", ""],
    ["#section", "#section"],
    ["/rules/", "https://example.com/rules/"],
    ["https://external.example/rules/", "https://external.example/rules/"],
  ])("converts %s to %s", (path, expected) => {
    expect(toAbsoluteUrl(path, site)).toBe(expected);
  });
});

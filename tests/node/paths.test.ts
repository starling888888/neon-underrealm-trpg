import { afterEach, describe, expect, it, vi } from "vitest";

import { toAbsoluteUrl, withBase } from "../../src/lib/utils/paths";

afterEach(() => {
  vi.unstubAllEnvs();
});

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

  it("adds the GitHub Pages public base path", async () => {
    vi.stubEnv("BASE_URL", "/neon-underrealm-trpg/");
    vi.resetModules();

    const { withBase: withPublicBase } = await import(
      "../../src/lib/utils/paths"
    );

    expect(withPublicBase("/rules/")).toBe("/neon-underrealm-trpg/rules/");
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

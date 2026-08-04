import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const dummyToken = "cloudflare-web-analytics-test-token";
const scriptSource = "https://static.cloudflareinsights.com/beacon.min.js";

describe("Cloudflare Web Analytics production build contract", () => {
  it("renders one valid beacon in every representative public document", () => {
    for (const route of ["/", "/rules/battle", "/character-sheet", "/404"]) {
      const scripts = getBeaconScripts(route);

      expect(scripts.length, route).toBe(1);
      expect(scripts[0]).toMatch(/\btype="module"/);

      const attribute = scripts[0].match(/\bdata-cf-beacon="([^"]*)"/);
      expect(attribute, `Expected data-cf-beacon on ${route}.`).toBeTruthy();
      if (attribute === null)
        throw new Error(`Expected data-cf-beacon on ${route}.`);
      expect(JSON.parse(decodeHtmlAttribute(attribute[1]))).toEqual({
        token: dummyToken,
        spa: false,
      });
    }
  });
});

function getBeaconScripts(route: string): string[] {
  const html = readFileSync(getOutputPath(route), "utf8");
  const escapedSource = scriptSource
    .replaceAll(".", "\\.")
    .replaceAll("/", "\\/");
  const scriptPattern = new RegExp(
    `<script\\b(?=[^>]*\\bsrc="${escapedSource}")[^>]*><\\/script>`,
    "g",
  );

  return [...html.matchAll(scriptPattern)].map(([script]) => script);
}

function getOutputPath(route: string): string {
  if (route === "/404") {
    return path.resolve("dist/404.html");
  }

  return path.resolve(
    "dist",
    route === "/" ? "index.html" : route.slice(1),
    route === "/" ? "" : "index.html",
  );
}

function decodeHtmlAttribute(value: string): string {
  return value
    .replaceAll("&quot;", '"')
    .replaceAll("&amp;", "&")
    .replaceAll("&#x27;", "'");
}

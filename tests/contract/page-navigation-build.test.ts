import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { getIkizamaList } from "../../src/lib/data/ikizama";
import { getRyugiList } from "../../src/lib/data/ryugi-list";

const basePath = "/neon-underrealm-trpg";
const readingPaths = [
  "/introduction",
  "/world",
  "/character-making",
  "/rules",
  "/rules/scenario-play",
  "/rules/battle",
  "/data",
  "/data/ryugi",
  ...getRyugiList().map((ryugi) => `/data/ryugi/${ryugi.id}`),
  "/data/ikizama",
  ...getIkizamaList().map((ikizama) => `/data/ikizama/${ikizama.id}`),
  "/data/common-skills",
  "/data/items",
  "/data/items/weapons",
  "/data/items/armors",
  "/data/items/omamori",
  "/data/items/cybernetics",
  "/data/items/nanomachines",
  "/data/items/drugs",
  "/advancement",
];

describe("page navigation public build contract", () => {
  it("connects every target page in reading order with base-prefixed links", () => {
    for (const [index, route] of readingPaths.entries()) {
      const expectedHrefs = [
        ...(index > 0 ? [`${basePath}${readingPaths[index - 1]}`] : []),
        ...(index < readingPaths.length - 1
          ? [`${basePath}${readingPaths[index + 1]}`]
          : []),
      ];

      assert.deepEqual(getPageNavigationHrefs(route), expectedHrefs, route);
    }
  });

  it("omits navigation from pages outside the reading order", () => {
    for (const route of ["/", "/release-notes", "/404"]) {
      assert.equal(getPageNavigationHrefs(route), undefined, route);
    }

    assert.equal(existsSync(path.resolve("dist/-local")), false);
  });
});

function getPageNavigationHrefs(route: string): string[] | undefined {
  const html = readFileSync(getOutputPath(route), "utf8");
  const navigation = html.match(
    /<nav class="page-navigation" aria-label="ページ間ナビゲーション"[^>]*>(.*?)<\/nav>/,
  );

  if (!navigation) {
    return undefined;
  }

  return [...navigation[1].matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(
    ([, href]) => href,
  );
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

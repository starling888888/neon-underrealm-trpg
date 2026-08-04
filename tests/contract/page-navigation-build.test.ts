import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
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

      expect(getPageNavigationHrefs(route), route).toEqual(expectedHrefs);
    }
  });

  it("omits navigation from pages outside the reading order", () => {
    for (const route of ["/", "/release-notes", "/404"]) {
      expect(getPageNavigationHrefs(route), route).toBe(undefined);
    }

    expect(existsSync(path.resolve("dist/-local"))).toBe(false);
  });

  it("omits the beacon from a public build without a token", () => {
    for (const route of ["/", "/rules/battle", "/character-sheet", "/404"]) {
      expect(getCloudflareBeaconCount(route), route).toBe(0);
    }
  });

  it("places the single shared analytics component before the closing body", () => {
    const layout = readFileSync("src/layouts/AppContainer.astro", "utf8");
    const component = readFileSync(
      "src/components/analytics/CloudflareWebAnalytics.astro",
      "utf8",
    );

    expect([...layout.matchAll(/<CloudflareWebAnalytics\s*\/>/g)].length).toBe(
      1,
    );
    expect(
      layout.indexOf("<CloudflareWebAnalytics />") < layout.indexOf("</body>"),
    ).toBeTruthy();
    expect(component).toMatch(/isProduction: import\.meta\.env\.PROD/);
    expect(component).toMatch(/data-cf-beacon=\{beacon\.dataCfBeacon\}/);
  });

  it("passes the token only to the deployment build after a non-empty check", () => {
    const workflow = readFileSync(".github/workflows/deploy.yml", "utf8");

    expect(workflow).toMatch(
      /name: Require Cloudflare Web Analytics token[\s\S]*?CLOUDFLARE_WEB_ANALYTICS_TOKEN: \$\{\{ vars\.CLOUDFLARE_WEB_ANALYTICS_TOKEN \}\}[\s\S]*?if \[ -z "\$CLOUDFLARE_WEB_ANALYTICS_TOKEN" \]/,
    );
    expect(workflow).toMatch(
      /name: Build[\s\S]*?CLOUDFLARE_WEB_ANALYTICS_TOKEN: \$\{\{ vars\.CLOUDFLARE_WEB_ANALYTICS_TOKEN \}\}[\s\S]*?run: npm run build:public/,
    );
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

function getCloudflareBeaconCount(route: string): number {
  const html = readFileSync(getOutputPath(route), "utf8");
  return [
    ...html.matchAll(
      /<script\b[^>]*\bsrc="https:\/\/static\.cloudflareinsights\.com\/beacon\.min\.js"[^>]*><\/script>/g,
    ),
  ].length;
}

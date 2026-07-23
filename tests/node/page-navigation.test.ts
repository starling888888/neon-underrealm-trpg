import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { getIkizamaList } from "../../src/lib/data/ikizama";
import { getRyugiList } from "../../src/lib/data/ryugi-list";
import {
  flattenSiteMenuItems,
  getSiteMenuLink,
  type SiteMenuItem,
  siteMenuLinks,
} from "../../src/lib/site/menu";

const staticPageNavigation = [
  {
    file: "src/pages/introduction.mdx",
    prevPath: undefined,
    nextPath: "/world",
  },
  {
    file: "src/pages/world.mdx",
    prevPath: "/introduction",
    nextPath: "/character-making",
  },
  {
    file: "src/pages/character-making.mdx",
    prevPath: "/world",
    nextPath: "/rules",
  },
  {
    file: "src/pages/rules/index.mdx",
    prevPath: "/character-making",
    nextPath: "/rules/scenario-play",
  },
  {
    file: "src/pages/rules/scenario-play.mdx",
    prevPath: "/rules",
    nextPath: "/rules/battle",
  },
  {
    file: "src/pages/rules/battle.mdx",
    prevPath: "/rules/scenario-play",
    nextPath: "/data",
  },
  {
    file: "src/pages/data/index.mdx",
    prevPath: "/rules/battle",
    nextPath: "/data/ryugi",
  },
  {
    file: "src/pages/data/common-skills.mdx",
    prevPath: "/data/ikizama/yaku",
    nextPath: "/data/items",
  },
  {
    file: "src/pages/data/items/index.mdx",
    prevPath: "/data/common-skills",
    nextPath: "/data/items/weapons",
  },
  {
    file: "src/pages/data/items/weapons.mdx",
    prevPath: "/data/items",
    nextPath: "/data/items/armors",
  },
  {
    file: "src/pages/data/items/armors.mdx",
    prevPath: "/data/items/weapons",
    nextPath: "/data/items/omamori",
  },
  {
    file: "src/pages/data/items/omamori.mdx",
    prevPath: "/data/items/armors",
    nextPath: "/data/items/cybernetics",
  },
  {
    file: "src/pages/data/items/cybernetics.mdx",
    prevPath: "/data/items/omamori",
    nextPath: "/data/items/nanomachines",
  },
  {
    file: "src/pages/data/items/nanomachines.mdx",
    prevPath: "/data/items/cybernetics",
    nextPath: "/data/items/drugs",
  },
  {
    file: "src/pages/data/items/drugs.mdx",
    prevPath: "/data/items/nanomachines",
    nextPath: "/advancement",
  },
  {
    file: "src/pages/advancement.mdx",
    prevPath: "/data/items/drugs",
    nextPath: undefined,
  },
] as const;

describe("page navigation", () => {
  it("keeps the target reading order in depth-first site menu order", () => {
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
    const start = siteMenuLinks.findIndex(
      (link) => link.href === "/introduction",
    );
    const end = siteMenuLinks.findIndex((link) => link.href === "/advancement");

    assert.deepEqual(
      siteMenuLinks.slice(start, end + 1),
      readingPaths.map((href) => getSiteMenuLink(href)),
    );
  });

  it("uses page-specific paths in MDX frontmatter", () => {
    for (const { file, prevPath, nextPath } of staticPageNavigation) {
      const source = readFileSync(file, "utf8");

      assert.equal(getFrontmatterValue(source, "prevPath"), prevPath, file);
      assert.equal(getFrontmatterValue(source, "nextPath"), nextPath, file);
    }
  });

  it("resolves labels from the site menu", () => {
    assert.deepEqual(getSiteMenuLink("/character-making"), {
      href: "/character-making",
      label: "キャラクターメイキング",
    });
    assert.deepEqual(getSiteMenuLink("/advancement"), {
      href: "/advancement",
      label: "キャラクター成長",
    });
  });

  it("rejects unknown and duplicate site menu paths", () => {
    assert.throws(() => getSiteMenuLink("/unknown"), /Unknown site menu path/);

    const duplicateMenu: SiteMenuItem[] = [
      { href: "/duplicate", label: "A" },
      {
        href: "/parent",
        label: "Parent",
        children: [{ href: "/duplicate", label: "B" }],
      },
    ];

    assert.throws(
      () => flattenSiteMenuItems(duplicateMenu),
      /Duplicate site menu path/,
    );
  });
});

function getFrontmatterValue(source: string, key: string): string | undefined {
  const match = source.match(new RegExp(`^${key}: (.+)$`, "m"));

  return match?.[1];
}

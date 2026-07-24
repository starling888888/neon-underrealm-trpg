import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getIkizamaList } from "../../src/lib/data/ikizama";
import { getRyugiList } from "../../src/lib/data/ryugi-list";
import {
  getSiteMenuItemInitialExpanded,
  getSiteMenuItemState,
  type SiteMenuItem,
  siteMenuItems,
} from "../../src/lib/site/menu";

const menu: SiteMenuItem = {
  label: "データ",
  href: "/data",
  children: [
    {
      label: "アイテム",
      href: "/data/items",
      children: [
        {
          label: "武器",
          href: "/data/items/weapons",
        },
      ],
    },
  ],
};

describe("site menu current state", () => {
  it("places rules before data in the root menu", () => {
    const labels = siteMenuItems.map((item) => item.label);

    assert.ok(labels.indexOf("ルール") < labels.indexOf("データ"));
  });

  it("places the character sheet between advancement and support", () => {
    const labels = siteMenuItems.map((item) => item.label);
    const characterSheetIndex = labels.indexOf("キャラクターシート");

    assert.equal(labels[characterSheetIndex - 1], "キャラクター成長");
    assert.equal(labels[characterSheetIndex + 1], "サポート");
  });

  it("uses generated ryugi data for the ryugi detail menu items", () => {
    const dataMenu = siteMenuItems.find((item) => item.href === "/data");
    const ryugiMenu = dataMenu?.children?.find(
      (item) => item.href === "/data/ryugi",
    );

    assert.deepEqual(
      ryugiMenu?.children?.map(({ label, href }) => ({ label, href })),
      getRyugiList().map((ryugi) => ({
        label: ryugi.name,
        href: `/data/ryugi/${ryugi.id}`,
      })),
    );
  });

  it("uses generated ikizama data for the ikizama detail menu items", () => {
    const dataMenu = siteMenuItems.find((item) => item.href === "/data");
    const ikizamaMenu = dataMenu?.children?.find(
      (item) => item.href === "/data/ikizama",
    );

    assert.deepEqual(
      ikizamaMenu?.children?.map(({ label, href }) => ({ label, href })),
      getIkizamaList().map((ikizama) => ({
        label: ikizama.name,
        href: `/data/ikizama/${ikizama.id}`,
      })),
    );
  });

  it("keeps the data and ryugi menu ancestors expanded for ryugi detail pages", () => {
    const dataMenu = siteMenuItems.find((item) => item.href === "/data");
    const ryugiMenu = dataMenu?.children?.find(
      (item) => item.href === "/data/ryugi",
    );
    const detailPath = `/data/ryugi/${getRyugiList()[0]?.id ?? "kenkaya"}`;

    assert.equal(
      getSiteMenuItemState(dataMenu ?? menu, detailPath),
      "ancestor",
    );
    assert.equal(
      getSiteMenuItemState(ryugiMenu ?? menu, detailPath),
      "ancestor",
    );
    assert.equal(
      getSiteMenuItemInitialExpanded(dataMenu ?? menu, detailPath),
      true,
    );
    assert.equal(
      getSiteMenuItemInitialExpanded(ryugiMenu ?? menu, detailPath),
      true,
    );
  });

  it("marks exact matching menu items as current", () => {
    assert.equal(
      getSiteMenuItemState(
        menu.children?.[0]?.children?.[0] ?? menu,
        "/data/items/weapons",
      ),
      "current",
    );
  });

  it("marks parent items as ancestors of the current menu item", () => {
    assert.equal(getSiteMenuItemState(menu, "/data/items/weapons"), "ancestor");
    assert.equal(
      getSiteMenuItemState(menu.children?.[0] ?? menu, "/data/items/weapons"),
      "ancestor",
    );
  });

  it("uses the nearest menu item as ancestor for detail pages", () => {
    assert.equal(
      getSiteMenuItemState(
        menu.children?.[0]?.children?.[0] ?? menu,
        "/data/items/weapons/sample-id",
      ),
      "ancestor",
    );
  });

  it("does not mark root as ancestor for every page", () => {
    assert.equal(
      getSiteMenuItemState({ label: "トップ", href: "/" }, "/data/items"),
      "none",
    );
  });

  it("normalizes trailing slashes, query strings, hashes, and base paths", () => {
    assert.equal(
      getSiteMenuItemState(
        menu.children?.[0]?.children?.[0] ?? menu,
        "/neon-underrealm-trpg/data/items/weapons/?view=list#section",
        "/neon-underrealm-trpg/",
      ),
      "current",
    );
  });

  it("does not match sibling paths by prefix alone", () => {
    assert.equal(getSiteMenuItemState(menu, "/database"), "none");
  });
});

describe("site menu initial expansion", () => {
  it("does not expand the current parent item itself", () => {
    assert.equal(getSiteMenuItemInitialExpanded(menu, "/data"), false);
  });

  it("expands a current item when its configuration requests it", () => {
    assert.equal(
      getSiteMenuItemInitialExpanded(
        { ...menu, expandWhenCurrent: true },
        "/data",
      ),
      true,
    );
  });

  it("expands the configured category when its own page is current", () => {
    const expectedPaths = ["/rules", "/data", "/data/ikizama", "/data/items"];

    for (const expectedPath of expectedPaths) {
      const item = findSiteMenuItemByHref(siteMenuItems, expectedPath);

      assert.equal(item?.expandWhenCurrent, true, expectedPath);
      assert.equal(
        getSiteMenuItemInitialExpanded(item ?? menu, expectedPath),
        true,
        expectedPath,
      );
    }
  });

  it("expands parent items of the current child item", () => {
    assert.equal(getSiteMenuItemInitialExpanded(menu, "/data/items"), true);
  });

  it("expands all parent items leading to the current descendant item", () => {
    assert.equal(
      getSiteMenuItemInitialExpanded(menu, "/data/items/weapons"),
      true,
    );
    assert.equal(
      getSiteMenuItemInitialExpanded(
        menu.children?.[0] ?? menu,
        "/data/items/weapons",
      ),
      true,
    );
  });

  it("expands the nearest menu item for detail pages without direct links", () => {
    assert.equal(
      getSiteMenuItemInitialExpanded(
        menu.children?.[0]?.children?.[0] ?? menu,
        "/data/items/weapons/sample-id",
      ),
      true,
    );
  });

  it("does not expand unrelated parent items", () => {
    assert.equal(getSiteMenuItemInitialExpanded(menu, "/rules/battle"), false);
  });
});

function findSiteMenuItemByHref(
  items: readonly SiteMenuItem[],
  href: string,
): SiteMenuItem | undefined {
  for (const item of items) {
    if (item.href === href) {
      return item;
    }

    const child = item.children && findSiteMenuItemByHref(item.children, href);
    if (child) {
      return child;
    }
  }

  return undefined;
}

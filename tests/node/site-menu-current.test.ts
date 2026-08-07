import { describe, expect, it } from "vitest";
import { getIkizamaList } from "../../src/lib/data/ikizama";
import { getRyugiList } from "../../src/lib/data/ryugi-list";
import {
  getSiteMenuItemInitialExpanded,
  getSiteMenuItemState,
  isSiteMenuLinkItem,
  type SiteMenuItem,
  type SiteMenuLinkItem,
  siteMenuItems,
} from "../../src/lib/site/menu";

const menu: SiteMenuLinkItem = {
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
    const labels = siteMenuItems
      .filter(isSiteMenuLinkItem)
      .map((item) => item.label);

    expect(labels.indexOf("ルール") < labels.indexOf("データ")).toBeTruthy();
  });

  it("places the PL and GM sections in the requested root menu order", () => {
    const introductionIndex = siteMenuItems.findIndex(
      (item) => isSiteMenuLinkItem(item) && item.href === "/introduction",
    );
    const advancementIndex = siteMenuItems.findIndex(
      (item) => isSiteMenuLinkItem(item) && item.href === "/advancement",
    );

    expect(siteMenuItems[introductionIndex + 1]).toEqual({
      kind: "section",
      label: "PLセクション",
    });
    expect(siteMenuItems[advancementIndex + 1]).toEqual({
      kind: "section",
      label: "GMセクション",
    });
    expect(siteMenuItems[advancementIndex + 2]).toMatchObject({
      label: "GMガイド",
      href: "/gm",
    });
    expect(siteMenuItems[advancementIndex + 3]).toEqual({
      kind: "separator",
    });
    expect(siteMenuItems[advancementIndex + 4]).toMatchObject({
      label: "キャラクターシート",
      href: "/character-sheet",
    });
    expect(siteMenuItems[advancementIndex + 5]).toMatchObject({
      label: "サポート",
      href: "/support",
    });
  });

  it("uses generated ryugi data for the ryugi detail menu items", () => {
    const dataMenu = findSiteMenuItemByHref(siteMenuItems, "/data");
    const ryugiMenu = dataMenu?.children?.find(
      (item) => item.href === "/data/ryugi",
    );

    expect(
      ryugiMenu?.children?.map(({ label, href }) => ({ label, href })),
    ).toEqual(
      getRyugiList().map((ryugi) => ({
        label: ryugi.name,
        href: `/data/ryugi/${ryugi.id}`,
      })),
    );
  });

  it("uses generated ikizama data for the ikizama detail menu items", () => {
    const dataMenu = findSiteMenuItemByHref(siteMenuItems, "/data");
    const ikizamaMenu = dataMenu?.children?.find(
      (item) => item.href === "/data/ikizama",
    );

    expect(
      ikizamaMenu?.children?.map(({ label, href }) => ({ label, href })),
    ).toEqual(
      getIkizamaList().map((ikizama) => ({
        label: ikizama.name,
        href: `/data/ikizama/${ikizama.id}`,
      })),
    );
  });

  it("keeps the data and ryugi menu ancestors expanded for ryugi detail pages", () => {
    const dataMenu = findSiteMenuItemByHref(siteMenuItems, "/data");
    const ryugiMenu = dataMenu?.children?.find(
      (item) => item.href === "/data/ryugi",
    );
    const detailPath = `/data/ryugi/${getRyugiList()[0]?.id ?? "kenkaya"}`;

    expect(getSiteMenuItemState(dataMenu ?? menu, detailPath)).toBe("ancestor");
    expect(getSiteMenuItemState(ryugiMenu ?? menu, detailPath)).toBe(
      "ancestor",
    );
    expect(getSiteMenuItemInitialExpanded(dataMenu ?? menu, detailPath)).toBe(
      true,
    );
    expect(getSiteMenuItemInitialExpanded(ryugiMenu ?? menu, detailPath)).toBe(
      true,
    );
  });

  it("marks exact matching menu items as current", () => {
    expect(
      getSiteMenuItemState(
        menu.children?.[0]?.children?.[0] ?? menu,
        "/data/items/weapons",
      ),
    ).toBe("current");
  });

  it("marks parent items as ancestors of the current menu item", () => {
    expect(getSiteMenuItemState(menu, "/data/items/weapons")).toBe("ancestor");
    expect(
      getSiteMenuItemState(menu.children?.[0] ?? menu, "/data/items/weapons"),
    ).toBe("ancestor");
  });

  it("uses the nearest menu item as ancestor for detail pages", () => {
    expect(
      getSiteMenuItemState(
        menu.children?.[0]?.children?.[0] ?? menu,
        "/data/items/weapons/sample-id",
      ),
    ).toBe("ancestor");
  });

  it("does not mark root as ancestor for every page", () => {
    expect(
      getSiteMenuItemState({ label: "トップ", href: "/" }, "/data/items"),
    ).toBe("none");
  });

  it("normalizes trailing slashes, query strings, hashes, and base paths", () => {
    expect(
      getSiteMenuItemState(
        menu.children?.[0]?.children?.[0] ?? menu,
        "/neon-underrealm-trpg/data/items/weapons/?view=list#section",
        "/neon-underrealm-trpg/",
      ),
    ).toBe("current");
  });

  it("does not match sibling paths by prefix alone", () => {
    expect(getSiteMenuItemState(menu, "/database")).toBe("none");
  });
});

describe("site menu initial expansion", () => {
  it("does not expand the current parent item itself", () => {
    expect(getSiteMenuItemInitialExpanded(menu, "/data")).toBe(false);
  });

  it("expands a current item when its configuration requests it", () => {
    expect(
      getSiteMenuItemInitialExpanded(
        { ...menu, expandWhenCurrent: true },
        "/data",
      ),
    ).toBe(true);
  });

  it("expands the configured category when its own page is current", () => {
    const expectedPaths = ["/rules", "/data", "/data/ikizama", "/data/items"];

    for (const expectedPath of expectedPaths) {
      const item = findSiteMenuItemByHref(siteMenuItems, expectedPath);

      expect(item?.expandWhenCurrent, expectedPath).toBe(true);
      expect(
        getSiteMenuItemInitialExpanded(item ?? menu, expectedPath),
        expectedPath,
      ).toBe(true);
    }
  });

  it("expands parent items of the current child item", () => {
    expect(getSiteMenuItemInitialExpanded(menu, "/data/items")).toBe(true);
  });

  it("expands all parent items leading to the current descendant item", () => {
    expect(getSiteMenuItemInitialExpanded(menu, "/data/items/weapons")).toBe(
      true,
    );
    expect(
      getSiteMenuItemInitialExpanded(
        menu.children?.[0] ?? menu,
        "/data/items/weapons",
      ),
    ).toBe(true);
  });

  it("expands the nearest menu item for detail pages without direct links", () => {
    expect(
      getSiteMenuItemInitialExpanded(
        menu.children?.[0]?.children?.[0] ?? menu,
        "/data/items/weapons/sample-id",
      ),
    ).toBe(true);
  });

  it("does not expand unrelated parent items", () => {
    expect(getSiteMenuItemInitialExpanded(menu, "/rules/battle")).toBe(false);
  });
});

function findSiteMenuItemByHref(
  items: readonly SiteMenuItem[],
  href: string,
): SiteMenuLinkItem | undefined {
  for (const item of items) {
    if (!isSiteMenuLinkItem(item)) {
      continue;
    }

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

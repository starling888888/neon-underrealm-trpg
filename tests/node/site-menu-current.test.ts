import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getSiteMenuItemInitialExpanded,
  getSiteMenuItemState,
  type SiteMenuItem,
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

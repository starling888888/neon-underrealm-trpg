import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
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

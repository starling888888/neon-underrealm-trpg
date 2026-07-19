import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getSearchTypeLabel } from "../../src/lib/search/page-metadata";

describe("search page metadata", () => {
  it("classifies known routes without coupling them to the layout", () => {
    assert.equal(getSearchTypeLabel("/"), "トップ");
    assert.equal(getSearchTypeLabel("/data/common-skills/"), "データ");
    assert.equal(getSearchTypeLabel("/rules/battle/"), "ルール");
    assert.equal(getSearchTypeLabel("/advancement/"), "ルール");
    assert.equal(getSearchTypeLabel("/character-making/"), "ルール");
    assert.equal(getSearchTypeLabel("/release-notes/"), "更新履歴");
    assert.equal(getSearchTypeLabel("/world/"), "ワールド");
    assert.equal(getSearchTypeLabel("/mdx-test/"), "本文");
  });

  it("removes the deployment base path before classifying a route", () => {
    assert.equal(
      getSearchTypeLabel(
        "/neon-underrealm-trpg/data/common-skills/",
        "/neon-underrealm-trpg/",
      ),
      "データ",
    );
  });
});

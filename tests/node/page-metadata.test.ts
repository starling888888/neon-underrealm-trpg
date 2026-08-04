import { describe, expect, it } from "vitest";
import { getSearchTypeLabel } from "../../src/lib/search/page-metadata";

describe("search page metadata", () => {
  it("classifies known routes without coupling them to the layout", () => {
    expect(getSearchTypeLabel("/")).toBe("トップ");
    expect(getSearchTypeLabel("/data/common-skills/")).toBe("データ");
    expect(getSearchTypeLabel("/rules/battle/")).toBe("ルール");
    expect(getSearchTypeLabel("/advancement/")).toBe("ルール");
    expect(getSearchTypeLabel("/character-making/")).toBe("ルール");
    expect(getSearchTypeLabel("/release-notes/")).toBe("更新履歴");
    expect(getSearchTypeLabel("/world/")).toBe("ワールド");
    expect(getSearchTypeLabel("/mdx-test/")).toBe("本文");
  });

  it("removes the deployment base path before classifying a route", () => {
    expect(
      getSearchTypeLabel(
        "/neon-underrealm-trpg/data/common-skills/",
        "/neon-underrealm-trpg/",
      ),
    ).toBe("データ");
  });
});

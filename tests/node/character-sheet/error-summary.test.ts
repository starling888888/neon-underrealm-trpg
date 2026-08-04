import { describe, expect, it } from "vitest";

import {
  getCharacterSheetErrorSummary,
  translateCharacterSheetError,
} from "../../../src/character-sheet/logic/error-summary";

describe("character sheet error summary", () => {
  it("does not create an entry for local warnings or valid values", () => {
    expect(getCharacterSheetErrorSummary({ facts: [] })).toEqual({
      errors: [],
      hasErrors: false,
    });
  });

  it("uses stable rule and row order for named, row-level errors", () => {
    const summary = getCharacterSheetErrorSummary({
      facts: [
        {
          code: "drugs-duplicate",
          rowId: "drug-2",
          subject: "ドラッグ「ターボ」",
        },
        {
          code: "primary-skill-maximum-level",
          level: 3,
          rowId: "primary-2",
          subject: "プライマリ流儀スキル「ブレード」",
        },
        {
          code: "experience",
        },
        {
          code: "primary-skill-maximum-level",
          level: 2,
          rowId: "primary-1",
          subject: "プライマリ流儀スキル「クロス」",
        },
      ],
    });

    expect(summary.hasErrors).toBe(true);
    expect(summary.errors.map((error) => error.code)).toEqual([
      "experience",
      "primary-skill-maximum-level",
      "primary-skill-maximum-level",
      "drugs-duplicate",
    ]);
    expect(summary.errors[1]?.message).toBe(
      "プライマリ流儀スキル「ブレード」（Lv 3）：取得可能レベル外の値があります。",
    );
    expect(summary.errors[2]?.rowId).toBe("primary-1");
  });

  it("translates one primary and other ryugi conflict as one named fact", () => {
    const fact = {
      code: "ryugi-duplicate" as const,
      rowId: "other-1",
      subject: "プライマリ流儀「義賊」とその他流儀「義賊」",
    };
    const summary = getCharacterSheetErrorSummary({ facts: [fact] });

    expect(summary.errors.length).toBe(1);
    expect(summary.errors[0]?.message).toBe(translateCharacterSheetError(fact));
  });

  it("uses an explicit rule condition instead of a skill-row level", () => {
    expect(
      translateCharacterSheetError({
        code: "primary-skill-advanced",
        condition: "流儀Lv 6以上が必要です（現在Lv 1）。",
        level: 4,
        subject: "プライマリ流儀スキル「ブレード」",
      }),
    ).toBe(
      "プライマリ流儀スキル「ブレード」：流儀Lv 6以上が必要です（現在Lv 1）。",
    );
  });
});

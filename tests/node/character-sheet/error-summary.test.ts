import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getCharacterSheetErrorSummary,
  translateCharacterSheetError,
} from "../../../src/character-sheet/logic/error-summary";

describe("character sheet error summary", () => {
  it("does not create an entry for local warnings or valid values", () => {
    assert.deepEqual(getCharacterSheetErrorSummary({ facts: [] }), {
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

    assert.equal(summary.hasErrors, true);
    assert.deepEqual(
      summary.errors.map((error) => error.code),
      [
        "experience",
        "primary-skill-maximum-level",
        "primary-skill-maximum-level",
        "drugs-duplicate",
      ],
    );
    assert.equal(
      summary.errors[1]?.message,
      "プライマリ流儀スキル「ブレード」（Lv 3）：取得可能レベル外の値があります。",
    );
    assert.equal(summary.errors[2]?.rowId, "primary-1");
  });

  it("translates one primary and other ryugi conflict as one named fact", () => {
    const fact = {
      code: "ryugi-duplicate" as const,
      rowId: "other-1",
      subject: "プライマリ流儀「義賊」とその他流儀「義賊」",
    };
    const summary = getCharacterSheetErrorSummary({ facts: [fact] });

    assert.equal(summary.errors.length, 1);
    assert.equal(
      summary.errors[0]?.message,
      translateCharacterSheetError(fact),
    );
  });
});

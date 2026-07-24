import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { characterSheetDefaultValues } from "../../../../src/character-sheet/form-values";
import {
  characterSheetFormSchema,
  normalizeCreditInput,
} from "../../../../src/character-sheet/schemas/character-sheet-form";

describe("character sheet form schema", () => {
  it("accepts the non-null defaults", () => {
    assert.deepEqual(
      characterSheetFormSchema.parse(characterSheetDefaultValues),
      characterSheetDefaultValues,
    );
  });

  it("rejects null profile values and invalid stored credit values", () => {
    assert.equal(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        profile: null,
      }).success,
      false,
    );
    assert.equal(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        credit: {
          ...characterSheetDefaultValues.credit,
          acquired: -1,
        },
      }).success,
      false,
    );
    assert.equal(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        credit: {
          ...characterSheetDefaultValues.credit,
          changeAdjustment: 1.5,
        },
      }).success,
      false,
    );
  });

  it("normalizes browser inputs through their field schemas", () => {
    const cases = [
      { field: "acquired" as const, input: "", expected: 0 },
      { field: "provided" as const, input: "invalid", expected: 0 },
      { field: "received" as const, input: -3, expected: 0 },
      { field: "acquired" as const, input: 7.9, expected: 7 },
      { field: "changeAdjustment" as const, input: -3.9, expected: -3 },
    ];

    for (const { expected, field, input } of cases) {
      assert.equal(normalizeCreditInput(field, input), expected);
    }
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { characterSheetDefaultValues } from "../../../../src/character-sheet/form-values";
import {
  characterSheetFormSchema,
  normalizeCreditInput,
  normalizeIntegerInput,
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

  it("requires one to five attack rows and a stable ID for each reaction row", () => {
    assert.equal(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        checks: {
          ...characterSheetDefaultValues.checks,
          attacks: [],
        },
      }).success,
      false,
    );
    assert.equal(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        checks: {
          ...characterSheetDefaultValues.checks,
          attacks: Array.from({ length: 6 }, (_, index) => ({
            ...characterSheetDefaultValues.checks.attacks[0],
            rowId: `attack-${index + 1}`,
          })),
        },
      }).success,
      false,
    );
    assert.equal(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        checks: {
          ...characterSheetDefaultValues.checks,
          reactions: characterSheetDefaultValues.checks.reactions.map(
            (row) => ({
              ...row,
              name: "defense",
            }),
          ),
        },
      }).success,
      true,
    );
    assert.equal(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        checks: {
          ...characterSheetDefaultValues.checks,
          reactions: characterSheetDefaultValues.checks.reactions.map(
            ({ rowId: _rowId, ...row }) => row,
          ),
        },
      }).success,
      false,
    );
  });

  it("allows zero ikizama rows while retaining the primary minimum row", () => {
    assert.equal(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        ikizamaSkills: {
          ...characterSheetDefaultValues.ikizamaSkills,
          rows: [],
        },
      }).success,
      true,
    );
    assert.equal(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        primarySkills: { rows: [] },
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

  it("normalizes shared integer inputs without applying field constraints", () => {
    assert.equal(normalizeIntegerInput(""), 0);
    assert.equal(normalizeIntegerInput("-3.8"), -3);
    assert.equal(normalizeIntegerInput("invalid"), 0);
  });
});

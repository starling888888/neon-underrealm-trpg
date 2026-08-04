import { describe, expect, it } from "vitest";

import { characterSheetDefaultValues } from "../../../../src/character-sheet/form-values";
import {
  characterSheetFormSchema,
  normalizeCreditInput,
  normalizeIntegerInput,
  normalizeOptionalIntegerInput,
} from "../../../../src/character-sheet/schemas/character-sheet-form";

describe("character sheet form schema", () => {
  it("accepts the non-null defaults", () => {
    expect(characterSheetFormSchema.parse(characterSheetDefaultValues)).toEqual(
      characterSheetDefaultValues,
    );
  });

  it("rejects null profile values and invalid stored credit values", () => {
    expect(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        profile: null,
      }).success,
    ).toBe(false);
    expect(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        credit: {
          ...characterSheetDefaultValues.credit,
          acquired: -1,
        },
      }).success,
    ).toBe(false);
    expect(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        credit: {
          ...characterSheetDefaultValues.credit,
          changeAdjustment: 1.5,
        },
      }).success,
    ).toBe(false);
  });

  it("requires one to five attack rows and a stable reaction identity", () => {
    expect(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        checks: {
          ...characterSheetDefaultValues.checks,
          attacks: [],
        },
      }).success,
    ).toBe(false);
    expect(
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
    ).toBe(false);
    expect(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        checks: {
          ...characterSheetDefaultValues.checks,
          reactions: characterSheetDefaultValues.checks.reactions.map(
            (row) => ({ ...row, name: "defense" }),
          ),
        },
      }).success,
    ).toBe(false);
    expect(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        checks: {
          ...characterSheetDefaultValues.checks,
          reactions: characterSheetDefaultValues.checks.reactions.map(
            ({ rowId: _rowId, ...row }) => row,
          ),
        },
      }).success,
    ).toBe(false);
  });

  it("rejects empty or duplicate row IDs in every field array", () => {
    const defaultAttack = characterSheetDefaultValues.checks.attacks[0];
    const defaultBond = characterSheetDefaultValues.bonds.rows[0];
    const defaultCommonSkill = characterSheetDefaultValues.commonSkills.rows[0];
    const defaultPrimarySkill =
      characterSheetDefaultValues.primarySkills.rows[0];
    if (
      defaultAttack === undefined ||
      defaultBond === undefined ||
      defaultCommonSkill === undefined ||
      defaultPrimarySkill === undefined
    ) {
      throw new Error("初期field array rowがありません。");
    }

    const invalidValues = [
      {
        ...characterSheetDefaultValues,
        bonds: {
          ...characterSheetDefaultValues.bonds,
          rows: [{ ...defaultBond, rowId: "" }],
        },
      },
      {
        ...characterSheetDefaultValues,
        build: {
          ...characterSheetDefaultValues.build,
          otherRyugi: [
            { level: 1, rowId: "duplicate", ryugiId: null },
            { level: 1, rowId: "duplicate", ryugiId: null },
          ],
        },
      },
      {
        ...characterSheetDefaultValues,
        checks: {
          ...characterSheetDefaultValues.checks,
          attacks: [
            { ...defaultAttack, rowId: "duplicate" },
            { ...defaultAttack, rowId: "duplicate" },
          ],
        },
      },
      {
        ...characterSheetDefaultValues,
        commonSkills: { rows: [{ ...defaultCommonSkill, rowId: "" }] },
      },
      {
        ...characterSheetDefaultValues,
        ikizamaSkills: {
          ...characterSheetDefaultValues.ikizamaSkills,
          rows: [{ level: 1, rowId: "", skillId: null }],
        },
      },
      {
        ...characterSheetDefaultValues,
        omamori: {
          rows: [{ omamoriId: null, rowId: "" }],
        },
      },
      {
        ...characterSheetDefaultValues,
        omamori: {
          rows: [
            { omamoriId: null, rowId: "duplicate" },
            { omamoriId: null, rowId: "duplicate" },
          ],
        },
      },
      {
        ...characterSheetDefaultValues,
        otherRyugiSkills: {
          rows: [
            {
              level: 1,
              rowId: "duplicate",
              ryugiRowId: "owner",
              skillId: null,
            },
            {
              level: 1,
              rowId: "duplicate",
              ryugiRowId: "owner",
              skillId: null,
            },
          ],
        },
      },
      {
        ...characterSheetDefaultValues,
        primarySkills: { rows: [{ ...defaultPrimarySkill, rowId: "" }] },
      },
    ];

    for (const values of invalidValues) {
      expect(characterSheetFormSchema.safeParse(values).success).toBe(false);
    }
  });

  it("requires every reaction name once and the matching deterministic row ID", () => {
    expect(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        checks: {
          ...characterSheetDefaultValues.checks,
          reactions: [
            ...characterSheetDefaultValues.checks.reactions.slice(1),
            characterSheetDefaultValues.checks.reactions[0],
          ],
        },
      }).success,
    ).toBe(true);
    expect(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        checks: {
          ...characterSheetDefaultValues.checks,
          reactions: characterSheetDefaultValues.checks.reactions.map(
            (row) => ({ ...row, rowId: "reaction-defense" }),
          ),
        },
      }).success,
    ).toBe(false);
  });

  it("allows zero ikizama rows while retaining the primary minimum row", () => {
    expect(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        ikizamaSkills: {
          ...characterSheetDefaultValues.ikizamaSkills,
          rows: [],
        },
      }).success,
    ).toBe(true);
    expect(
      characterSheetFormSchema.safeParse({
        ...characterSheetDefaultValues,
        primarySkills: { rows: [] },
      }).success,
    ).toBe(false);
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
      expect(normalizeCreditInput(field, input)).toBe(expected);
    }
  });

  it("normalizes shared integer inputs without applying field constraints", () => {
    expect(normalizeIntegerInput("")).toBe(0);
    expect(normalizeIntegerInput("-3.8")).toBe(-3);
    expect(normalizeIntegerInput("invalid")).toBe(0);
  });

  it("preserves an empty item modifier while normalizing explicit values", () => {
    expect(normalizeOptionalIntegerInput("")).toBe(null);
    expect(normalizeOptionalIntegerInput("-3.8")).toBe(-3);
  });
});

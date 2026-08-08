import { describe, expect, it } from "vitest";

import { characterSheetDefaultValues } from "../../../src/character-sheet/form/values";
import { getDuplicateDrugRowIds } from "../../../src/character-sheet/logic/drugs";
import {
  getDrugById,
  getDrugs,
} from "../../../src/character-sheet/master-data/drugs";
import {
  characterSheetFormSchema,
  normalizeIntegerInput,
} from "../../../src/character-sheet/schemas/character-sheet-form";
import { getItemsData } from "../../../src/lib/data/items";

describe("character sheet drugs", () => {
  it("normalizes decimal and empty browser values before drug quantity clamps negatives", () => {
    expect(normalizeIntegerInput("4.8")).toBe(4);
    expect(normalizeIntegerInput("")).toBe(0);
    expect(normalizeIntegerInput("-2")).toBe(-2);
  });

  it("keeps generated-data order and resolves only known IDs", () => {
    const drugs = getDrugs();
    const first = drugs[0];
    if (first === undefined)
      throw new Error("ドラッグmaster dataがありません。");

    expect(drugs.map((drug) => drug.id)).toEqual(
      getItemsData().drugs.map((drug) => drug.id),
    );
    expect(getDrugById(first.id)?.id).toBe(first.id);
    expect(getDrugById(null)).toBe(null);
    expect(getDrugById("unknown-drug")).toBe(null);
  });

  it("marks every duplicated drug row and keeps empty rows valid", () => {
    expect([
      ...getDuplicateDrugRowIds([
        { drugId: null, rowId: "a" },
        { drugId: null, rowId: "b" },
      ]),
    ]).toEqual([]);
    expect(
      [
        ...getDuplicateDrugRowIds([
          { drugId: "drug-a", rowId: "a" },
          { drugId: "drug-b", rowId: "b" },
          { drugId: "drug-a", rowId: "c" },
        ]),
      ].sort(),
    ).toEqual(["a", "c"]);
  });

  it("rejects duplicate drug IDs through the form schema", () => {
    const [firstDrug] = getDrugs();
    if (firstDrug === undefined)
      throw new Error("ドラッグmaster dataがありません。");
    const values = structuredClone(characterSheetDefaultValues);
    const [firstRow, secondRow] = values.drugs.rows;
    if (firstRow === undefined || secondRow === undefined) {
      throw new Error("ドラッグ初期行がありません。");
    }
    firstRow.drugId = firstDrug.id;
    secondRow.drugId = firstDrug.id;

    const result = characterSheetFormSchema.safeParse(values);

    expect(result.success).toBe(false);
    if (result.success) return;
    expect(
      result.error.issues
        .filter((issue) => issue.path.at(-1) === "drugId")
        .map((issue) => issue.path),
    ).toEqual([
      ["drugs", "rows", 0, "drugId"],
      ["drugs", "rows", 1, "drugId"],
    ]);
  });
});

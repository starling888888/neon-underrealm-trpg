import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import { getDuplicateDrugRowIds } from "../../../src/character-sheet/logic/drugs";
import {
  getDrugById,
  getDrugs,
} from "../../../src/character-sheet/master-data/drugs";
import { characterSheetFormSchema } from "../../../src/character-sheet/schemas/character-sheet-form";
import { getItemsData } from "../../../src/lib/data/items";

describe("character sheet drugs", () => {
  it("keeps generated-data order and resolves only known IDs", () => {
    const drugs = getDrugs();
    const first = drugs[0];
    if (first === undefined)
      throw new Error("ドラッグmaster dataがありません。");

    assert.deepEqual(
      drugs.map((drug) => drug.id),
      getItemsData().drugs.map((drug) => drug.id),
    );
    assert.equal(getDrugById(first.id)?.id, first.id);
    assert.equal(getDrugById(null), null);
    assert.equal(getDrugById("unknown-drug"), null);
  });

  it("marks every duplicated drug row and keeps empty rows valid", () => {
    assert.deepEqual(
      [
        ...getDuplicateDrugRowIds([
          { drugId: null, rowId: "a" },
          { drugId: null, rowId: "b" },
        ]),
      ],
      [],
    );
    assert.deepEqual(
      [
        ...getDuplicateDrugRowIds([
          { drugId: "drug-a", rowId: "a" },
          { drugId: "drug-b", rowId: "b" },
          { drugId: "drug-a", rowId: "c" },
        ]),
      ].sort(),
      ["a", "c"],
    );
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

    assert.equal(result.success, false);
    if (result.success) return;
    assert.deepEqual(
      result.error.issues
        .filter((issue) => issue.path.at(-1) === "drugId")
        .map((issue) => issue.path),
      [
        ["drugs", "rows", 0, "drugId"],
        ["drugs", "rows", 1, "drugId"],
      ],
    );
  });
});

import assert from "node:assert/strict";
import { describe, it } from "vitest";

import {
  calculateSpecialItemCredit,
  getMaximumNanomachineMentalCost,
  getVisibleSpecialItemCategories,
  updateCategoriesForIkizamaChange,
} from "../../../src/character-sheet/logic/special-items";

describe("character sheet special items", () => {
  it("keeps the ikizama category first and preserves additional order", () => {
    assert.deepEqual(
      getVisibleSpecialItemCategories("nanomachines", ["drugs", "omamori"]),
      ["nanomachines", "drugs", "omamori"],
    );
    assert.deepEqual(getVisibleSpecialItemCategories(null, ["drugs"]), [
      "drugs",
    ]);
  });

  it("moves the former exclusive category to the front of additions", () => {
    assert.deepEqual(
      updateCategoriesForIkizamaChange(
        ["drugs", "cybernetics"],
        "nanomachines",
        "cybernetics",
      ),
      ["nanomachines", "drugs"],
    );
  });

  it("sums every selected item and multiplies drug credit by quantity", () => {
    assert.equal(
      calculateSpecialItemCredit({
        armorCredit: 1,
        cybernetics: [2, null],
        drugs: [{ credit: 3, quantity: 2 }],
        nanomachines: [4],
        omamori: [5],
        weapons: [6, null],
      }),
      24,
    );
  });

  it("uses zero for no nanomachine and otherwise its maximum mental cost", () => {
    assert.equal(getMaximumNanomachineMentalCost([]), 0);
    assert.equal(getMaximumNanomachineMentalCost([2, null, 5, 4]), 5);
  });
});

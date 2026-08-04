import { describe, expect, it } from "vitest";

import {
  calculateSpecialItemCredit,
  getMaximumNanomachineMentalCost,
  getVisibleSpecialItemCategories,
  updateCategoriesForIkizamaChange,
} from "../../../src/character-sheet/logic/special-items";

describe("character sheet special items", () => {
  it("keeps the ikizama category first and preserves additional order", () => {
    expect(
      getVisibleSpecialItemCategories("nanomachines", ["drugs", "omamori"]),
    ).toEqual(["nanomachines", "drugs", "omamori"]);
    expect(getVisibleSpecialItemCategories(null, ["drugs"])).toEqual(["drugs"]);
  });

  it("moves the former exclusive category to the front of additions", () => {
    expect(
      updateCategoriesForIkizamaChange(
        ["drugs", "cybernetics"],
        "nanomachines",
        "cybernetics",
      ),
    ).toEqual(["nanomachines", "drugs"]);
  });

  it("sums every selected item and multiplies drug credit by quantity", () => {
    expect(
      calculateSpecialItemCredit({
        armorCredit: 1,
        cybernetics: [2, null],
        drugs: [{ credit: 3, quantity: 2 }],
        nanomachines: [4],
        omamori: [5],
        weapons: [6, null],
      }),
    ).toBe(24);
  });

  it("uses zero for no nanomachine and otherwise its maximum mental cost", () => {
    expect(getMaximumNanomachineMentalCost([])).toBe(0);
    expect(getMaximumNanomachineMentalCost([2, null, 5, 4])).toBe(5);
  });
});

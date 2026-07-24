import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateCredit } from "../../../src/character-sheet/logic/credit";

describe("character sheet credit", () => {
  it("calculates total credit and change", () => {
    assert.deepEqual(
      calculateCredit({
        acquiredCredit: 10,
        creditProvided: 3,
        creditReceived: 5,
        changeAdjustment: -2,
        spentCredit: 0,
      }),
      {
        totalCredit: 12,
        change: 10,
      },
    );
  });
});

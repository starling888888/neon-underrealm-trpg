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
        hasCreditError: false,
        totalCredit: 12,
        change: 10,
      },
    );
  });

  it("keeps a credit overage error independent from the change adjustment", () => {
    assert.equal(
      calculateCredit({
        acquiredCredit: 10,
        creditProvided: 0,
        creditReceived: 0,
        changeAdjustment: 5,
        spentCredit: 12,
      }).hasCreditError,
      true,
    );
    assert.equal(
      calculateCredit({
        acquiredCredit: 10,
        creditProvided: 0,
        creditReceived: 0,
        changeAdjustment: -10,
        spentCredit: 5,
      }).hasCreditError,
      false,
    );
  });
});

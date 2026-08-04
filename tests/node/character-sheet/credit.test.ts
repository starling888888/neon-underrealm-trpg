import { describe, expect, it } from "vitest";
import { calculateCredit } from "../../../src/character-sheet/logic/credit";

describe("character sheet credit", () => {
  it("calculates total credit and change", () => {
    expect(
      calculateCredit({
        acquiredCredit: 10,
        creditProvided: 3,
        creditReceived: 5,
        changeAdjustment: -2,
        spentCredit: 0,
      }),
    ).toEqual({
      hasCreditError: false,
      totalCredit: 12,
      change: 10,
    });
  });

  it("keeps a credit overage error independent from the change adjustment", () => {
    expect(
      calculateCredit({
        acquiredCredit: 10,
        creditProvided: 0,
        creditReceived: 0,
        changeAdjustment: 5,
        spentCredit: 12,
      }).hasCreditError,
    ).toBe(true);
    expect(
      calculateCredit({
        acquiredCredit: 10,
        creditProvided: 0,
        creditReceived: 0,
        changeAdjustment: -10,
        spentCredit: 5,
      }).hasCreditError,
    ).toBe(false);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import {
  calculateCredit,
  normalizeCreditInput,
} from "../../../src/character-sheet/logic/credit";

describe("character sheet credit", () => {
  it("groups non-null defaults by profile and credit", () => {
    assert.deepEqual(characterSheetDefaultValues, {
      credit: {
        acquired: 10,
        changeAdjustment: 0,
        provided: 0,
        received: 0,
      },
      profile: {
        age: "",
        gender: "",
        nickname: "",
        pcName: "",
        playerName: "",
        setting: "",
      },
    });
  });

  it("normalizes empty and invalid credit controls to zero", () => {
    assert.equal(normalizeCreditInput("", false), 0);
    assert.equal(normalizeCreditInput("invalid", false), 0);
    assert.equal(normalizeCreditInput(-3, false), 0);
    assert.equal(normalizeCreditInput(7.9, false), 7);
    assert.equal(normalizeCreditInput(-3.9, true), -3);
  });

  it("calculates total credit and change from normalized credit values", () => {
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

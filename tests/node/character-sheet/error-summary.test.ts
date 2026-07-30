import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  getCharacterSheetErrorSummary,
  translateCharacterSheetError,
} from "../../../src/character-sheet/logic/error-summary";

const noErrors = {
  bonds: { hasOverLimitError: false },
  build: {
    hasExperienceError: false,
    hasGrowthError: false,
    hasPointAllocationError: false,
    ikizamaLevelInvalid: false,
    otherRyugiDuplicateRowIds: [],
    otherRyugiLevelInvalidRowIds: [],
    primaryRyugiDuplicate: false,
    primaryRyugiLevelInvalid: false,
  },
  commonSkills: {
    hasDuplicateError: false,
    hasLevelError: false,
    hasMaximumLevelError: false,
  },
  credit: { hasCreditError: false },
  cybernetics: { hasImplantLimitError: false, hasPartError: false },
  drugs: { hasDuplicateError: false },
  ikizamaSkills: {
    hasAdvancedError: false,
    hasDuplicateError: false,
    hasLevelError: false,
    hasMaximumLevelError: false,
  },
  nanomachines: { hasImplantLimitError: false },
  otherRyugiSkills: {
    hasAdvancedError: false,
    hasDuplicateError: false,
    hasLevelError: false,
    hasMaximumLevelError: false,
  },
  primarySkills: {
    hasAdvancedError: false,
    hasDuplicateError: false,
    hasLevelError: false,
    hasMaximumLevelError: false,
  },
};

describe("character sheet error summary", () => {
  it("does not create an entry for local warnings or valid values", () => {
    assert.deepEqual(getCharacterSheetErrorSummary(noErrors), {
      errors: [],
      hasErrors: false,
    });
  });

  it("uses stable codes, order, and translated messages for local game-rule errors", () => {
    const summary = getCharacterSheetErrorSummary({
      ...noErrors,
      build: {
        ...noErrors.build,
        hasExperienceError: true,
        hasPointAllocationError: true,
      },
      bonds: { hasOverLimitError: true },
      cybernetics: { hasImplantLimitError: true, hasPartError: true },
      primarySkills: {
        ...noErrors.primarySkills,
        hasDuplicateError: true,
        hasMaximumLevelError: true,
      },
    });

    assert.equal(summary.hasErrors, true);
    assert.deepEqual(
      summary.errors.map((error) => error.code),
      [
        "experience",
        "attribute-points",
        "bonds-over-limit",
        "primary-skill-maximum-level",
        "primary-skill-duplicate",
        "cybernetics-part",
        "cybernetics-implant-limit",
      ],
    );
    assert.equal(
      summary.errors[0]?.message,
      translateCharacterSheetError("experience"),
    );
  });
});

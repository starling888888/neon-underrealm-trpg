import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import { calculateBuild } from "../../../src/character-sheet/logic/build";

function selectedBuild() {
  return {
    ...characterSheetDefaultValues.build,
    attributes: {
      agility: {
        ...characterSheetDefaultValues.build.attributes.agility,
        points: 4,
      },
      body: {
        ...characterSheetDefaultValues.build.attributes.body,
        points: 2,
      },
      mind: {
        ...characterSheetDefaultValues.build.attributes.mind,
        points: 0,
      },
      perception: {
        ...characterSheetDefaultValues.build.attributes.perception,
        points: 3,
      },
      strength: {
        ...characterSheetDefaultValues.build.attributes.strength,
        points: 5,
      },
    },
    ikizamaId: "burai",
    primaryRyugiId: "kenkaya",
  };
}

describe("character sheet build", () => {
  it("keeps only master-dependent values unavailable until selections exist", () => {
    const derived = calculateBuild(characterSheetDefaultValues.build);

    assert.equal(derived.rank, 2);
    assert.equal(derived.growthPoints, 0);
    assert.equal(derived.spentExperience, 0);
    assert.equal(derived.remainingExperience, 50);
    assert.equal(derived.attributes.strength.permanent, null);
    assert.equal(derived.ikizamaAttributePoints, null);
    assert.equal(derived.reference.primaryHealthIncrease, null);
    assert.equal(derived.hasAttributeError, false);
  });

  it("adds common-skill levels to experience without changing build validation", () => {
    const derived = calculateBuild(characterSheetDefaultValues.build, 2);

    assert.equal(derived.spentExperience, 10);
    assert.equal(derived.remainingExperience, 40);
    assert.equal(derived.hasBuildError, false);
  });

  it("reports growth overages before master data is selected", () => {
    const build = {
      ...characterSheetDefaultValues.build,
      attributes: {
        ...characterSheetDefaultValues.build.attributes,
        strength: {
          ...characterSheetDefaultValues.build.attributes.strength,
          growth: 1,
        },
      },
    };

    const derived = calculateBuild(build);

    assert.equal(derived.growthPoints, 0);
    assert.equal(derived.hasGrowthError, true);
    assert.equal(derived.hasAttributeError, true);
    assert.equal(derived.hasBuildError, true);
  });

  it("derives independent primary and ikizama values before both are selected", () => {
    const primaryOnly = {
      ...characterSheetDefaultValues.build,
      primaryRyugiId: "kenkaya",
    };
    const primaryDerived = calculateBuild(primaryOnly);

    assert.equal(primaryDerived.attributes.strength.base, 5);
    assert.equal(primaryDerived.attributes.strength.permanent, null);
    assert.equal(primaryDerived.reference.primaryHealthIncrease, 5);
    assert.equal(
      primaryDerived.reference.commonSkillBonuses?.level2,
      "攻撃判定数+1\n攻撃力+3",
    );
    assert.equal(primaryDerived.ikizamaAttributePoints, null);

    const ikizamaOnly = {
      ...characterSheetDefaultValues.build,
      ikizamaId: "burai",
    };
    const ikizamaDerived = calculateBuild(ikizamaOnly);

    assert.deepEqual(ikizamaDerived.ikizamaAttributePoints, [5, 4, 3, 2]);
    assert.equal(ikizamaDerived.reference.ikizamaHealthCoefficient, 11);
    assert.equal(ikizamaDerived.attributes.strength.base, null);
  });

  it("derives rank, experience, and attributes from selected data", () => {
    const derived = calculateBuild(selectedBuild());

    assert.equal(derived.rank, 2);
    assert.equal(derived.growthPoints, 0);
    assert.equal(derived.spentExperience, 0);
    assert.equal(derived.remainingExperience, 50);
    assert.deepEqual(derived.ikizamaAttributePoints, [5, 4, 3, 2]);
    assert.deepEqual(derived.reference, {
      commonSkillBonuses: {
        level2: "攻撃判定数+1\n攻撃力+3",
        level5: "行動回数+1",
        level9: "攻撃判定数+1\nリアクション判定数+1",
      },
      ikizamaHealthCoefficient: 11,
      ikizamaMindCoefficient: 7,
      primaryHealthIncrease: 5,
      primaryMindIncrease: 2,
    });
    assert.equal(derived.attributes.strength.base, 5);
    assert.equal(derived.attributes.strength.permanent, 10);
    assert.equal(derived.attributes.strength.temporary, 10);
    assert.equal(derived.hasBuildError, false);
  });

  it("preserves mismatches and over-budget values as local error states", () => {
    const build = selectedBuild();
    build.attributes.strength.points = 4;
    build.acquiredExperience = 0;
    build.primaryRyugiLevel = 2;

    const derived = calculateBuild(build);

    assert.equal(derived.hasAttributeError, true);
    assert.equal(derived.hasExperienceError, true);
    assert.equal(derived.hasBuildError, true);
  });

  it("keeps point allocation and growth errors local to their own inputs", () => {
    const pointMismatch = selectedBuild();
    pointMismatch.attributes.strength.points = 4;

    const pointDerived = calculateBuild(pointMismatch);

    assert.equal(pointDerived.hasPointAllocationError, true);
    assert.equal(pointDerived.hasGrowthError, false);

    const excessGrowth = selectedBuild();
    excessGrowth.attributes.strength.growth = 1;

    const growthDerived = calculateBuild(excessGrowth);

    assert.equal(growthDerived.hasPointAllocationError, false);
    assert.equal(growthDerived.hasGrowthError, true);
  });

  it("keeps an invalid acquired experience value visible before both selections", () => {
    const build = {
      ...characterSheetDefaultValues.build,
      acquiredExperience: -1,
    };

    const derived = calculateBuild(build);

    assert.equal(derived.hasExperienceError, true);
    assert.equal(derived.hasBuildError, true);
    assert.equal(derived.remainingExperience, -1);
  });

  it("locates duplicate ryugi selections separately from level errors", () => {
    const build = {
      ...selectedBuild(),
      otherRyugi: [
        { level: 1, rowId: "first", ryugiId: "kenkaya" },
        { level: -1, rowId: "second", ryugiId: "emono" },
        { level: 1, rowId: "third", ryugiId: "emono" },
      ],
    };

    const derived = calculateBuild(build);

    assert.equal(derived.primaryRyugiDuplicate, true);
    assert.deepEqual(derived.otherRyugiDuplicateRowIds, [
      "first",
      "second",
      "third",
    ]);
    assert.deepEqual(derived.otherRyugiLevelInvalidRowIds, ["second"]);
  });
});

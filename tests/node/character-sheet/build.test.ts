import { describe, expect, it } from "vitest";

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

    expect(derived.rank).toBe(2);
    expect(derived.growthPoints).toBe(0);
    expect(derived.spentExperience).toBe(0);
    expect(derived.remainingExperience).toBe(50);
    expect(derived.attributes.strength.permanent).toBe(null);
    expect(derived.ikizamaAttributePoints).toBe(null);
    expect(derived.reference.primaryHealthIncrease).toBe(null);
    expect(derived.hasAttributeError).toBe(false);
  });

  it("adds common-skill levels to experience without changing build validation", () => {
    const derived = calculateBuild(characterSheetDefaultValues.build, 2);

    expect(derived.spentExperience).toBe(10);
    expect(derived.remainingExperience).toBe(40);
    expect(derived.hasBuildError).toBe(false);
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

    expect(derived.growthPoints).toBe(0);
    expect(derived.hasGrowthError).toBe(true);
    expect(derived.hasAttributeError).toBe(true);
    expect(derived.hasBuildError).toBe(true);
  });

  it("derives independent primary and ikizama values before both are selected", () => {
    const primaryOnly = {
      ...characterSheetDefaultValues.build,
      primaryRyugiId: "kenkaya",
    };
    const primaryDerived = calculateBuild(primaryOnly);

    expect(primaryDerived.attributes.strength.base).toBe(5);
    expect(primaryDerived.attributes.strength.permanent).toBe(null);
    expect(primaryDerived.reference.primaryHealthIncrease).toBe(5);
    expect(primaryDerived.reference.commonSkillBonuses?.level2).toBe(
      "攻撃判定数+1\n攻撃力+3",
    );
    expect(primaryDerived.ikizamaAttributePoints).toBe(null);

    const ikizamaOnly = {
      ...characterSheetDefaultValues.build,
      ikizamaId: "burai",
    };
    const ikizamaDerived = calculateBuild(ikizamaOnly);

    expect(ikizamaDerived.ikizamaAttributePoints).toEqual([5, 4, 3, 2]);
    expect(ikizamaDerived.reference.ikizamaHealthCoefficient).toBe(11);
    expect(ikizamaDerived.attributes.strength.base).toBe(null);
  });

  it("derives rank, experience, and attributes from selected data", () => {
    const derived = calculateBuild(selectedBuild());

    expect(derived.rank).toBe(2);
    expect(derived.growthPoints).toBe(0);
    expect(derived.spentExperience).toBe(0);
    expect(derived.remainingExperience).toBe(50);
    expect(derived.ikizamaAttributePoints).toEqual([5, 4, 3, 2]);
    expect(derived.reference).toEqual({
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
    expect(derived.attributes.strength.base).toBe(5);
    expect(derived.attributes.strength.permanent).toBe(10);
    expect(derived.attributes.strength.temporary).toBe(10);
    expect(derived.hasBuildError).toBe(false);
  });

  it("preserves mismatches and over-budget values as local error states", () => {
    const build = selectedBuild();
    build.attributes.strength.points = 4;
    build.acquiredExperience = 0;
    build.primaryRyugiLevel = 2;

    const derived = calculateBuild(build);

    expect(derived.hasAttributeError).toBe(true);
    expect(derived.hasExperienceError).toBe(true);
    expect(derived.hasBuildError).toBe(true);
  });

  it("keeps point allocation and growth errors local to their own inputs", () => {
    const pointMismatch = selectedBuild();
    pointMismatch.attributes.strength.points = 4;

    const pointDerived = calculateBuild(pointMismatch);

    expect(pointDerived.hasPointAllocationError).toBe(true);
    expect(pointDerived.hasGrowthError).toBe(false);

    const excessGrowth = selectedBuild();
    excessGrowth.attributes.strength.growth = 1;

    const growthDerived = calculateBuild(excessGrowth);

    expect(growthDerived.hasPointAllocationError).toBe(false);
    expect(growthDerived.hasGrowthError).toBe(true);
  });

  it("adds growth points at each rank milestone and caps each attribute", () => {
    const rank15 = selectedBuild();
    rank15.primaryRyugiLevel = 14;
    expect(calculateBuild(rank15).growthPoints).toBe(1);

    const rank30 = selectedBuild();
    rank30.primaryRyugiLevel = 29;
    rank30.attributes.strength.growth = 2;
    rank30.attributes.mind.growth = 1;
    const rank30Derived = calculateBuild(rank30);
    expect(rank30Derived.growthPoints).toBe(3);
    expect(rank30Derived.hasGrowthError).toBe(false);

    rank30.attributes.strength.growth = 3;
    expect(calculateBuild(rank30).hasGrowthError).toBe(true);

    const rank45 = selectedBuild();
    rank45.primaryRyugiLevel = 44;
    rank45.attributes.strength.growth = 3;
    rank45.attributes.mind.growth = 3;
    const rank45Derived = calculateBuild(rank45);
    expect(rank45Derived.growthPoints).toBe(6);
    expect(rank45Derived.hasGrowthError).toBe(false);

    rank45.attributes.strength.growth = 4;
    rank45.attributes.mind.growth = 2;
    expect(calculateBuild(rank45).hasGrowthError).toBe(true);
  });

  it("keeps an invalid acquired experience value visible before both selections", () => {
    const build = {
      ...characterSheetDefaultValues.build,
      acquiredExperience: -1,
    };

    const derived = calculateBuild(build);

    expect(derived.hasExperienceError).toBe(true);
    expect(derived.hasBuildError).toBe(true);
    expect(derived.remainingExperience).toBe(-1);
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

    expect(derived.primaryRyugiDuplicate).toBe(true);
    expect(derived.otherRyugiDuplicateRowIds).toEqual([
      "first",
      "second",
      "third",
    ]);
    expect(derived.otherRyugiLevelInvalidRowIds).toEqual(["second"]);
  });
});

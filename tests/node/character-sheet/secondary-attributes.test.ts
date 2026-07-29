import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import { calculateBuild } from "../../../src/character-sheet/logic/build";
import { calculateSecondaryAttributes } from "../../../src/character-sheet/logic/secondary-attributes";

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

describe("character sheet secondary attributes", () => {
  it("keeps build-dependent values unavailable while preserving independent values", () => {
    const derived = calculateSecondaryAttributes(
      calculateBuild(characterSheetDefaultValues.build),
      characterSheetDefaultValues.secondaryAttributes,
    );

    assert.equal(derived.baseHealth, null);
    assert.equal(derived.health, null);
    assert.equal(derived.baseMovement, null);
    assert.equal(derived.actionValue, null);
    assert.equal(derived.baseActionCount, 2);
    assert.equal(derived.actionCount, 2);
    assert.equal(derived.baseBondLimit, 4);
    assert.equal(derived.bondLimit, 4);
  });

  it("derives the specified values with signed manual modifiers", () => {
    const secondaryAttributes = {
      actionCountModifier: -1,
      actionModifier: -2,
      applyTemporaryAction: false,
      applyTemporaryMovement: false,
      bondLimitModifier: 2,
      healthModifier: 2,
      mentalModifier: -3,
      movementModifier: 1,
    };
    const derived = calculateSecondaryAttributes(
      calculateBuild(selectedBuild()),
      secondaryAttributes,
    );

    assert.equal(derived.baseHealth, 60);
    assert.equal(derived.health, 62);
    assert.equal(derived.baseMental, 16);
    assert.equal(derived.mental, 13);
    assert.equal(derived.baseMovement, 6);
    assert.equal(derived.movement, 7);
    assert.equal(derived.baseActionValue, 17);
    assert.equal(derived.actionValue, 15);
    assert.equal(derived.actionCount, 1);
    assert.equal(derived.bondLimit, 6);
  });

  it("uses the specified ikizama coefficient boundaries and primary level", () => {
    const cases = [
      {
        expectedHealth: 60,
        expectedMental: 16,
        ikizamaLevel: 1,
        primaryLevel: 1,
      },
      {
        expectedHealth: 65,
        expectedMental: 20,
        ikizamaLevel: 4,
        primaryLevel: 1,
      },
      {
        expectedHealth: 75,
        expectedMental: 22,
        ikizamaLevel: 10,
        primaryLevel: 1,
      },
      {
        expectedHealth: 65,
        expectedMental: 18,
        ikizamaLevel: 1,
        primaryLevel: 2,
      },
    ];

    for (const {
      expectedHealth,
      expectedMental,
      ikizamaLevel,
      primaryLevel,
    } of cases) {
      const derived = calculateSecondaryAttributes(
        calculateBuild({
          ...selectedBuild(),
          ikizamaLevel,
          primaryRyugiLevel: primaryLevel,
        }),
        characterSheetDefaultValues.secondaryAttributes,
      );

      assert.equal(derived.baseHealth, expectedHealth);
      assert.equal(derived.baseMental, expectedMental);
    }
  });

  it("uses temporary agility and perception only when each checkbox is applied", () => {
    const build = selectedBuild();
    build.attributes.agility.temporaryModifier = 4;
    build.attributes.perception.temporaryModifier = 1;
    const derivedBuild = calculateBuild(build);

    const permanent = calculateSecondaryAttributes(derivedBuild, {
      ...characterSheetDefaultValues.secondaryAttributes,
      applyTemporaryAction: false,
      applyTemporaryMovement: false,
    });
    const temporary = calculateSecondaryAttributes(derivedBuild, {
      ...characterSheetDefaultValues.secondaryAttributes,
      applyTemporaryAction: true,
      applyTemporaryMovement: true,
    });

    assert.equal(permanent.baseMovement, 6);
    assert.equal(permanent.baseActionValue, 17);
    assert.equal(temporary.baseMovement, 7);
    assert.equal(temporary.baseActionValue, 23);
  });

  it("includes a nanomachine bonus in the displayed automatic health value", () => {
    const derived = calculateSecondaryAttributes(
      calculateBuild(selectedBuild()),
      characterSheetDefaultValues.secondaryAttributes,
      4,
    );

    assert.equal(derived.baseHealth, 64);
    assert.equal(derived.health, 64);
  });
});

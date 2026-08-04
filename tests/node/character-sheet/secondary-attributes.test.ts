import { describe, expect, it } from "vitest";

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

    expect(derived.baseHealth).toBe(null);
    expect(derived.health).toBe(null);
    expect(derived.baseMovement).toBe(null);
    expect(derived.actionValue).toBe(null);
    expect(derived.baseActionCount).toBe(2);
    expect(derived.actionCount).toBe(2);
    expect(derived.baseBondLimit).toBe(4);
    expect(derived.bondLimit).toBe(4);
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

    expect(derived.baseHealth).toBe(60);
    expect(derived.health).toBe(62);
    expect(derived.baseMental).toBe(16);
    expect(derived.mental).toBe(13);
    expect(derived.baseMovement).toBe(6);
    expect(derived.movement).toBe(7);
    expect(derived.baseActionValue).toBe(17);
    expect(derived.actionValue).toBe(15);
    expect(derived.actionCount).toBe(1);
    expect(derived.bondLimit).toBe(6);
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

      expect(derived.baseHealth).toBe(expectedHealth);
      expect(derived.baseMental).toBe(expectedMental);
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

    expect(permanent.baseMovement).toBe(6);
    expect(permanent.baseActionValue).toBe(17);
    expect(temporary.baseMovement).toBe(7);
    expect(temporary.baseActionValue).toBe(23);
  });

  it("includes a nanomachine bonus in the displayed automatic health value", () => {
    const derived = calculateSecondaryAttributes(
      calculateBuild(selectedBuild()),
      characterSheetDefaultValues.secondaryAttributes,
      4,
    );

    expect(derived.baseHealth).toBe(64);
    expect(derived.health).toBe(64);
  });
});

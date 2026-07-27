import assert from "node:assert/strict";
import test from "node:test";

import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import {
  calculateChecks,
  defaultAttributeByAttackSkill,
  defaultAttributeByReaction,
} from "../../../src/character-sheet/logic/checks";

const attributes = {
  agility: { permanent: 2, temporary: 3 },
  body: { permanent: 4, temporary: 5 },
  mind: { permanent: 6, temporary: 7 },
  perception: { permanent: 8, temporary: 9 },
  strength: { permanent: 10, temporary: 11 },
};

test("calculateChecks derives permanent and temporary counts without persisting them", () => {
  const checks = structuredClone(characterSheetDefaultValues.checks);
  checks.attacks[0] = { ...checks.attacks[0], modifier: -2 };
  checks.reactions[2] = { ...checks.reactions[2], modifier: 3 };

  const result = calculateChecks(checks, attributes);

  assert.deepEqual(result.attacks[0], {
    attribute: "strength",
    modifier: -2,
    permanentAttribute: 10,
    permanentCheck: 8,
    rowId: "attack-1",
    skill: "brawl",
    temporaryAttribute: 11,
    temporaryCheck: 9,
  });
  assert.equal(result.reactions[2]?.permanentCheck, 7);
  assert.equal(result.reactions[2]?.temporaryCheck, 8);
  assert.equal("permanentCheck" in checks.attacks[0], false);
});

test("check defaults map every attack skill and reaction type to the specified attribute", () => {
  assert.deepEqual(defaultAttributeByAttackSkill, {
    assassination: "agility",
    brawl: "strength",
    combat: "body",
    interference: "mind",
    shooting: "perception",
  });
  assert.deepEqual(defaultAttributeByReaction, {
    defense: "strength",
    endurance: "body",
    evasion: "strength",
    resistance: "mind",
  });
});

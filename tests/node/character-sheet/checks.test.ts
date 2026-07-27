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

test("calculateChecks derives all noncombat checks from fixed attributes and doubles only favorite attributes", () => {
  const checks = structuredClone(characterSheetDefaultValues.checks);
  checks.noncombat.intimidation = { isFavorite: true, modifier: -2 };
  checks.noncombat.hacking = { isFavorite: false, modifier: 3 };

  const result = calculateChecks(checks, attributes);

  assert.deepEqual(
    result.noncombat.map(({ attribute, id, name }) => ({
      attribute,
      id,
      name,
    })),
    [
      { attribute: "strength", id: "intimidation", name: "脅迫" },
      { attribute: "strength", id: "strengthContest", name: "力比べ" },
      { attribute: "strength", id: "willpower", name: "根性" },
      { attribute: "agility", id: "reconnaissance", name: "偵察" },
      { attribute: "agility", id: "acrobatics", name: "軽業" },
      { attribute: "agility", id: "sleightOfHand", name: "手業" },
      { attribute: "perception", id: "cheating", name: "イカサマ" },
      { attribute: "perception", id: "dangerSense", name: "危険察知" },
      { attribute: "perception", id: "analysis", name: "分析" },
      { attribute: "body", id: "driving", name: "運転" },
      { attribute: "body", id: "survival", name: "生存" },
      { attribute: "body", id: "jingi", name: "仁義" },
      { attribute: "mind", id: "gambling", name: "賭博" },
      { attribute: "mind", id: "negotiation", name: "交渉" },
      { attribute: "mind", id: "hacking", name: "ハッキング" },
    ],
  );
  assert.deepEqual(result.noncombat[0], {
    attribute: "strength",
    id: "intimidation",
    isFavorite: true,
    modifier: -2,
    name: "脅迫",
    permanentCheck: 18,
    temporaryCheck: 20,
  });
  assert.deepEqual(result.noncombat.at(-1), {
    attribute: "mind",
    id: "hacking",
    isFavorite: false,
    modifier: 3,
    name: "ハッキング",
    permanentCheck: 9,
    temporaryCheck: 10,
  });
  assert.equal("permanentCheck" in checks.noncombat.intimidation, false);
});

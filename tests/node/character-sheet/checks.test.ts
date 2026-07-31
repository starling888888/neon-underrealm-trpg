import assert from "node:assert/strict";
import test from "node:test";

import { characterSheetDictionary } from "../../../src/character-sheet/dictionary";
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
    result.noncombat.map(({ attribute, id }) => ({
      attribute,
      id,
    })),
    [
      { attribute: "strength", id: "intimidation" },
      { attribute: "strength", id: "strengthContest" },
      { attribute: "strength", id: "willpower" },
      { attribute: "agility", id: "reconnaissance" },
      { attribute: "agility", id: "acrobatics" },
      { attribute: "agility", id: "sleightOfHand" },
      { attribute: "perception", id: "cheating" },
      { attribute: "perception", id: "dangerSense" },
      { attribute: "perception", id: "analysis" },
      { attribute: "body", id: "driving" },
      { attribute: "body", id: "survival" },
      { attribute: "body", id: "jingi" },
      { attribute: "mind", id: "gambling" },
      { attribute: "mind", id: "negotiation" },
      { attribute: "mind", id: "hacking" },
    ],
  );
  assert.deepEqual(
    characterSheetDictionary.gameDomain.terms.noncombatSkillNames,
    {
      acrobatics: "軽業",
      analysis: "分析",
      cheating: "イカサマ",
      dangerSense: "危険察知",
      driving: "運転",
      gambling: "賭博",
      hacking: "ハッキング",
      intimidation: "脅迫",
      jingi: "仁義",
      negotiation: "交渉",
      reconnaissance: "偵察",
      sleightOfHand: "手業",
      strengthContest: "力比べ",
      survival: "生存",
      willpower: "根性",
    },
  );
  assert.deepEqual(result.noncombat[0], {
    attribute: "strength",
    id: "intimidation",
    isFavorite: true,
    modifier: -2,
    permanentCheck: 18,
    temporaryCheck: 20,
  });
  assert.deepEqual(result.noncombat.at(-1), {
    attribute: "mind",
    id: "hacking",
    isFavorite: false,
    modifier: 3,
    permanentCheck: 9,
    temporaryCheck: 10,
  });
  assert.equal("permanentCheck" in checks.noncombat.intimidation, false);
});

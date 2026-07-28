import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calculateCommonSkillsValidation,
  getUnlockedCommonSkillBonusLevels,
} from "../../../src/character-sheet/logic/common-skills";
import {
  getBasicAttackSkill,
  getCommonSkillCandidates,
} from "../../../src/character-sheet/master-data/common-skills";

describe("character sheet common skills", () => {
  it("keeps the basic attack automatic and preserves candidate source order", () => {
    const basicAttack = getBasicAttackSkill();
    const candidates = getCommonSkillCandidates();

    assert.equal(basicAttack?.name, "基本の一撃");
    assert.equal(
      candidates.some((skill) => skill.category === "bonus"),
      false,
    );
    assert.deepEqual(
      candidates.map((skill) => skill.sourceOrder),
      [...candidates.map((skill) => skill.sourceOrder)].sort(
        (left, right) => left - right,
      ),
    );
  });

  it("counts selected normal rows only and rounds the rank limit upward", () => {
    const [skill] = getCommonSkillCandidates();
    if (skill === undefined)
      throw new Error("共通スキル候補を取得できません。");

    const validation = calculateCommonSkillsValidation(3, [
      { level: 2, rowId: "selected", skill },
      { level: 4, rowId: "empty", skill: null },
    ]);

    assert.equal(validation.selectedLevelTotal, 2);
    assert.equal(validation.levelLimit, 2);
    assert.equal(validation.hasCommonSkillLevelError, false);

    assert.equal(
      calculateCommonSkillsValidation(3, [
        { level: 3, rowId: "over-limit", skill },
      ]).hasCommonSkillLevelError,
      true,
    );
  });

  it("unlocks bonus highlights at common-skill levels 2, 5, and 9", () => {
    assert.deepEqual(getUnlockedCommonSkillBonusLevels(1), []);
    assert.deepEqual(getUnlockedCommonSkillBonusLevels(2), [2]);
    assert.deepEqual(getUnlockedCommonSkillBonusLevels(5), [2, 5]);
    assert.deepEqual(getUnlockedCommonSkillBonusLevels(9), [2, 5, 9]);
  });

  it("reports selected rows below one or above their maximum level", () => {
    const [skill] = getCommonSkillCandidates();
    if (skill === undefined)
      throw new Error("共通スキル候補を取得できません。");

    const validation = calculateCommonSkillsValidation(10, [
      { level: 0, rowId: "below-minimum", skill },
      { level: skill.maxLevel + 1, rowId: "above-maximum", skill },
    ]);

    assert.deepEqual(validation.invalidMaximumLevelRowIds, [
      "below-minimum",
      "above-maximum",
    ]);
  });

  it("does not let below-minimum levels reduce the common-skill total", () => {
    const [skill] = getCommonSkillCandidates();
    if (skill === undefined)
      throw new Error("共通スキル候補を取得できません。");

    const validation = calculateCommonSkillsValidation(10, [
      { level: 2, rowId: "valid", skill },
      { level: 0, rowId: "zero", skill },
      { level: -1, rowId: "negative", skill },
      { level: skill.maxLevel + 1, rowId: "above-maximum", skill },
    ]);

    assert.equal(validation.selectedLevelTotal, 2 + skill.maxLevel + 1);
    assert.deepEqual(validation.invalidMaximumLevelRowIds, [
      "zero",
      "negative",
      "above-maximum",
    ]);
  });

  it("identifies duplicate selected common skills", () => {
    const [skill] = getCommonSkillCandidates();
    if (skill === undefined)
      throw new Error("共通スキル候補を取得できません。");

    const validation = calculateCommonSkillsValidation(10, [
      { level: 1, rowId: "duplicate-a", skill },
      { level: 1, rowId: "duplicate-b", skill },
    ]);

    assert.deepEqual(validation.invalidDuplicateSkillRowIds, [
      "duplicate-a",
      "duplicate-b",
    ]);
  });
});

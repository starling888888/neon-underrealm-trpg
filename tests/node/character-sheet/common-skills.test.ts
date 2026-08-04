import { describe, expect, it } from "vitest";

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

    expect(basicAttack?.name).toBe("基本の一撃");
    expect(candidates.some((skill) => skill.category === "bonus")).toBe(false);
    expect(candidates.map((skill) => skill.sourceOrder)).toEqual(
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

    expect(validation.selectedLevelTotal).toBe(2);
    expect(validation.levelLimit).toBe(2);
    expect(validation.hasCommonSkillLevelError).toBe(false);

    expect(
      calculateCommonSkillsValidation(3, [
        { level: 3, rowId: "over-limit", skill },
      ]).hasCommonSkillLevelError,
    ).toBe(true);
  });

  it("unlocks bonus highlights at common-skill levels 2, 5, and 9", () => {
    expect(getUnlockedCommonSkillBonusLevels(1)).toEqual([]);
    expect(getUnlockedCommonSkillBonusLevels(2)).toEqual([2]);
    expect(getUnlockedCommonSkillBonusLevels(5)).toEqual([2, 5]);
    expect(getUnlockedCommonSkillBonusLevels(9)).toEqual([2, 5, 9]);
  });

  it("reports selected rows below one or above their maximum level", () => {
    const [skill] = getCommonSkillCandidates();
    if (skill === undefined)
      throw new Error("共通スキル候補を取得できません。");

    const validation = calculateCommonSkillsValidation(10, [
      { level: 0, rowId: "below-minimum", skill },
      { level: skill.maxLevel + 1, rowId: "above-maximum", skill },
    ]);

    expect(validation.invalidMaximumLevelRowIds).toEqual([
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

    expect(validation.selectedLevelTotal).toBe(2 + skill.maxLevel + 1);
    expect(validation.invalidMaximumLevelRowIds).toEqual([
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

    expect(validation.invalidDuplicateSkillRowIds).toEqual([
      "duplicate-a",
      "duplicate-b",
    ]);
  });
});

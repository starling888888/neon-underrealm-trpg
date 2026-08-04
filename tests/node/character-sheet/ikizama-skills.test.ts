import { describe, expect, it } from "vitest";
import { calculateIkizamaSkillsValidation } from "../../../src/character-sheet/logic/ikizama-skills";
import {
  getIkizamaSkillById,
  getIkizamaSkillGroups,
} from "../../../src/character-sheet/master-data/ikizama-skills";

describe("character sheet ikizama skills", () => {
  it("keeps bonus out of candidates and unlocks advanced skills at level 4", () => {
    const unselected = getIkizamaSkillGroups(null, 1);
    const initial = getIkizamaSkillGroups("burai", 1);
    const advanced = getIkizamaSkillGroups("burai", 4);

    expect(unselected).toEqual({ advanced: [], basic: [], bonus: [] });
    expect(initial.bonus.length).toBe(1);
    expect(initial.basic.length > 0).toBe(true);
    expect(initial.advanced).toEqual([]);
    expect(advanced.advanced.length > 0).toBe(true);
    expect(
      advanced.bonus.some((skill) => skill.id === advanced.basic[0]?.id),
    ).toBe(false);
  });

  it("resolves IDs only from the selected ikizama", () => {
    const [skill] = getIkizamaSkillGroups("burai", 4).basic;
    if (skill === undefined)
      throw new Error("ブライの基本スキルがありません。");

    expect(getIkizamaSkillById("burai", skill.id)?.id).toBe(skill.id);
    expect(getIkizamaSkillById("kage", skill.id)).toBe(null);
  });

  it("counts selected normal rows and bonus levels above the free first level", () => {
    const [skill] = getIkizamaSkillGroups("burai", 1).basic;
    if (skill === undefined)
      throw new Error("ブライの基本スキルがありません。");

    const validation = calculateIkizamaSkillsValidation(3, 3, null, [
      { level: 1, rowId: "first", skill },
      { level: 1, rowId: "second", skill },
      { level: 99, rowId: "unselected", skill: null },
    ]);

    expect(validation.selectedLevelTotal).toBe(4);
    expect(validation.hasIkizamaSkillLevelTotalError).toBe(true);
  });

  it("does not count the free first bonus level", () => {
    const validation = calculateIkizamaSkillsValidation(1, 1, null, []);

    expect(validation.selectedLevelTotal).toBe(0);
    expect(validation.hasIkizamaSkillLevelTotalError).toBe(false);
  });

  it("keeps maximum-level violations for normal and bonus skills", () => {
    const groups = getIkizamaSkillGroups("burai", 1);
    const bonusSkill = groups.bonus[0];
    const normalSkill = groups.basic[0];
    if (bonusSkill === undefined || normalSkill === undefined) {
      throw new Error("生き様スキル候補を取得できません。");
    }

    const validation = calculateIkizamaSkillsValidation(
      1,
      bonusSkill.maxLevel + 1,
      bonusSkill,
      [
        {
          level: normalSkill.maxLevel + 1,
          rowId: "normal-over-limit",
          skill: normalSkill,
        },
      ],
    );

    expect(validation.invalidMaximumLevelRowIds).toEqual([
      `ikizama-bonus-${bonusSkill.id}`,
      "normal-over-limit",
    ]);
  });

  it("identifies retained advanced and duplicate normal skills", () => {
    const [advancedSkill] = getIkizamaSkillGroups("burai", 4).advanced;
    const [basicSkill] = getIkizamaSkillGroups("burai", 1).basic;
    if (advancedSkill === undefined || basicSkill === undefined) {
      throw new Error("生き様スキル候補を取得できません。");
    }

    const validation = calculateIkizamaSkillsValidation(3, 1, null, [
      { level: 1, rowId: "advanced", skill: advancedSkill },
      { level: 1, rowId: "duplicate-a", skill: basicSkill },
      { level: 1, rowId: "duplicate-b", skill: basicSkill },
    ]);

    expect(validation.invalidAdvancedSkillRowIds).toEqual(["advanced"]);
    expect(validation.invalidDuplicateSkillRowIds).toEqual([
      "duplicate-a",
      "duplicate-b",
    ]);
  });

  it("does not let a negative selected level cancel the ikizama total", () => {
    const [skill] = getIkizamaSkillGroups("burai", 1).basic;
    if (skill === undefined)
      throw new Error("ブライの基本スキルがありません。");

    const validation = calculateIkizamaSkillsValidation(1, 1, null, [
      { level: 2, rowId: "positive", skill },
      { level: -1, rowId: "negative", skill },
    ]);

    expect(validation.selectedLevelTotal).toBe(2);
    expect(validation.hasIkizamaSkillLevelTotalError).toBe(true);
    expect(validation.invalidMaximumLevelRowIds).toEqual([
      "positive",
      "negative",
    ]);
  });
});

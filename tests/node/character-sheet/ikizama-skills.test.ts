import assert from "node:assert/strict";
import { describe, it } from "node:test";
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

    assert.deepEqual(unselected, { advanced: [], basic: [], bonus: [] });
    assert.equal(initial.bonus.length, 1);
    assert.equal(initial.basic.length > 0, true);
    assert.deepEqual(initial.advanced, []);
    assert.equal(advanced.advanced.length > 0, true);
    assert.equal(
      advanced.bonus.some((skill) => skill.id === advanced.basic[0]?.id),
      false,
    );
  });

  it("resolves IDs only from the selected ikizama", () => {
    const [skill] = getIkizamaSkillGroups("burai", 4).basic;
    if (skill === undefined)
      throw new Error("ブライの基本スキルがありません。");

    assert.equal(getIkizamaSkillById("burai", skill.id)?.id, skill.id);
    assert.equal(getIkizamaSkillById("kage", skill.id), null);
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

    assert.equal(validation.selectedLevelTotal, 4);
    assert.equal(validation.hasIkizamaSkillLevelTotalError, true);
  });

  it("does not count the free first bonus level", () => {
    const validation = calculateIkizamaSkillsValidation(1, 1, null, []);

    assert.equal(validation.selectedLevelTotal, 0);
    assert.equal(validation.hasIkizamaSkillLevelTotalError, false);
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

    assert.deepEqual(validation.invalidMaximumLevelRowIds, [
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

    assert.deepEqual(validation.invalidAdvancedSkillRowIds, ["advanced"]);
    assert.deepEqual(validation.invalidDuplicateSkillRowIds, [
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

    assert.equal(validation.selectedLevelTotal, 2);
    assert.equal(validation.hasIkizamaSkillLevelTotalError, true);
    assert.deepEqual(validation.invalidMaximumLevelRowIds, [
      "positive",
      "negative",
    ]);
  });
});

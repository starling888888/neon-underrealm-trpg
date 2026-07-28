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

    const validation = calculateIkizamaSkillsValidation(3, 3, [
      { level: 1, skill },
      { level: 1, skill },
      { level: 99, skill: null },
    ]);

    assert.equal(validation.selectedLevelTotal, 4);
    assert.equal(validation.hasIkizamaSkillLevelTotalError, true);
  });

  it("does not count the free first bonus level", () => {
    const validation = calculateIkizamaSkillsValidation(1, 1, []);

    assert.equal(validation.selectedLevelTotal, 0);
    assert.equal(validation.hasIkizamaSkillLevelTotalError, false);
  });
});

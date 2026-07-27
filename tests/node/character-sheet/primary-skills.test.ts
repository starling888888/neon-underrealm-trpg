import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculatePrimarySkillsValidation } from "../../../src/character-sheet/logic/primary-skills";
import {
  getMaximumSkillNameLength,
  getPrimarySkillById,
  getPrimarySkillGroups,
} from "../../../src/character-sheet/master-data/primary-skills";

describe("character sheet primary skills", () => {
  it("keeps bonus out of selectable groups and unlocks advanced skills at level 6", () => {
    const unselected = getPrimarySkillGroups(null, 1);
    const initial = getPrimarySkillGroups("kenkaya", 1);
    const advanced = getPrimarySkillGroups("kenkaya", 6);

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

  it("resolves selected IDs only inside the current primary ryugi", () => {
    const groups = getPrimarySkillGroups("kenkaya", 6);
    const skill = groups.basic[0];

    assert.notEqual(skill, undefined);
    assert.equal(
      getPrimarySkillById("kenkaya", skill?.id ?? null)?.id,
      skill?.id,
    );
    assert.equal(getPrimarySkillById("emono", skill?.id ?? null), null);
  });

  it("uses a positive maximum name length across every skill master", () => {
    const maximumNameLength = getMaximumSkillNameLength();
    const knownSkillLength = Array.from("気合込め強化").length;

    assert.equal(maximumNameLength >= knownSkillLength, true);
  });

  it("identifies maximum-level rows and an insufficient primary skill total", () => {
    const [skill] = getPrimarySkillGroups("kenkaya", 1).basic;
    if (skill === undefined)
      throw new Error("ケンカヤの基本スキルがありません。");

    const validation = calculatePrimarySkillsValidation(1, [
      {
        level: skill.maxLevel + 1,
        rowId: "over-limit",
        skill,
        skillId: skill.id,
      },
      { level: 1, rowId: "empty", skill: null, skillId: null },
    ]);

    assert.deepEqual(validation.invalidMaximumLevelRowIds, ["over-limit"]);
    assert.equal(validation.selectedLevelTotal, skill.maxLevel + 1);
    assert.equal(
      validation.hasPrimarySkillLevelTotalError,
      skill.maxLevel + 1 > 1,
    );
  });
});

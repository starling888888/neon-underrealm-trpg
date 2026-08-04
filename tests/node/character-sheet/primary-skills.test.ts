import { describe, expect, it } from "vitest";
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

    expect(unselected).toEqual({ advanced: [], basic: [], bonus: [] });
    expect(initial.bonus.length).toBe(1);
    expect(initial.basic.length > 0).toBe(true);
    expect(initial.advanced).toEqual([]);
    expect(advanced.advanced.length > 0).toBe(true);
    expect(
      advanced.bonus.some((skill) => skill.id === advanced.basic[0]?.id),
    ).toBe(false);
  });

  it("resolves selected IDs only inside the current primary ryugi", () => {
    const groups = getPrimarySkillGroups("kenkaya", 6);
    const skill = groups.basic[0];

    expect(skill).not.toBe(undefined);
    expect(getPrimarySkillById("kenkaya", skill?.id ?? null)?.id).toBe(
      skill?.id,
    );
    expect(getPrimarySkillById("emono", skill?.id ?? null)).toBe(null);
  });

  it("uses a positive maximum name length across every skill master", () => {
    const maximumNameLength = getMaximumSkillNameLength();
    const knownSkillLength = Array.from("気合込め強化").length;

    expect(maximumNameLength >= knownSkillLength).toBe(true);
  });

  it("identifies duplicate and maximum-level rows and an insufficient primary skill total", () => {
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
      { level: 1, rowId: "duplicate", skill, skillId: skill.id },
      { level: 1, rowId: "empty", skill: null, skillId: null },
    ]);

    expect(validation.invalidMaximumLevelRowIds).toEqual(["over-limit"]);
    expect(validation.invalidDuplicateSkillRowIds).toEqual([
      "over-limit",
      "duplicate",
    ]);
    expect(validation.selectedLevelTotal).toBe(skill.maxLevel + 2);
    expect(validation.hasPrimarySkillLevelTotalError).toBe(
      skill.maxLevel + 2 > 1,
    );
  });

  it("retains selected advanced skills as section-level errors below level 6", () => {
    const [skill] = getPrimarySkillGroups("kenkaya", 6).advanced;
    if (skill === undefined)
      throw new Error("ケンカヤのadvancedスキルを取得できません。");

    const validation = calculatePrimarySkillsValidation(5, [
      { level: 1, rowId: "advanced", skill, skillId: skill.id },
    ]);

    expect(validation.invalidAdvancedSkillRowIds).toEqual(["advanced"]);
  });

  it("does not let a negative selected level cancel the primary total", () => {
    const [skill] = getPrimarySkillGroups("kenkaya", 1).basic;
    if (skill === undefined)
      throw new Error("ケンカヤの基本スキルがありません。");

    const validation = calculatePrimarySkillsValidation(1, [
      { level: 2, rowId: "positive", skill, skillId: skill.id },
      { level: -1, rowId: "negative", skill, skillId: skill.id },
    ]);

    expect(validation.selectedLevelTotal).toBe(2);
    expect(validation.hasPrimarySkillLevelTotalError).toBe(true);
    expect(validation.invalidMaximumLevelRowIds).toEqual([
      "positive",
      "negative",
    ]);
  });
});

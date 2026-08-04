import { describe, expect, it } from "vitest";
import { calculateOtherRyugiSkillsValidation } from "../../../src/character-sheet/logic/other-ryugi-skills";
import {
  getOtherRyugiSkillById,
  getOtherRyugiSkillGroups,
} from "../../../src/character-sheet/master-data/other-ryugi-skills";
import { getRyugiSkillsById } from "../../../src/lib/data/ryugi-skills";

describe("character sheet other ryugi skills", () => {
  it("excludes bonus and primary-only skills while unlocking advanced skills at level 6", () => {
    const unselected = getOtherRyugiSkillGroups(null, 1);
    const initial = getOtherRyugiSkillGroups("kenkaya", 1);
    const advanced = getOtherRyugiSkillGroups("kenkaya", 6);
    const allCandidates = [...advanced.basic, ...advanced.advanced];
    const master = getRyugiSkillsById("kenkaya");
    const primaryOnlySkill =
      master === undefined
        ? undefined
        : [...master.basic, ...master.advanced].find(
            (skill) => skill.acquisitionRestriction === "プライマリ限定",
          );

    expect(unselected).toEqual({ advanced: [], basic: [] });
    expect(initial.basic.length > 0).toBe(true);
    expect(initial.advanced).toEqual([]);
    expect(advanced.advanced.length > 0).toBe(true);
    expect(
      allCandidates.every(
        (skill) => skill.acquisitionRestriction !== "プライマリ限定",
      ),
    ).toBe(true);
    expect(primaryOnlySkill).not.toBe(undefined);
    expect(
      getOtherRyugiSkillById("kenkaya", primaryOnlySkill?.id ?? null),
    ).toBe(null);
  });

  it("marks only other-ryugi rows whose selected skill totals exceed their own level", () => {
    const [skill] = getOtherRyugiSkillGroups("kenkaya", 1).basic;
    if (skill === undefined) {
      throw new Error("その他流儀スキル候補を取得できません。");
    }

    const validation = calculateOtherRyugiSkillsValidation(
      [
        { level: 1, rowId: "other-a" },
        { level: 2, rowId: "other-b" },
      ],
      [
        { level: 2, rowId: "other-a-skill", ryugiRowId: "other-a", skill },
        { level: 2, rowId: "other-b-skill", ryugiRowId: "other-b", skill },
        {
          level: 99,
          rowId: "other-b-unselected",
          ryugiRowId: "other-b",
          skill: null,
        },
      ],
    );

    expect(validation.invalidRyugiRowIds).toEqual(["other-a"]);
  });

  it("reports an other-ryugi skill above its maximum level", () => {
    const [skill] = getOtherRyugiSkillGroups("kenkaya", 1).basic;
    if (skill === undefined) {
      throw new Error("その他流儀スキル候補を取得できません。");
    }

    const validation = calculateOtherRyugiSkillsValidation(
      [{ level: skill.maxLevel + 1, rowId: "other-a" }],
      [
        {
          level: skill.maxLevel + 1,
          rowId: "other-a-skill",
          ryugiRowId: "other-a",
          skill,
        },
      ],
    );

    expect(validation.invalidMaximumLevelRowIds).toEqual(["other-a-skill"]);
  });

  it("identifies advanced and duplicate skills within their owning ryugi row", () => {
    const [advancedSkill] = getOtherRyugiSkillGroups("kenkaya", 6).advanced;
    const [basicSkill] = getOtherRyugiSkillGroups("kenkaya", 1).basic;
    if (advancedSkill === undefined || basicSkill === undefined) {
      throw new Error("その他流儀スキル候補を取得できません。");
    }

    const validation = calculateOtherRyugiSkillsValidation(
      [
        { level: 5, rowId: "other-a" },
        { level: 1, rowId: "other-b" },
      ],
      [
        {
          level: 1,
          rowId: "advanced",
          ryugiRowId: "other-a",
          skill: advancedSkill,
        },
        {
          level: 1,
          rowId: "duplicate-a",
          ryugiRowId: "other-a",
          skill: basicSkill,
        },
        {
          level: 1,
          rowId: "duplicate-b",
          ryugiRowId: "other-a",
          skill: basicSkill,
        },
        {
          level: 1,
          rowId: "same-skill-different-ryugi",
          ryugiRowId: "other-b",
          skill: basicSkill,
        },
      ],
    );

    expect(validation.invalidAdvancedSkillRowIds).toEqual(["advanced"]);
    expect(validation.invalidDuplicateSkillRowIds).toEqual([
      "duplicate-a",
      "duplicate-b",
    ]);
  });

  it("does not let a negative selected level cancel an other-ryugi total", () => {
    const [skill] = getOtherRyugiSkillGroups("kenkaya", 1).basic;
    if (skill === undefined) {
      throw new Error("その他流儀スキル候補を取得できません。");
    }

    const validation = calculateOtherRyugiSkillsValidation(
      [{ level: 1, rowId: "other" }],
      [
        { level: 2, rowId: "positive", ryugiRowId: "other", skill },
        { level: -1, rowId: "negative", ryugiRowId: "other", skill },
      ],
    );

    expect(validation.invalidRyugiRowIds).toEqual(["other"]);
    expect(validation.invalidMaximumLevelRowIds).toEqual([
      "positive",
      "negative",
    ]);
  });
});

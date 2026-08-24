import { describe, expect, it } from "vitest";

import { getModifiedItemValue } from "../../../src/character-sheet/logic/item-values";
import {
  getWeaponById,
  getWeaponCandidateGroups,
} from "../../../src/character-sheet/master-data/weapons-and-armor";

describe("character sheet weapons and armor", () => {
  it("derives numeric, special, and empty item values without coercing an explicit zero", () => {
    expect(getModifiedItemValue(4, null)).toBe(4);
    expect(getModifiedItemValue(4, -2)).toBe(2);
    expect(getModifiedItemValue("特殊", null)).toBe(null);
    expect(getModifiedItemValue("特殊", 0)).toBe(0);
    expect(getModifiedItemValue(null, -3)).toBe(-3);
  });

  it("keeps normal group order and adds only the current ikizama weapon group", () => {
    expect(
      getWeaponCandidateGroups(null).map((group) => group.heading),
    ).toEqual(["喧嘩", "暗殺", "発砲", "格闘", "干渉"]);
    expect(getWeaponCandidateGroups("sumi").at(-1)?.heading).toBe(
      "武器化ナノマシン",
    );
    expect(getWeaponCandidateGroups("kejime").at(-1)?.heading).toBe(
      "サイバネ武器",
    );
  });

  it("resolves a retained specialist weapon independently of the current ikizama", () => {
    const specialist = getWeaponCandidateGroups("sumi").find(
      (group) => group.id === "nanomachines",
    )?.weapons[0];

    if (specialist === undefined) {
      throw new Error("スミ専用武器がありません。");
    }

    expect(getWeaponById(specialist.id)?.id).toBe(specialist.id);
  });
});

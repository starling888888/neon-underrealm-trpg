import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { getModifiedItemValue } from "../../../src/character-sheet/logic/item-values";
import {
  getWeaponById,
  getWeaponCandidateGroups,
} from "../../../src/character-sheet/master-data/weapons-and-armor";

describe("character sheet weapons and armor", () => {
  it("derives numeric, special, and empty item values without coercing an explicit zero", () => {
    assert.equal(getModifiedItemValue(4, null), 4);
    assert.equal(getModifiedItemValue(4, -2), 2);
    assert.equal(getModifiedItemValue("特殊", null), null);
    assert.equal(getModifiedItemValue("特殊", 0), 0);
    assert.equal(getModifiedItemValue(null, -3), -3);
  });

  it("keeps normal group order and adds only the current ikizama weapon group", () => {
    assert.deepEqual(
      getWeaponCandidateGroups(null).map((group) => group.heading),
      ["喧嘩", "暗殺", "発砲", "格闘", "干渉"],
    );
    assert.equal(
      getWeaponCandidateGroups("sumi").at(-1)?.heading,
      "武器化ナノマシン",
    );
    assert.equal(
      getWeaponCandidateGroups("kejime").at(-1)?.heading,
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

    assert.equal(getWeaponById(specialist.id)?.id, specialist.id);
  });
});

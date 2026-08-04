import assert from "node:assert/strict";
import { describe, it } from "vitest";
import { calculateCybernetics } from "../../../src/character-sheet/logic/cybernetics";
import {
  getCyberneticById,
  getCyberneticCandidateGroups,
  getCybernetics,
} from "../../../src/character-sheet/master-data/cybernetics";
import { getItemsData } from "../../../src/lib/data/items";

describe("character sheet cybernetics", () => {
  it("keeps generated-data order and fixed-part candidate scope", () => {
    const cybernetics = getCybernetics();
    const first = cybernetics[0];
    if (first === undefined)
      throw new Error("サイバネmaster dataがありません。");

    assert.deepEqual(
      cybernetics.map((item) => item.id),
      (["head", "torso", "arm", "leg", "any"] as const)
        .flatMap((part) => getItemsData().cybernetics[part] ?? [])
        .map((item) => item.id),
    );
    assert.equal(getCyberneticById(first.id)?.id, first.id);
    assert.equal(getCyberneticById(null), null);
    assert.equal(getCyberneticById("unknown-cybernetic"), null);
    assert.deepEqual(
      getCyberneticCandidateGroups("head").map((group) => group.id),
      ["head", "any"],
    );
    assert.deepEqual(
      getCyberneticCandidateGroups("other").map((group) => group.id),
      ["head", "torso", "arm", "leg", "any"],
    );
  });

  it("derives total, limit, error, and noncombat threshold from the final total", () => {
    const [first, second] = getCybernetics();
    if (first === undefined || second === undefined) {
      throw new Error("サイバネmaster dataが不足しています。");
    }

    assert.deepEqual(calculateCybernetics([first, second], 0, 10, 0), {
      hasImplantLimitError: false,
      implantLimit: 10,
      implantPoints: first.implantPoints + second.implantPoints,
      implantPointTotal: first.implantPoints + second.implantPoints,
      noncombatModifier:
        first.implantPoints + second.implantPoints <= 5 ? 0 : -2,
    });
    assert.equal(calculateCybernetics([], 6, 3, 0).noncombatModifier, -2);
    assert.equal(calculateCybernetics([], 11, 3, 0).noncombatModifier, -4);
    assert.equal(calculateCybernetics([], 4, 3, 0).hasImplantLimitError, true);
  });
});

import { describe, expect, it } from "vitest";
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

    expect(cybernetics.map((item) => item.id)).toEqual(
      (["head", "torso", "arm", "leg", "any"] as const)
        .flatMap((part) => getItemsData().cybernetics[part] ?? [])
        .map((item) => item.id),
    );
    expect(getCyberneticById(first.id)?.id).toBe(first.id);
    expect(getCyberneticById(null)).toBe(null);
    expect(getCyberneticById("unknown-cybernetic")).toBe(null);
    expect(
      getCyberneticCandidateGroups("head").map((group) => group.id),
    ).toEqual(["head", "any"]);
    expect(
      getCyberneticCandidateGroups("other").map((group) => group.id),
    ).toEqual(["head", "torso", "arm", "leg", "any"]);
  });

  it("derives total, limit, error, and noncombat threshold from the final total", () => {
    const [first, second] = getCybernetics();
    if (first === undefined || second === undefined) {
      throw new Error("サイバネmaster dataが不足しています。");
    }

    expect(calculateCybernetics([first, second], 0, 10, 0)).toEqual({
      hasImplantLimitError: false,
      implantLimit: 10,
      implantPoints: first.implantPoints + second.implantPoints,
      implantPointTotal: first.implantPoints + second.implantPoints,
      noncombatModifier:
        first.implantPoints + second.implantPoints <= 5 ? 0 : -2,
    });
    expect(calculateCybernetics([], 6, 3, 0).noncombatModifier).toBe(-2);
    expect(calculateCybernetics([], 11, 3, 0).noncombatModifier).toBe(-4);
    expect(calculateCybernetics([], 4, 3, 0).hasImplantLimitError).toBe(true);
  });
});

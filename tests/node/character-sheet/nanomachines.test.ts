import { describe, expect, it } from "vitest";

import { calculateNanomachines } from "../../../src/character-sheet/logic/nanomachines";
import {
  getNanomachineById,
  getNanomachines,
} from "../../../src/character-sheet/master-data/nanomachines";
import { getItemsData } from "../../../src/lib/data/items";

describe("character sheet nanomachines", () => {
  it("keeps generated-data order and resolves IDs", () => {
    const nanomachines = getNanomachines();
    const first = nanomachines[0];
    if (first === undefined) {
      throw new Error("ナノマシンmaster dataがありません。");
    }

    expect(nanomachines.map((item) => item.id)).toEqual(
      getItemsData().nanomachines.map((item) => item.id),
    );
    expect(getNanomachineById(first.id)?.id).toBe(first.id);
    expect(getNanomachineById(null)).toBe(null);
    expect(getNanomachineById("unknown-nanomachine")).toBe(null);
  });

  it("derives total, body-based limit, and error from the final total", () => {
    const [first, second] = getNanomachines();
    if (first === undefined || second === undefined) {
      throw new Error("ナノマシンmaster dataが不足しています。");
    }

    expect(calculateNanomachines([first, second], 1, 9, -2)).toEqual({
      hasImplantLimitError: false,
      implantLimit: 7,
      implantPoints: first.implantPoints + second.implantPoints,
      implantPointTotal: first.implantPoints + second.implantPoints + 1,
    });
    expect(calculateNanomachines([], 4, 3, 0).hasImplantLimitError).toBe(true);
    expect(calculateNanomachines([], 0, null, 0).implantLimit).toBe(null);
  });
});

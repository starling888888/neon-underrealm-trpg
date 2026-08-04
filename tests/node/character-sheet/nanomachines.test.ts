import assert from "node:assert/strict";
import { describe, it } from "vitest";

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

    assert.deepEqual(
      nanomachines.map((item) => item.id),
      getItemsData().nanomachines.map((item) => item.id),
    );
    assert.equal(getNanomachineById(first.id)?.id, first.id);
    assert.equal(getNanomachineById(null), null);
    assert.equal(getNanomachineById("unknown-nanomachine"), null);
  });

  it("derives total, body-based limit, and error from the final total", () => {
    const [first, second] = getNanomachines();
    if (first === undefined || second === undefined) {
      throw new Error("ナノマシンmaster dataが不足しています。");
    }

    assert.deepEqual(calculateNanomachines([first, second], 1, 9, -2), {
      hasImplantLimitError: false,
      implantLimit: 7,
      implantPoints: first.implantPoints + second.implantPoints,
      implantPointTotal: first.implantPoints + second.implantPoints + 1,
    });
    assert.equal(calculateNanomachines([], 4, 3, 0).hasImplantLimitError, true);
    assert.equal(calculateNanomachines([], 0, null, 0).implantLimit, null);
  });
});

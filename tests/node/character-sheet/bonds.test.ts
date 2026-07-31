import assert from "node:assert/strict";
import test from "node:test";

import { characterSheetDefaultValues } from "../../../src/character-sheet/form-values";
import {
  calculateBonds,
  retainBondRows,
} from "../../../src/character-sheet/logic/bonds";

test("calculateBonds keeps four initial rows and orders resolve effects", () => {
  const result = calculateBonds(characterSheetDefaultValues.bonds, 4);

  assert.equal(result.requiredRowCount, 4);
  assert.equal(result.occupiedCount, 0);
  assert.equal(result.isOverLimit, false);
  assert.deepEqual(
    result.effects.map((effect) => effect.id),
    ["recovery", "morale", "activeCheck", "passiveCheck"],
  );
  assert.deepEqual(result.effects[0]?.baseValues, ["10d6", "15d6"]);
});

test("calculateBonds counts resolved rows and clamps a negative limit to zero", () => {
  const bonds = structuredClone(characterSheetDefaultValues.bonds);

  bonds.rows[0] = { ...bonds.rows[0], target: "アキラ" };
  bonds.rows[1] = { ...bonds.rows[1], isResolved: true };

  const result = calculateBonds(bonds, -1);

  assert.equal(result.effectiveLimit, 0);
  assert.equal(result.occupiedCount, 2);
  assert.equal(result.isOverLimit, true);
  assert.equal(result.requiredRowCount, 2);
  assert.deepEqual(result.overflowRowIds, ["bond-1", "bond-2"]);
});

test("retainBondRows removes only empty placeholders after a limit decrease", () => {
  const rows = structuredClone(characterSheetDefaultValues.bonds.rows);
  rows[1] = { ...rows[1], target: "アキラ" };
  rows[3] = { ...rows[3], isResolved: true };

  const retainedRows = retainBondRows(rows, 1);

  assert.deepEqual(
    retainedRows.map((row) => row.rowId),
    ["bond-2", "bond-4"],
  );
});

test("calculateBonds applies modifiers to dice counts except for morale gain", () => {
  const bonds = structuredClone(characterSheetDefaultValues.bonds);
  bonds.resolveEffectModifiers.recovery = 2;
  bonds.resolveEffectModifiers.morale = 1;
  bonds.resolveEffectModifiers.activeCheck = 2;

  const result = calculateBonds(bonds, 4);
  const recovery = result.effects.find((effect) => effect.id === "recovery");
  const morale = result.effects.find((effect) => effect.id === "morale");
  const activeCheck = result.effects.find(
    (effect) => effect.id === "activeCheck",
  );

  assert.deepEqual(recovery?.finalValues, ["12d6", "17d6"]);
  assert.deepEqual(morale?.finalValues, ["2", "1d6+1"]);
  assert.deepEqual(activeCheck?.finalValues, ["4d", "5d"]);
});

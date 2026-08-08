import { expect, test } from "vitest";

import { characterSheetDefaultValues } from "../../../src/character-sheet/form/values";
import {
  calculateBonds,
  retainBondRows,
} from "../../../src/character-sheet/logic/bonds";

test("calculateBonds keeps four initial rows and orders resolve effects", () => {
  const result = calculateBonds(characterSheetDefaultValues.bonds, 4);

  expect(result.requiredRowCount).toBe(4);
  expect(result.occupiedCount).toBe(0);
  expect(result.isOverLimit).toBe(false);
  expect(result.effects.map((effect) => effect.id)).toEqual([
    "recovery",
    "morale",
    "activeCheck",
    "passiveCheck",
  ]);
  expect(result.effects[0]?.baseValues).toEqual(["10d6", "15d6"]);
});

test("calculateBonds counts resolved rows and clamps a negative limit to zero", () => {
  const bonds = structuredClone(characterSheetDefaultValues.bonds);

  bonds.rows[0] = { ...bonds.rows[0], target: "アキラ" };
  bonds.rows[1] = { ...bonds.rows[1], isResolved: true };

  const result = calculateBonds(bonds, -1);

  expect(result.effectiveLimit).toBe(0);
  expect(result.occupiedCount).toBe(2);
  expect(result.isOverLimit).toBe(true);
  expect(result.requiredRowCount).toBe(2);
  expect(result.overflowRowIds).toEqual(["bond-1", "bond-2"]);
});

test("retainBondRows removes only empty placeholders after a limit decrease", () => {
  const rows = structuredClone(characterSheetDefaultValues.bonds.rows);
  rows[1] = { ...rows[1], target: "アキラ" };
  rows[3] = { ...rows[3], isResolved: true };

  const retainedRows = retainBondRows(rows, 1);

  expect(retainedRows.map((row) => row.rowId)).toEqual(["bond-2", "bond-4"]);
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

  expect(recovery?.finalValues).toEqual(["12d6", "17d6"]);
  expect(morale?.finalValues).toEqual(["2", "1d6+1"]);
  expect(activeCheck?.finalValues).toEqual(["4d", "5d"]);
});

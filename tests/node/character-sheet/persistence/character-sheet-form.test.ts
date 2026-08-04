import { describe, expect, it } from "vitest";

import { characterSheetDefaultValues } from "../../../../src/character-sheet/form-values";
import { getCybernetics } from "../../../../src/character-sheet/master-data/cybernetics";
import { getDrugs } from "../../../../src/character-sheet/master-data/drugs";
import {
  deleteCharacterSheetForm,
  readCharacterSheetForm,
  writeCharacterSheetForm,
} from "../../../../src/character-sheet/persistence/character-sheet-form";
import { characterSheetFormSchema } from "../../../../src/character-sheet/schemas/character-sheet-form";
import {
  parseCharacterSheetJsonImport,
  parseCharacterSheetRestoreJson,
} from "../../../../src/character-sheet/schemas/character-sheet-persistence";

describe("character sheet form persistence", () => {
  it("round-trips a valid form snapshot", () => {
    const values = {
      ...characterSheetDefaultValues,
      primarySkills: { rows: [{ level: 99, rowId: "skill", skillId: null }] },
    };
    const data = new Map<string, string>();
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      removeItem: (key: string) => data.delete(key),
      setItem: (key: string, value: string) => data.set(key, value),
    };

    writeCharacterSheetForm(storage, values);
    expect(
      parseCharacterSheetRestoreJson(readCharacterSheetForm(storage) ?? ""),
    ).toEqual(values);
  });

  it("removes the stored form snapshot", () => {
    const data = new Map([["neon-underrealm-character-sheet-form", "saved"]]);
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      removeItem: (key: string) => data.delete(key),
      setItem: (key: string, value: string) => data.set(key, value),
    };

    deleteCharacterSheetForm(storage);

    expect(readCharacterSheetForm(storage)).toBe(null);
  });

  it("rejects malformed snapshots without a partial value", () => {
    expect(parseCharacterSheetRestoreJson("{invalid")).toBe(null);
    expect(
      parseCharacterSheetRestoreJson(JSON.stringify({ profile: null })),
    ).toBe(null);
  });

  it("extracts an import image without including it in form validation", () => {
    const snapshot = {
      ...characterSheetDefaultValues,
      imageBase64String: { unexpected: "image value" },
      profile: {
        ...characterSheetDefaultValues.profile,
        pcName: "JSON入力PC",
      },
    };

    const parsed = parseCharacterSheetJsonImport(JSON.stringify(snapshot));
    if (parsed === null) throw new Error("Expected a parsed JSON import.");

    expect(parsed.values.profile.pcName).toBe("JSON入力PC");
    expect(parsed.imageBase64String).toEqual({ unexpected: "image value" });
  });

  it("accepts a missing image property as an image-less JSON import", () => {
    const parsed = parseCharacterSheetJsonImport(
      JSON.stringify(characterSheetDefaultValues),
    );
    if (parsed === null) throw new Error("Expected a parsed JSON import.");

    expect(parsed.imageBase64String).toBe(undefined);
  });

  it("rejects snapshots with broken row identity", () => {
    const duplicateRowId = structuredClone(characterSheetDefaultValues);
    duplicateRowId.primarySkills.rows[1].rowId =
      duplicateRowId.primarySkills.rows[0].rowId;
    expect(parseCharacterSheetRestoreJson(JSON.stringify(duplicateRowId))).toBe(
      null,
    );

    const invalidReactionRow = structuredClone(characterSheetDefaultValues);
    invalidReactionRow.checks.reactions[0].rowId = "wrong-reaction-row";
    expect(
      parseCharacterSheetRestoreJson(JSON.stringify(invalidReactionRow)),
    ).toBe(null);

    const duplicateCategories = structuredClone(characterSheetDefaultValues);
    duplicateCategories.specialItems.categories = ["omamori", "omamori"];
    expect(
      parseCharacterSheetRestoreJson(JSON.stringify(duplicateCategories)),
    ).toBe(null);
  });

  it("keeps game-rule errors while restoring a structurally valid draft", () => {
    const values = structuredClone(characterSheetDefaultValues);
    const drugId = getDrugs()[0]?.id;
    if (drugId === undefined) throw new Error("Expected at least one drug.");
    values.drugs.rows[0].drugId = drugId;
    values.drugs.rows[1].drugId = drugId;

    expect(parseCharacterSheetRestoreJson(JSON.stringify(values))).toEqual(
      values,
    );
  });

  it("retains an explicitly selected reaction attribute while restoring", () => {
    const values = structuredClone(characterSheetDefaultValues);
    const resistance = values.checks.reactions.find(
      ({ name }) => name === "resistance",
    );
    if (resistance === undefined) throw new Error("Expected a resistance row.");
    resistance.attribute = "mind";

    const restored = parseCharacterSheetRestoreJson(JSON.stringify(values));
    if (restored === null) throw new Error("Expected a restored form value.");

    expect(
      restored.checks.reactions.find(({ name }) => name === "resistance")
        ?.attribute,
    ).toBe("mind");
  });

  it("unselects unknown master-data IDs while retaining the rest of the draft", () => {
    const values = structuredClone(characterSheetDefaultValues);
    values.profile.pcName = "復元されるPC";
    values.build.primaryRyugiId = "missing-ryugi";
    values.primarySkills.rows = values.primarySkills.rows.map((row) => ({
      ...row,
      skillId: "missing-primary-skill",
    }));
    values.weapons.rows[0].weaponId = "missing-weapon";
    values.drugs.rows[0].drugId = "missing-drug";

    const restored = parseCharacterSheetRestoreJson(JSON.stringify(values));
    if (restored === null) throw new Error("Expected a restored form value.");
    expect(restored.profile.pcName).toBe("復元されるPC");
    expect(restored.build.primaryRyugiId).toBe(null);
    expect(restored.primarySkills.rows.length).toBe(1);
    expect(restored.primarySkills.rows[0].skillId).toBe(null);
    expect(restored.weapons.rows[0].weaponId).toBe(null);
    expect(restored.weapons.rows[0].rowId).toBe("restore-weapon-1");
    expect(restored.drugs.rows.length).toBe(values.drugs.rows.length - 1);
  });

  it("retains a blank other-ryugi skill row after removing an unknown skill", () => {
    const values = structuredClone(characterSheetDefaultValues);
    values.build.otherRyugi = [
      { level: 1, rowId: "other-ryugi", ryugiId: "kenkaya" },
    ];
    values.otherRyugiSkills.rows = [
      {
        level: 1,
        rowId: "unknown-other-ryugi-skill",
        ryugiRowId: "other-ryugi",
        skillId: "missing-skill",
      },
    ];

    const restored = parseCharacterSheetRestoreJson(JSON.stringify(values));
    if (restored === null) throw new Error("Expected a restored form value.");

    expect(restored.otherRyugiSkills.rows).toEqual([
      {
        level: 1,
        rowId: "restore-other-ryugi-skill-other-ryugi",
        ryugiRowId: "other-ryugi",
        skillId: null,
      },
    ]);
  });

  it("assigns a distinct row ID when an other-ryugi skill fallback collides", () => {
    const values = structuredClone(characterSheetDefaultValues);
    values.build.otherRyugi = [
      { level: 1, rowId: "other-a", ryugiId: "kenkaya" },
      { level: 1, rowId: "other-b", ryugiId: "emono" },
    ];
    values.otherRyugiSkills.rows = [
      {
        level: 1,
        rowId: "restore-other-ryugi-skill-other-b",
        ryugiRowId: "other-a",
        skillId: null,
      },
      {
        level: 1,
        rowId: "unknown-other-b-skill",
        ryugiRowId: "other-b",
        skillId: "missing-skill",
      },
    ];

    const restored = parseCharacterSheetRestoreJson(JSON.stringify(values));
    if (restored === null) throw new Error("Expected a restored form value.");

    expect(
      new Set(restored.otherRyugiSkills.rows.map((row) => row.rowId)).size,
    ).toEqual(restored.otherRyugiSkills.rows.length);
    expect(
      restored.otherRyugiSkills.rows.some(
        (row) =>
          row.ryugiRowId === "other-b" &&
          row.rowId === "restore-other-ryugi-skill-other-b-1",
      ),
    ).toBeTruthy();
  });

  it("retains an incompatible fixed cybernetic for the form error state", () => {
    const armCybernetic = getCybernetics().find(
      (cybernetic) => cybernetic.part === "腕",
    );
    if (armCybernetic === undefined) {
      throw new Error("Expected an arm cybernetic.");
    }
    const values = structuredClone(characterSheetDefaultValues);
    values.cybernetics.headId = armCybernetic.id;

    const restored = parseCharacterSheetRestoreJson(JSON.stringify(values));
    if (restored === null) throw new Error("Expected a restored form value.");

    expect(restored.cybernetics.headId).toBe(armCybernetic.id);
    expect(characterSheetFormSchema.safeParse(restored).success).toBe(false);
  });
});

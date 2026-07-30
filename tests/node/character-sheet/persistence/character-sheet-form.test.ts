import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { characterSheetDefaultValues } from "../../../../src/character-sheet/form-values";
import { getDrugs } from "../../../../src/character-sheet/master-data/drugs";
import {
  readCharacterSheetForm,
  writeCharacterSheetForm,
} from "../../../../src/character-sheet/persistence/character-sheet-form";
import { parseCharacterSheetRestoreJson } from "../../../../src/character-sheet/schemas/character-sheet-persistence";

describe("character sheet form persistence", () => {
  it("round-trips a valid form snapshot", () => {
    const values = {
      ...characterSheetDefaultValues,
      primarySkills: { rows: [{ level: 99, rowId: "skill", skillId: null }] },
    };
    const data = new Map<string, string>();
    const storage = {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => data.set(key, value),
    };

    writeCharacterSheetForm(storage, values);
    assert.deepEqual(
      parseCharacterSheetRestoreJson(readCharacterSheetForm(storage) ?? ""),
      values,
    );
  });

  it("rejects malformed snapshots without a partial value", () => {
    assert.equal(parseCharacterSheetRestoreJson("{invalid"), null);
    assert.equal(
      parseCharacterSheetRestoreJson(JSON.stringify({ profile: null })),
      null,
    );
  });

  it("rejects snapshots with broken row identity", () => {
    const duplicateRowId = structuredClone(characterSheetDefaultValues);
    duplicateRowId.primarySkills.rows[1].rowId =
      duplicateRowId.primarySkills.rows[0].rowId;
    assert.equal(
      parseCharacterSheetRestoreJson(JSON.stringify(duplicateRowId)),
      null,
    );

    const invalidReactionRow = structuredClone(characterSheetDefaultValues);
    invalidReactionRow.checks.reactions[0].rowId = "wrong-reaction-row";
    assert.equal(
      parseCharacterSheetRestoreJson(JSON.stringify(invalidReactionRow)),
      null,
    );
  });

  it("keeps game-rule errors while restoring a structurally valid draft", () => {
    const values = structuredClone(characterSheetDefaultValues);
    const drugId = getDrugs()[0]?.id;
    if (drugId === undefined) throw new Error("Expected at least one drug.");
    values.drugs.rows[0].drugId = drugId;
    values.drugs.rows[1].drugId = drugId;

    assert.deepEqual(
      parseCharacterSheetRestoreJson(JSON.stringify(values)),
      values,
    );
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
    assert.equal(restored.profile.pcName, "復元されるPC");
    assert.equal(restored.build.primaryRyugiId, null);
    assert.equal(restored.primarySkills.rows.length, 1);
    assert.equal(restored.primarySkills.rows[0].skillId, null);
    assert.equal(restored.weapons.rows[0].weaponId, null);
    assert.equal(restored.weapons.rows[0].rowId, "restore-weapon-1");
    assert.equal(restored.drugs.rows.length, values.drugs.rows.length - 1);
  });
});

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { characterSheetDefaultValues } from "../../../../src/character-sheet/form-values";
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
});

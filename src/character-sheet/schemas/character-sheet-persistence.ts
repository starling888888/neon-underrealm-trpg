import type { CharacterSheetFormValues } from "../form-values";
import {
  getCharacterSheetIkizamaOptions,
  getCharacterSheetRyugiOptions,
} from "../master-data/build";
import { getCommonSkillById } from "../master-data/common-skills";
import { getCyberneticById } from "../master-data/cybernetics";
import { getDrugById } from "../master-data/drugs";
import { getIkizamaSkillById } from "../master-data/ikizama-skills";
import { getNanomachineById } from "../master-data/nanomachines";
import { getOmamoriById } from "../master-data/omamori";
import { getOtherRyugiSkillById } from "../master-data/other-ryugi-skills";
import { getPrimarySkillById } from "../master-data/primary-skills";
import { getArmorById, getWeaponById } from "../master-data/weapons-and-armor";
import { characterSheetRestoreInputSchema } from "./character-sheet-form";

/**
 * Validates the JSON-import boundary without applying visible game-rule errors
 * from the live RHF resolver. Unknown master-data IDs become unselected.
 */
export const characterSheetRestoreSchema =
  characterSheetRestoreInputSchema.transform(
    (values): CharacterSheetFormValues => {
      const selectedId = (
        id: string | null,
        isKnown: (id: string) => boolean,
      ) => (id === null || isKnown(id) ? id : null);
      const ensureMinimumRows = <TRow extends { rowId: string }>(
        rows: TRow[],
        minimum: number,
        createRow: (index: number) => TRow,
      ) => {
        const rowIds = new Set(rows.map((row) => row.rowId));
        let rowNumber = rows.length + 1;
        while (rows.length < minimum) {
          const row = createRow(rowNumber);
          rowNumber += 1;
          if (rowIds.has(row.rowId)) continue;
          rowIds.add(row.rowId);
          rows.push(row);
        }
        return rows;
      };
      const ryugiIds = new Set(
        getCharacterSheetRyugiOptions().map(({ id }) => id),
      );
      const ikizamaIds = new Set(
        getCharacterSheetIkizamaOptions().map(({ id }) => id),
      );
      values.build.primaryRyugiId = selectedId(
        values.build.primaryRyugiId,
        (id) => ryugiIds.has(id),
      );
      values.build.ikizamaId = selectedId(values.build.ikizamaId, (id) =>
        ikizamaIds.has(id),
      );
      values.build.otherRyugi = values.build.otherRyugi.filter(
        (row) => row.ryugiId === null || ryugiIds.has(row.ryugiId),
      );
      const otherIds = new Map(
        values.build.otherRyugi.map((row) => [row.rowId, row.ryugiId]),
      );
      values.primarySkills.rows = ensureMinimumRows(
        values.primarySkills.rows.filter(
          (row) =>
            row.skillId === null ||
            getPrimarySkillById(values.build.primaryRyugiId, row.skillId) !==
              null,
        ),
        1,
        (index) => ({
          level: 1,
          rowId: `restore-primary-skill-${index}`,
          skillId: null,
        }),
      );
      values.ikizamaSkills.rows = values.ikizamaSkills.rows.filter(
        (row) =>
          row.skillId === null ||
          getIkizamaSkillById(values.build.ikizamaId, row.skillId) !== null,
      );
      values.commonSkills.rows = ensureMinimumRows(
        values.commonSkills.rows.filter(
          (row) =>
            row.skillId === null || getCommonSkillById(row.skillId) !== null,
        ),
        1,
        (index) => ({
          level: 1,
          rowId: `restore-common-skill-${index}`,
          skillId: null,
        }),
      );
      values.otherRyugiSkills.rows = values.otherRyugiSkills.rows.flatMap(
        (row) => {
          const ryugiId = otherIds.get(row.ryugiRowId);
          if (ryugiId === undefined) return [];

          return row.skillId === null ||
            getOtherRyugiSkillById(ryugiId, row.skillId) !== null
            ? [row]
            : [];
        },
      );
      values.weapons.rows = ensureMinimumRows(
        values.weapons.rows.filter(
          (row) =>
            row.weaponId === null || getWeaponById(row.weaponId) !== null,
        ),
        1,
        (index) => ({
          attackModifier: null,
          guardModifier: null,
          rowId: `restore-weapon-${index}`,
          weaponId: null,
        }),
      );
      values.omamori.rows = values.omamori.rows.filter(
        (row) =>
          row.omamoriId === null || getOmamoriById(row.omamoriId) !== null,
      );
      values.drugs.rows = values.drugs.rows.filter(
        (row) => row.drugId === null || getDrugById(row.drugId) !== null,
      );
      values.cybernetics.otherRows = ensureMinimumRows(
        values.cybernetics.otherRows.filter(
          (row) =>
            row.cyberneticId === null ||
            getCyberneticById(row.cyberneticId) !== null,
        ),
        1,
        (index) => ({
          cyberneticId: null,
          rowId: `restore-cybernetic-other-${index}`,
        }),
      );
      for (const field of ["headId", "torsoId", "armId", "legId"] as const) {
        values.cybernetics[field] = selectedId(
          values.cybernetics[field],
          (id) => getCyberneticById(id) !== null,
        );
        values.nanomachines[field] = selectedId(
          values.nanomachines[field],
          (id) => getNanomachineById(id) !== null,
        );
      }
      values.armor.armorId = selectedId(
        values.armor.armorId,
        (id) => getArmorById(id) !== null,
      );
      return values;
    },
  );

/** Parses an external snapshot without changing the current RHF state. */
export function parseCharacterSheetRestoreValue(
  value: unknown,
): CharacterSheetFormValues | null {
  const parsed = characterSheetRestoreSchema.safeParse(value);

  return parsed.success ? parsed.data : null;
}

/** Shared boundary for localStorage and the future JSON import Gate. */
export function parseCharacterSheetRestoreJson(
  text: string,
): CharacterSheetFormValues | null {
  try {
    return parseCharacterSheetRestoreValue(JSON.parse(text));
  } catch {
    return null;
  }
}

export type CharacterSheetJsonImport = {
  imageBase64String: unknown;
  values: CharacterSheetFormValues;
};

/** Parses the current JSON export shape without accepting image data as form data. */
export function parseCharacterSheetJsonImport(
  text: string,
): CharacterSheetJsonImport | null {
  try {
    const parsed: unknown = JSON.parse(text);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      Array.isArray(parsed)
    ) {
      return null;
    }

    const { imageBase64String, ...formValue } = parsed as Record<
      string,
      unknown
    >;
    const values = parseCharacterSheetRestoreValue(formValue);

    return values === null ? null : { imageBase64String, values };
  } catch {
    return null;
  }
}

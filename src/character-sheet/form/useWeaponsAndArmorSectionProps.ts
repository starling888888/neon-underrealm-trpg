import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";

import type { WeaponsAndArmorSectionProps } from "../components/WeaponsAndArmorSection";
import type { CharacterSheetFormValues, WeaponValues } from "../form-values";
import { getModifiedItemValue } from "../logic/item-values";
import { getArmorById, getWeaponById } from "../master-data/weapons-and-armor";
import { normalizeOptionalIntegerInput } from "../schemas/character-sheet-form";

type Options = {
  onArmorPickerRequest: (trigger: HTMLButtonElement) => void;
  onWeaponPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
};

function createWeaponRow(): WeaponValues {
  return {
    attackModifier: null,
    guardModifier: null,
    rowId: crypto.randomUUID(),
    weaponId: null,
  };
}

export default function useWeaponsAndArmorSectionProps(
  { control, getValues, setValue }: UseFormReturn<CharacterSheetFormValues>,
  options: Options,
): WeaponsAndArmorSectionProps {
  const { append, move, remove, update } = useFieldArray({
    control,
    keyName: "fieldKey",
    name: "weapons.rows",
  });
  const weapons = useWatch({ control, name: "weapons" });
  const armor = useWatch({ control, name: "armor" });

  function getWeaponRows(): WeaponValues[] {
    return getValues("weapons.rows");
  }

  const weaponRows = weapons.rows.map((row) => {
    const weapon = getWeaponById(row.weaponId);
    return {
      ...row,
      attack: getModifiedItemValue(weapon?.attack ?? null, row.attackModifier),
      guard: getModifiedItemValue(weapon?.guard ?? null, row.guardModifier),
      weapon,
    };
  });
  const selectedArmor = getArmorById(armor.armorId);

  return {
    armor: {
      ...armor,
      armor: selectedArmor,
      damageReduction: getModifiedItemValue(
        selectedArmor?.damageReduction ?? null,
        armor.damageReductionModifier,
      ),
      defense: getModifiedItemValue(
        selectedArmor?.defense ?? null,
        armor.defenseModifier,
      ),
    },
    onAddWeapon: () => append(createWeaponRow()),
    onArmorModifierChange: (field, value) =>
      setValue(`armor.${field}`, normalizeOptionalIntegerInput(value), {
        shouldDirty: true,
      }),
    onArmorPickerRequest: options.onArmorPickerRequest,
    onArmorSelect: (armorId) =>
      setValue("armor.armorId", armorId, { shouldDirty: true }),
    onClearArmor: () =>
      setValue(
        "armor",
        { armorId: null, damageReductionModifier: null, defenseModifier: null },
        { shouldDirty: true },
      ),
    onMoveWeapon: (rowId, direction) => {
      const rows = getWeaponRows();
      const index = rows.findIndex((row) => row.rowId === rowId);
      const next = index + (direction === "up" ? -1 : 1);
      if (index >= 0 && next >= 0 && next < rows.length) move(index, next);
    },
    onRemoveWeapon: (rowId) => {
      const rows = getWeaponRows();
      const index = rows.findIndex((row) => row.rowId === rowId);
      if (rows.length > 1 && index >= 0) remove(index);
    },
    onWeaponModifierChange: (rowId, field, value) => {
      const rows = getWeaponRows();
      const index = rows.findIndex((row) => row.rowId === rowId);
      const row = rows[index];
      if (row !== undefined && index >= 0) {
        update(index, {
          ...row,
          [field]: normalizeOptionalIntegerInput(value),
        });
      }
    },
    onWeaponPickerRequest: options.onWeaponPickerRequest,
    onWeaponSelect: (rowId, weaponId) => {
      const rows = getWeaponRows();
      const index = rows.findIndex((row) => row.rowId === rowId);
      const row = rows[index];
      if (row !== undefined && index >= 0) update(index, { ...row, weaponId });
    },
    weaponRows,
  };
}

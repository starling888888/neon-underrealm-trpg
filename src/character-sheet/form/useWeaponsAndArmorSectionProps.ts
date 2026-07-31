import { useCallback, useMemo } from "react";
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

  const getWeaponRows = useCallback(
    (): WeaponValues[] => getValues("weapons.rows"),
    [getValues],
  );
  const weaponRows = useMemo(
    () =>
      weapons.rows.map((row) => {
        const weapon = getWeaponById(row.weaponId);
        return {
          ...row,
          attack: getModifiedItemValue(
            weapon?.attack ?? null,
            row.attackModifier,
          ),
          guard: getModifiedItemValue(weapon?.guard ?? null, row.guardModifier),
          weapon,
        };
      }),
    [weapons.rows],
  );
  const selectedArmor = useMemo(
    () => getArmorById(armor.armorId),
    [armor.armorId],
  );
  const armorProps = useMemo(
    () => ({
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
    }),
    [armor, selectedArmor],
  );
  const onAddWeapon = useCallback(() => append(createWeaponRow()), [append]);
  const onArmorModifierChange = useCallback(
    (field: "damageReductionModifier" | "defenseModifier", value: string) =>
      setValue(`armor.${field}`, normalizeOptionalIntegerInput(value), {
        shouldDirty: true,
      }),
    [setValue],
  );
  const onArmorSelect = useCallback(
    (armorId: string | null) =>
      setValue("armor.armorId", armorId, { shouldDirty: true }),
    [setValue],
  );
  const onClearArmor = useCallback(
    () =>
      setValue(
        "armor",
        { armorId: null, damageReductionModifier: null, defenseModifier: null },
        { shouldDirty: true },
      ),
    [setValue],
  );
  const onMoveWeapon = useCallback(
    (rowId: string, direction: "up" | "down") => {
      const rows = getWeaponRows();
      const index = rows.findIndex((row) => row.rowId === rowId);
      const next = index + (direction === "up" ? -1 : 1);
      if (index >= 0 && next >= 0 && next < rows.length) move(index, next);
    },
    [getWeaponRows, move],
  );
  const onRemoveWeapon = useCallback(
    (rowId: string) => {
      const rows = getWeaponRows();
      const index = rows.findIndex((row) => row.rowId === rowId);
      if (rows.length > 1 && index >= 0) remove(index);
    },
    [getWeaponRows, remove],
  );
  const onWeaponModifierChange = useCallback(
    (
      rowId: string,
      field: "attackModifier" | "guardModifier",
      value: string,
    ) => {
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
    [getWeaponRows, update],
  );
  const onWeaponSelect = useCallback(
    (rowId: string, weaponId: string | null) => {
      const rows = getWeaponRows();
      const index = rows.findIndex((row) => row.rowId === rowId);
      const row = rows[index];
      if (row !== undefined && index >= 0) update(index, { ...row, weaponId });
    },
    [getWeaponRows, update],
  );

  return useMemo(
    () => ({
      armor: armorProps,
      onAddWeapon,
      onArmorModifierChange,
      onArmorPickerRequest: options.onArmorPickerRequest,
      onArmorSelect,
      onClearArmor,
      onMoveWeapon,
      onRemoveWeapon,
      onWeaponModifierChange,
      onWeaponPickerRequest: options.onWeaponPickerRequest,
      onWeaponSelect,
      weaponRows,
    }),
    [
      armorProps,
      onAddWeapon,
      onArmorModifierChange,
      onArmorSelect,
      onClearArmor,
      onMoveWeapon,
      onRemoveWeapon,
      onWeaponModifierChange,
      onWeaponSelect,
      options.onArmorPickerRequest,
      options.onWeaponPickerRequest,
      weaponRows,
    ],
  );
}

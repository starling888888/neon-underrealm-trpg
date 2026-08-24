// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";

import useWeaponsAndArmorSectionProps from "../../../src/character-sheet/form/useWeaponsAndArmorSectionProps";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form/values";
import {
  getArmors,
  getWeaponCandidateGroups,
} from "../../../src/character-sheet/master-data/weapons-and-armor";

function useWeaponsAndArmorHarness() {
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
  });
  const props = useWeaponsAndArmorSectionProps(form, {
    onArmorPickerRequest: vi.fn(),
    onWeaponPickerRequest: vi.fn(),
  });

  return { form, props };
}

describe("useWeaponsAndArmorSectionProps", () => {
  it("keeps one weapon row while supporting duplicate selection and movement", () => {
    const { result } = renderHook(() => useWeaponsAndArmorHarness());
    const weapon = getWeaponCandidateGroups(null)[0]?.weapons[0];
    if (weapon === undefined) throw new Error("通常武器がありません。");

    const firstRowId = result.current.form.getValues("weapons.rows.0.rowId");
    act(() => {
      result.current.props.onWeaponSelect(firstRowId, weapon.id);
      result.current.props.onAddWeapon();
    });

    const secondRowId = result.current.form.getValues("weapons.rows.1.rowId");
    act(() => {
      result.current.props.onWeaponSelect(secondRowId, weapon.id);
      result.current.props.onMoveWeapon(secondRowId, "up");
    });

    expect(result.current.form.getValues("weapons.rows")).toHaveLength(2);
    expect(result.current.form.getValues("weapons.rows.0.weaponId")).toBe(
      weapon.id,
    );
    expect(result.current.form.getValues("weapons.rows.1.weaponId")).toBe(
      weapon.id,
    );

    act(() => {
      result.current.props.onRemoveWeapon(firstRowId);
      result.current.props.onRemoveWeapon(secondRowId);
    });

    expect(result.current.form.getValues("weapons.rows")).toHaveLength(1);
  });

  it("normalizes armor modifiers and clears the ID and both modifiers together", () => {
    const { result } = renderHook(() => useWeaponsAndArmorHarness());
    const armor = getArmors()[0];
    if (armor === undefined) throw new Error("防具がありません。");

    act(() => {
      result.current.props.onArmorSelect(armor.id);
      result.current.props.onArmorModifierChange("defenseModifier", "1.9");
      result.current.props.onArmorModifierChange(
        "damageReductionModifier",
        "-2",
      );
    });

    expect(result.current.form.getValues("armor")).toEqual({
      armorId: armor.id,
      damageReductionModifier: -2,
      defenseModifier: 1,
    });

    act(() => result.current.props.onClearArmor());

    expect(result.current.form.getValues("armor")).toEqual({
      armorId: null,
      damageReductionModifier: null,
      defenseModifier: null,
    });
  });
});

// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import WeaponsAndArmorSection, {
  type WeaponsAndArmorSectionProps,
} from "../../../src/character-sheet/components/sections/WeaponsAndArmorSection";
import {
  getArmors,
  getWeaponCandidateGroups,
} from "../../../src/character-sheet/master-data/weapons-and-armor";

function createProps(): WeaponsAndArmorSectionProps {
  const weapon = getWeaponCandidateGroups(null)[0]?.weapons[0];
  const armor = getArmors()[0];
  if (weapon === undefined || armor === null) {
    throw new Error("武器または防具fixtureがありません。");
  }

  return {
    armor: {
      armor,
      damageReduction:
        typeof armor.damageReduction === "number"
          ? armor.damageReduction
          : null,
      damageReductionModifier: 3,
      defense: armor.defense,
      defenseModifier: 1,
    },
    onAddWeapon: vi.fn(),
    onArmorModifierChange: vi.fn(),
    onArmorPickerRequest: vi.fn(),
    onArmorSelect: vi.fn(),
    onClearArmor: vi.fn(),
    onMoveWeapon: vi.fn(),
    onRemoveWeapon: vi.fn(),
    onWeaponModifierChange: vi.fn(),
    onWeaponPickerRequest: vi.fn(),
    onWeaponSelect: vi.fn(),
    weaponRows: [
      {
        attack: weapon.attack === "特殊" ? null : weapon.attack,
        attackModifier: null,
        guard: weapon.guard === "特殊" ? null : weapon.guard,
        guardModifier: null,
        rowId: "weapon-a",
        weapon,
      },
      {
        attack: weapon.attack === "特殊" ? null : weapon.attack,
        attackModifier: null,
        guard: weapon.guard === "特殊" ? null : weapon.guard,
        guardModifier: null,
        rowId: "weapon-b",
        weapon,
      },
    ],
  };
}

afterEach(cleanup);

describe("WeaponsAndArmorSection", () => {
  it("gives duplicate weapon rows distinct accessible names that follow display order", () => {
    const props = createProps();

    render(<WeaponsAndArmorSection {...props} />);

    expect(screen.getAllByRole("region", { name: "武器" })).toHaveLength(1);
    expect(screen.getAllByRole("region", { name: "防具" })).toHaveLength(1);
    expect(screen.getByRole("group", { name: "武器1：刀" })).not.toBeNull();
    expect(screen.getByRole("group", { name: "武器2：刀" })).not.toBeNull();
    expect(screen.getAllByLabelText("武器1：刀攻撃力の修正")).toHaveLength(2);
    expect(screen.getAllByLabelText("武器2：刀攻撃力の修正")).toHaveLength(2);
    expect(
      screen.getByRole("button", { name: "武器1：刀詳細を開く" }),
    ).not.toBeNull();
    expect(
      screen.getByRole("button", { name: "武器2：刀を削除" }),
    ).not.toBeNull();
  });

  it("keeps every armor modifier input synchronized when external props clear it", () => {
    const props = createProps();
    const { rerender } = render(<WeaponsAndArmorSection {...props} />);

    for (const input of screen.getAllByLabelText("チンピラ服防御力の修正")) {
      expect((input as HTMLInputElement).value).toBe("1");
    }
    for (const input of screen.getAllByLabelText(
      "チンピラ服ダメージ軽減の修正",
    )) {
      expect((input as HTMLInputElement).value).toBe("3");
    }

    rerender(
      <WeaponsAndArmorSection
        {...props}
        armor={{
          ...props.armor,
          damageReductionModifier: null,
          defenseModifier: null,
        }}
      />,
    );

    for (const input of screen.getAllByLabelText("チンピラ服防御力の修正")) {
      expect((input as HTMLInputElement).value).toBe("");
    }
    for (const input of screen.getAllByLabelText(
      "チンピラ服ダメージ軽減の修正",
    )) {
      expect((input as HTMLInputElement).value).toBe("");
    }
  });

  it("reports modifier changes and toggles weapon details", () => {
    const props = createProps();
    render(<WeaponsAndArmorSection {...props} />);

    fireEvent.change(screen.getAllByLabelText("武器1：刀攻撃力の修正")[0], {
      target: { value: "-2" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "武器1：刀詳細を開く" }),
    );

    expect(props.onWeaponModifierChange).toHaveBeenCalledWith(
      "weapon-a",
      "attackModifier",
      "-2",
    );
    expect(
      screen.getByRole("button", { name: "武器1：刀詳細を閉じる" }),
    ).not.toBeNull();
  });
});

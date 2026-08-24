import { getItemsData } from "../../lib/data/items";
import type { Armor, Weapon, WeaponCheckKey } from "../../lib/types/item";

export type WeaponCandidateGroup = {
  heading?: string;
  id: string;
  weapons: readonly Weapon[];
};

const normalWeaponGroups: readonly [WeaponCheckKey, string][] = [
  ["kenka", "喧嘩"],
  ["ansatsu", "暗殺"],
  ["happou", "発砲"],
  ["kakutou", "格闘"],
  ["kanshou", "干渉"],
];

function allWeapons(): readonly Weapon[] {
  return Object.values(getItemsData().weapons).flatMap((byCheck) =>
    byCheck === undefined
      ? []
      : Object.values(byCheck).flatMap((weapons) => weapons ?? []),
  );
}

export function getWeaponCandidateGroups(
  ikizamaId: string | null,
): readonly WeaponCandidateGroup[] {
  const weapons = getItemsData().weapons;
  const normal = weapons.normal;
  const groups = normalWeaponGroups.map(([checkKey, heading]) => ({
    heading,
    id: `normal-${checkKey}`,
    weapons: normal?.[checkKey] ?? [],
  }));

  if (ikizamaId === "sumi") {
    groups.push({
      heading: "武器化ナノマシン",
      id: "nanomachines",
      weapons: Object.values(weapons.nanomachines ?? {}).flatMap(
        (items) => items ?? [],
      ),
    });
  }
  if (ikizamaId === "kejime") {
    groups.push({
      heading: "サイバネ武器",
      id: "cybernetics",
      weapons: Object.values(weapons.cybernetics ?? {}).flatMap(
        (items) => items ?? [],
      ),
    });
  }

  return groups;
}

export function getWeaponById(id: string | null): Weapon | null {
  if (id === null) return null;
  return allWeapons().find((weapon) => weapon.id === id) ?? null;
}

export function getArmorById(id: string | null): Armor | null {
  if (id === null) return null;
  return getItemsData().armors.find((armor) => armor.id === id) ?? null;
}

export function getArmors(): readonly Armor[] {
  return getItemsData().armors;
}

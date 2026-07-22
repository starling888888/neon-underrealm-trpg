import itemsJson from "../../../data/generated/items.json";
import type { Cybernetic, ItemsData, ItemsJson, Weapon } from "../schemas/item";

const generatedItemsJson = itemsJson as ItemsJson;

export function getItemsJson(): ItemsJson {
  return generatedItemsJson;
}

export function getItemsData(): ItemsData {
  return getItemsJson().data;
}

export function getWeapons(
  group: string,
  checkKey: string,
): Weapon[] | undefined {
  const checks = getItemsData().weapons[group as keyof ItemsData["weapons"]];
  return checks?.[checkKey as keyof typeof checks];
}

export function getCybernetics(part: string): Cybernetic[] | undefined {
  return getItemsData().cybernetics[part as keyof ItemsData["cybernetics"]];
}

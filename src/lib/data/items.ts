import itemsJson from "../../../data/generated/items.json";
import type { Cybernetic, ItemsData, ItemsJson, Weapon } from "../types/item";

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
  const checks = getOwnValue(getItemsData().weapons, group);
  if (!checks) return undefined;

  return getOwnValue(checks, checkKey);
}

export function getCybernetics(part: string): Cybernetic[] | undefined {
  return getOwnValue(getItemsData().cybernetics, part);
}

function getOwnValue<Value>(record: object, key: string): Value | undefined {
  if (!Object.hasOwn(record, key)) return undefined;
  return (record as Record<string, Value | undefined>)[key];
}

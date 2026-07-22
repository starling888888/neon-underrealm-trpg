import itemsJson from "../../../data/generated/items.json";
import {
  type Cybernetic,
  CyberneticPartKeySchema,
  type ItemsData,
  type ItemsJson,
  type Weapon,
  WeaponCheckKeySchema,
  WeaponGroupSchema,
} from "../schemas/item";

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
  const parsedGroup = WeaponGroupSchema.safeParse(group);
  const parsedCheckKey = WeaponCheckKeySchema.safeParse(checkKey);
  if (!parsedGroup.success || !parsedCheckKey.success) return undefined;

  return getItemsData().weapons[parsedGroup.data]?.[parsedCheckKey.data];
}

export function getCybernetics(part: string): Cybernetic[] | undefined {
  const parsedPart = CyberneticPartKeySchema.safeParse(part);
  if (!parsedPart.success) return undefined;

  return getItemsData().cybernetics[parsedPart.data];
}

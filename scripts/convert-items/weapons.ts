import {
  createWeaponCheckKey,
  createWeaponId,
  WeaponCheckSchema,
  WeaponGroupSchema,
  WeaponKindSchema,
} from "../../src/lib/schemas/conversion/item";
import type {
  Weapon,
  WeaponCheck,
  WeaponGroup,
  WeaponKind,
  WeaponsByGroup,
} from "../../src/lib/types/item";
import {
  cellLocation,
  collectItemSheetRows,
  type ItemRows,
  optionalNonNegativeInteger,
  optionalText,
  requiredNonNegativeInteger,
  requiredText,
} from "./shared";

const HEADERS = [
  "区分",
  "名称",
  "信用",
  "射程",
  "種別",
  "判定",
  "攻撃力",
  "ガード値",
  "装弾数",
  "効果",
] as const;

export function convertWeapons(rows: ItemRows): WeaponsByGroup {
  const data: WeaponsByGroup = {};
  for (const sheetRow of collectItemSheetRows({
    rows,
    headers: HEADERS,
    nameColumn: 1,
  })) {
    const { row, rowNumber, sourceOrder } = sheetRow;
    const group = enumValue<WeaponGroup>(
      row[0],
      "区分",
      rowNumber,
      0,
      WeaponGroupSchema,
    );
    const name = requiredText(row[1], "名称", rowNumber, 1);
    const check = enumValue<WeaponCheck>(
      row[5],
      "判定",
      rowNumber,
      5,
      WeaponCheckSchema,
    );
    const weapon: Weapon = {
      id: createWeaponId({ group, check, name }),
      group,
      name,
      credit: optionalNonNegativeInteger(row[2], "信用", rowNumber, 2),
      range: weaponRange(row[3], rowNumber),
      kind: enumValue<WeaponKind>(
        row[4],
        "種別",
        rowNumber,
        4,
        WeaponKindSchema,
      ),
      check,
      attack: specialNumber(row[6], "攻撃力", rowNumber, 6),
      guard: specialNumber(row[7], "ガード値", rowNumber, 7),
      ammo: optionalNonNegativeInteger(row[8], "装弾数", rowNumber, 8),
      effect: optionalText(row[9], "効果", rowNumber, 9),
      sourceOrder,
    };
    const checkKey = createWeaponCheckKey(check);
    let checks = data[group];
    if (!checks) {
      checks = {};
      data[group] = checks;
    }
    let items = checks[checkKey];
    if (!items) {
      items = [];
      checks[checkKey] = items;
    }
    items.push(weapon);
  }
  return data;
}

function weaponRange(
  value: ItemRows[number][number] | undefined,
  row: number,
): number | "シーン" {
  if (value === "シーン") return value;
  return requiredNonNegativeInteger(value, "射程", row, 3);
}

function specialNumber(
  value: ItemRows[number][number] | undefined,
  label: string,
  row: number,
  column: number,
): number | "特殊" | null {
  if (value === "特殊") return value;
  return optionalNonNegativeInteger(value, label, row, column);
}

function enumValue<Output extends string>(
  value: ItemRows[number][number] | undefined,
  label: string,
  row: number,
  column: number,
  schema: { safeParse(value: unknown): { success: boolean } },
): Output {
  const result = requiredText(value, label, row, column);
  if (!schema.safeParse(result).success) {
    throw new Error(`${label} is invalid at ${cellLocation(row, column)}.`);
  }
  return result as Output;
}

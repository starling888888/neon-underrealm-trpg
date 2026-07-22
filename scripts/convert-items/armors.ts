import { type Armor, createArmorId } from "../../src/lib/schemas/item";
import {
  collectItemSheetRows,
  type ItemRows,
  optionalNonNegativeInteger,
  optionalText,
  requiredNonNegativeInteger,
  requiredText,
} from "./shared";

const HEADERS = [
  "名称",
  "信用",
  "防御力",
  "ダメージ軽減",
  "制限",
  "効果",
] as const;

export function convertArmors(rows: ItemRows): Armor[] {
  return collectItemSheetRows({ rows, headers: HEADERS, nameColumn: 0 }).map(
    ({ row, rowNumber, sourceOrder }) => {
      const name = requiredText(row[0], "名称", rowNumber, 0);
      const damageReduction = specialNumber(row[3], rowNumber);
      return {
        id: createArmorId(name),
        name,
        credit: optionalNonNegativeInteger(row[1], "信用", rowNumber, 1),
        defense: requiredNonNegativeInteger(row[2], "防御力", rowNumber, 2),
        damageReduction,
        restriction: optionalText(row[4], "制限", rowNumber, 4),
        effect: optionalText(row[5], "効果", rowNumber, 5),
        sourceOrder,
      } satisfies Armor;
    },
  );
}

function specialNumber(
  value: ItemRows[number][number] | undefined,
  row: number,
): number | "特殊" | null {
  if (value === "特殊") return value;
  return optionalNonNegativeInteger(value, "ダメージ軽減", row, 3);
}

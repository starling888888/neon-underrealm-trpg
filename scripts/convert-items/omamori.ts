import { createOmamoriId, type Omamori } from "../../src/lib/schemas/item";
import {
  collectItemSheetRows,
  type ItemRows,
  optionalNonNegativeInteger,
  requiredText,
} from "./shared";

const HEADERS = ["名称", "信用", "効果"] as const;

export function convertOmamori(rows: ItemRows): Omamori[] {
  return collectItemSheetRows({ rows, headers: HEADERS, nameColumn: 0 }).map(
    ({ row, rowNumber, sourceOrder }) => {
      const name = requiredText(row[0], "名称", rowNumber, 0);
      return {
        id: createOmamoriId(name),
        name,
        credit: optionalNonNegativeInteger(row[1], "信用", rowNumber, 1),
        effect: requiredText(row[2], "効果", rowNumber, 2),
        sourceOrder,
      } satisfies Omamori;
    },
  );
}

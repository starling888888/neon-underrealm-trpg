import { createNanomachineId } from "../../src/lib/schemas/conversion/item";
import type { Nanomachine } from "../../src/lib/types/item";
import {
  collectItemSheetRows,
  type ItemRows,
  optionalNonNegativeInteger,
  requiredNonNegativeInteger,
  requiredText,
} from "./shared";

const HEADERS = ["名称", "信用", "埋め込み点数", "発動精神力", "効果"] as const;

export function convertNanomachines(rows: ItemRows): Nanomachine[] {
  return collectItemSheetRows({ rows, headers: HEADERS, nameColumn: 0 }).map(
    ({ row, rowNumber, sourceOrder }) => {
      const name = requiredText(row[0], "名称", rowNumber, 0);
      return {
        id: createNanomachineId(name),
        name,
        credit: optionalNonNegativeInteger(row[1], "信用", rowNumber, 1),
        implantPoints: requiredNonNegativeInteger(
          row[2],
          "埋め込み点数",
          rowNumber,
          2,
        ),
        activationMentalCost: requiredNonNegativeInteger(
          row[3],
          "発動精神力",
          rowNumber,
          3,
        ),
        effect: requiredText(row[4], "効果", rowNumber, 4),
        sourceOrder,
      } satisfies Nanomachine;
    },
  );
}

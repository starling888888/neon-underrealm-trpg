import {
  createDrugId,
  type Drug,
  type DrugTiming,
  DrugTimingSchema,
} from "../../src/lib/schemas/item";
import {
  collectItemSheetRows,
  type ItemRows,
  optionalNonNegativeInteger,
  requiredNonNegativeInteger,
  requiredText,
} from "./shared";

const HEADERS = [
  "名称",
  "信用",
  "使用T",
  "1セット数量",
  "BT強度",
  "効果",
] as const;

export function convertDrugs(rows: ItemRows): Drug[] {
  return collectItemSheetRows({ rows, headers: HEADERS, nameColumn: 0 }).map(
    ({ row, rowNumber, sourceOrder }) => {
      const name = requiredText(row[0], "名称", rowNumber, 0);
      const timing = timingValue(row[2], rowNumber);
      return {
        id: createDrugId({ timing, name }),
        name,
        credit: optionalNonNegativeInteger(row[1], "信用", rowNumber, 1),
        timing,
        setQuantity: requiredNonNegativeInteger(
          row[3],
          "1セット数量",
          rowNumber,
          3,
        ),
        badTripIntensity: requiredNonNegativeInteger(
          row[4],
          "BT強度",
          rowNumber,
          4,
        ),
        effect: requiredText(row[5], "効果", rowNumber, 5),
        sourceOrder,
      } satisfies Drug;
    },
  );
}

function timingValue(
  value: ItemRows[number][number] | undefined,
  row: number,
): DrugTiming {
  const result = requiredText(value, "使用T", row, 2);
  if (!DrugTimingSchema.safeParse(result).success) {
    throw new Error(`使用T is invalid at row ${row}, column C.`);
  }
  return result as DrugTiming;
}

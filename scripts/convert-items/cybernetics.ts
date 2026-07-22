import {
  type Cybernetic,
  type CyberneticPart,
  CyberneticPartSchema,
  type CyberneticsByPart,
  createCyberneticId,
  createCyberneticPartKey,
} from "../../src/lib/schemas/item";
import {
  collectItemSheetRows,
  type ItemRows,
  optionalNonNegativeInteger,
  requiredNonNegativeInteger,
  requiredText,
} from "./shared";

const HEADERS = ["部位", "名称", "信用", "埋め込み点数", "効果"] as const;

export function convertCybernetics(rows: ItemRows): CyberneticsByPart {
  const data: CyberneticsByPart = {};
  for (const { row, rowNumber, sourceOrder } of collectItemSheetRows({
    rows,
    headers: HEADERS,
    nameColumn: 1,
  })) {
    const part = partValue(row[0], rowNumber);
    const name = requiredText(row[1], "名称", rowNumber, 1);
    const item: Cybernetic = {
      id: createCyberneticId({ part, name }),
      part,
      name,
      credit: optionalNonNegativeInteger(row[2], "信用", rowNumber, 2),
      implantPoints: requiredNonNegativeInteger(
        row[3],
        "埋め込み点数",
        rowNumber,
        3,
      ),
      effect: requiredText(row[4], "効果", rowNumber, 4),
      sourceOrder,
    };
    const partKey = createCyberneticPartKey(part);
    let items = data[partKey];
    if (!items) {
      items = [];
      data[partKey] = items;
    }
    items.push(item);
  }
  return data;
}

function partValue(
  value: ItemRows[number][number] | undefined,
  row: number,
): CyberneticPart {
  const result = requiredText(value, "部位", row, 0);
  if (!CyberneticPartSchema.safeParse(result).success) {
    throw new Error(`部位 is invalid at row ${row}, column A.`);
  }
  return result as CyberneticPart;
}

import { resolve } from "node:path";
import { convertRyugiList } from "./lib";

const result = await convertRyugiList({
  inputPath: resolve(".raw/data/ryugi-list.xlsx"),
  sheetName: "ryugi-list",
  outputPath: resolve("data/generated/ryugi-list.json"),
});

console.log(`Converted ${result.data.length} ryugi.`);

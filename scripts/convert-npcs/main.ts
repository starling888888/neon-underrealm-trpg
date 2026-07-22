import { resolve } from "node:path";
import { convertNpcs } from "./lib";

const result = await convertNpcs({
  inputPath: resolve(".raw/data/npcs.xlsx"),
  sheetName: "npcs",
  outputPath: resolve("data/generated/npcs.json"),
});

console.log(`Converted ${result.data.length} NPCs.`);

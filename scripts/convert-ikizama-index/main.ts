import { resolve } from "node:path";
import { convertIkizama } from "./lib";

const result = await convertIkizama({
  inputPath: resolve(".raw/data/ikizama-list.xlsx"),
  sheetName: "ikizama-list",
  outputPath: resolve("data/generated/ikizama.json"),
});

console.log(`Converted ${result.data.length} ikizama.`);

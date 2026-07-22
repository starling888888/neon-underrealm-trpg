import { resolve } from "node:path";
import { convertItems } from "./lib";

const result = await convertItems({
  inputPath: resolve(".raw/data/items.xlsx"),
  outputPath: resolve("data/generated/items.json"),
});

console.log(
  `Converted ${result.data.armors.length + result.data.omamori.length + result.data.nanomachines.length + result.data.drugs.length + Object.values(result.data.weapons).flatMap((checks) => Object.values(checks ?? {}).flat()).length + Object.values(result.data.cybernetics).flat().length} item(s).`,
);

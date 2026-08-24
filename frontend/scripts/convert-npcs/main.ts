import { frontendPath, repositoryPath } from "../_common/repository-paths";
import { convertNpcs } from "./lib";

const result = await convertNpcs({
  inputPath: repositoryPath(".raw/data/npcs.xlsx"),
  sheetName: "npcs",
  outputPath: frontendPath("data/generated/npcs.json"),
});

console.log(`Converted ${result.data.length} NPCs.`);

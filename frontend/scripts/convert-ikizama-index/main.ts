import { frontendPath, repositoryPath } from "../_common/repository-paths";
import { convertIkizama } from "./lib";

const result = await convertIkizama({
  inputPath: repositoryPath(".raw/data/ikizama-list.xlsx"),
  sheetName: "ikizama-list",
  outputPath: frontendPath("data/generated/ikizama.json"),
});

console.log(`Converted ${result.data.length} ikizama.`);

import { frontendPath, repositoryPath } from "../_common/repository-paths";
import { convertRyugiList } from "./lib";

const result = await convertRyugiList({
  inputPath: repositoryPath(".raw/data/ryugi-list.xlsx"),
  sheetName: "ryugi-list",
  outputPath: frontendPath("data/generated/ryugi-list.json"),
});

console.log(`Converted ${result.data.length} ryugi.`);

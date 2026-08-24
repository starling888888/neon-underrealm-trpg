import { frontendPath, repositoryPath } from "../_common/repository-paths";
import { convertItems } from "./lib";

const result = await convertItems({
  inputPath: repositoryPath(".raw/data/items.xlsx"),
  outputPath: frontendPath("data/generated/items.json"),
});

console.log(
  `Converted ${result.data.armors.length + result.data.omamori.length + result.data.nanomachines.length + result.data.drugs.length + Object.values(result.data.weapons).flatMap((checks) => Object.values(checks ?? {}).flat()).length + Object.values(result.data.cybernetics).flat().length} item(s).`,
);

import { frontendPath, repositoryPath } from "../_common/repository-paths";
import { convertCommonSkills } from "./lib";

const result = await convertCommonSkills({
  inputPath: repositoryPath(".raw/data/common-skills.xlsx"),
  sheetName: "common-skills",
  outputPath: frontendPath("data/generated/common-skills.json"),
  onWarning: (warning) => console.error(warning),
});

console.log(
  `Converted ${Object.values(result.data).flat().length} common skill(s).`,
);

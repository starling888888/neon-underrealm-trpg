import { resolve } from "node:path";
import { convertCommonSkills } from "./lib";

const result = await convertCommonSkills({
  inputPath: resolve(".raw/data/common-skills.xlsx"),
  sheetName: "common-skills",
  outputPath: resolve("data/generated/common-skills.json"),
  onWarning: (warning) => console.error(warning),
});

console.log(
  `Converted ${Object.values(result.data).flat().length} common skill(s).`,
);

import { resolve } from "node:path";
import { convertSkills } from "../convert-skills/lib";

const result = await convertSkills({
  inputPath: resolve(".raw/data/common-skills.xlsx"),
  sheetName: "common-skills",
  outputPath: resolve("data/generated/common-skills.json"),
  dataName: "common-skills",
  idPrefix: "skill-common",
  onWarning: (warning) => console.error(warning),
});

console.log(
  `Converted ${Object.values(result.data).flat().length} common skill(s).`,
);

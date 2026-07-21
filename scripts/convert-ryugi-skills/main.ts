import { resolve } from "node:path";
import { getRyugiList } from "../../src/lib/data/ryugi-list";
import { convertRyugiSkills } from "./lib";

const result = await convertRyugiSkills({
  inputPath: resolve(".raw/data/ryugi-skills.xlsx"),
  outputPath: resolve("data/generated/ryugi-skills.json"),
  ryugiIds: getRyugiList().map((ryugi) => ryugi.id),
  onWarning: (warning) => console.error(warning),
});

const count = Object.values(result.data).flatMap(Object.values).flat().length;
console.log(`Converted ${count} ryugi skill(s).`);

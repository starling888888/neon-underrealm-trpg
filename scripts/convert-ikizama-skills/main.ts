import { resolve } from "node:path";
import { getIkizamaList } from "../../src/lib/data/ikizama";
import { convertIkizamaSkills } from "./lib";

const result = await convertIkizamaSkills({
  inputPath: resolve(".raw/data/ikizama-skills.xlsx"),
  outputPath: resolve("data/generated/ikizama-skills.json"),
  ikizamaIds: getIkizamaList().map((ikizama) => ikizama.id),
  onWarning: (warning) => console.error(warning),
});

const count = Object.values(result.data).flatMap(Object.values).flat().length;
console.log(`Converted ${count} ikizama skill(s).`);

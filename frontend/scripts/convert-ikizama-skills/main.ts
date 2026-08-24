import { frontendPath, repositoryPath } from "../_common/repository-paths";
import { getIkizamaList } from "../../src/lib/data/ikizama";
import { convertIkizamaSkills } from "./lib";

const result = await convertIkizamaSkills({
  inputPath: repositoryPath(".raw/data/ikizama-skills.xlsx"),
  outputPath: frontendPath("data/generated/ikizama-skills.json"),
  ikizamaIds: getIkizamaList().map((ikizama) => ikizama.id),
  onWarning: (warning) => console.error(warning),
});

const count = Object.values(result.data).flatMap(Object.values).flat().length;
console.log(`Converted ${count} ikizama skill(s).`);

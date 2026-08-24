import { frontendPath, repositoryPath } from "../_common/repository-paths";
import { convertReleaseNotes } from "./lib";

const inputPath = repositoryPath(".raw/release-notes.xlsx");
const outputPath = frontendPath("data/generated/release-notes.json");

try {
  const result = await convertReleaseNotes({ inputPath, outputPath });
  console.log(
    `Converted ${result.data.length} release note(s) to ${outputPath}.`,
  );
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}

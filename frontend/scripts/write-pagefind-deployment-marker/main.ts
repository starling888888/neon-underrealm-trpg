import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { frontendPath } from "../_common/repository-paths";
import { getDeploymentCommitSha } from "./lib";

const commit = getDeploymentCommitSha();
const markerPath = frontendPath("dist", "pagefind", "deployment.json");

await mkdir(dirname(markerPath), { recursive: true });
await writeFile(markerPath, `${JSON.stringify({ commit })}\n`, "utf8");

console.log(
  `[write-pagefind-deployment-marker] wrote ${join("dist", "pagefind", "deployment.json")}`,
);

import { rm } from "node:fs/promises";
import { join, relative } from "node:path";
import { frontendPath } from "../_common/repository-paths";

const privateRoutes = ["-local"];
const distDir = frontendPath("dist");

for (const route of privateRoutes) {
  const target = join(distDir, route);
  await rm(target, { recursive: true, force: true });
  console.log(
    `[remove-private-routes] removed ${relative(frontendPath(), target)}`,
  );
}

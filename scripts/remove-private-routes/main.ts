import { rm } from "node:fs/promises";
import path from "node:path";

const privateRoutes = ["local", "mdx-test"];
const distDir = path.resolve("dist");

for (const route of privateRoutes) {
  const target = path.join(distDir, route);
  await rm(target, { recursive: true, force: true });
  console.log(
    `[remove-private-routes] removed ${path.relative(process.cwd(), target)}`,
  );
}

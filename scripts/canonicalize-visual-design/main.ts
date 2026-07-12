import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { canonicalizeVisualDesign } from "./lib";

const execFileAsync = promisify(execFile);

async function readGitValue(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args);
  return stdout.trim();
}

function readArguments(args: string[]): { route: string; target: string } {
  const [target, routeFlag, route] = args;

  if (!target || routeFlag !== "--route" || !route || args.length !== 3) {
    throw new Error(
      "Usage: npm run visual:canonicalize -- <design-target> --route /route/",
    );
  }

  return { target, route };
}

async function main(): Promise<void> {
  const { target, route } = readArguments(process.argv.slice(2));
  const [branch, head] = await Promise.all([
    readGitValue(["branch", "--show-current"]),
    readGitValue(["rev-parse", "HEAD"]),
  ]);
  const result = await canonicalizeVisualDesign({
    branch,
    head,
    rootDir: process.cwd(),
    route,
    target,
  });

  console.log(`[visual:canonicalize] updated ${result.designDirectory}`);
}

await main();

import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { canonicalizeVisualDesign } from "./lib";

const execFileAsync = promisify(execFile);

async function readGitValue(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args);
  return stdout.trim();
}

function readArguments(args: string[]): {
  route: string;
  state?: string;
  target: string;
} {
  const [target, routeFlag, route, stateFlag, state] = args;

  if (
    !target ||
    routeFlag !== "--route" ||
    !route ||
    (args.length !== 3 &&
      (args.length !== 5 || stateFlag !== "--state" || !state))
  ) {
    throw new Error(
      "Usage: npm run visual:canonicalize -- <design-target> --route /route/ [--state state]",
    );
  }

  return { target, route, state };
}

async function main(): Promise<void> {
  const { target, route, state } = readArguments(process.argv.slice(2));
  const [branch, head] = await Promise.all([
    readGitValue(["branch", "--show-current"]),
    readGitValue(["rev-parse", "HEAD"]),
  ]);
  const result = await canonicalizeVisualDesign({
    branch,
    head,
    rootDir: process.cwd(),
    route,
    state,
    target,
  });

  console.log(`[visual:canonicalize] updated ${result.designDirectory}`);
}

await main();

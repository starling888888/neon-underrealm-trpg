import { execFile, spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const outputDirectory = "test-results/visual";

type CaptureManifest = {
  version: 1;
  branch: string;
  head: string;
  startedAt: string;
  completedAt: string;
  playwrightArgs: string[];
};

async function readGitValue(args: string[]): Promise<string> {
  const { stdout } = await execFileAsync("git", args);
  return stdout.trim();
}

async function runPlaywright(args: string[]): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        "./node_modules/@playwright/test/cli.js",
        "test",
        "tests/visual",
        ...args,
      ],
      { stdio: "inherit" },
    );
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Playwright exited with code ${code ?? "unknown"}${signal ? ` (signal: ${signal})` : ""}.`,
        ),
      );
    });
  });
}

async function main(): Promise<void> {
  const startedAt = new Date().toISOString();
  const [branch, head] = await Promise.all([
    readGitValue(["branch", "--show-current"]),
    readGitValue(["rev-parse", "HEAD"]),
  ]);
  const playwrightArgs = process.argv.slice(2);

  await runPlaywright(playwrightArgs);

  const manifest: CaptureManifest = {
    version: 1,
    branch,
    head,
    startedAt,
    completedAt: new Date().toISOString(),
    playwrightArgs,
  };
  await mkdir(outputDirectory, { recursive: true });
  await writeFile(
    `${outputDirectory}/capture-manifest.json`,
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  console.log(
    `[visual:capture] wrote ${outputDirectory}/capture-manifest.json`,
  );
}

await main();

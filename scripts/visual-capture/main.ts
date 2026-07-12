import { execFile, spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { promisify } from "node:util";
import {
  clearVisualArtifacts,
  invalidateCaptureManifest,
  writeCaptureManifest,
} from "./lib";

const execFileAsync = promisify(execFile);
const outputDirectory = "test-results/visual";

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
  const runId = randomUUID();

  await mkdir(outputDirectory, { recursive: true });
  await invalidateCaptureManifest(outputDirectory);
  await clearVisualArtifacts(outputDirectory);
  await runPlaywright(playwrightArgs);

  await writeCaptureManifest(outputDirectory, {
    version: 1,
    branch,
    head,
    startedAt,
    completedAt: new Date().toISOString(),
    playwrightArgs,
    runId,
  });
  console.log(
    `[visual:capture] wrote ${outputDirectory}/capture-manifest.json`,
  );
}

await main();

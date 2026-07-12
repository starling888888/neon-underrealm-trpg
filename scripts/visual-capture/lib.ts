import { readdir, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export type CaptureManifest = {
  version: 1;
  branch: string;
  completedAt: string;
  head: string;
  playwrightArgs: string[];
  runId: string;
  startedAt: string;
};

export function getCaptureManifestPath(outputDirectory: string): string {
  return path.join(outputDirectory, "capture-manifest.json");
}

export async function invalidateCaptureManifest(
  outputDirectory: string,
): Promise<void> {
  await rm(getCaptureManifestPath(outputDirectory), { force: true });
}

export async function clearVisualArtifacts(
  outputDirectory: string,
): Promise<void> {
  const entries = await readdir(outputDirectory);
  await Promise.all(
    entries
      .filter((entry) => entry.endsWith(".png"))
      .map((entry) => rm(path.join(outputDirectory, entry), { force: true })),
  );
}

export async function writeCaptureManifest(
  outputDirectory: string,
  manifest: CaptureManifest,
  write: (file: string, contents: string) => Promise<void> = writeFile,
): Promise<void> {
  const temporaryPath = path.join(
    outputDirectory,
    `.capture-manifest-${manifest.runId}.tmp`,
  );

  try {
    await write(temporaryPath, `${JSON.stringify(manifest, null, 2)}\n`);
    await rename(temporaryPath, getCaptureManifestPath(outputDirectory));
  } catch (error) {
    await rm(temporaryPath, { force: true });
    throw error;
  }
}

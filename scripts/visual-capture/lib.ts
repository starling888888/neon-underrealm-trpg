import { rm, writeFile } from "node:fs/promises";
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

export async function writeCaptureManifest(
  outputDirectory: string,
  manifest: CaptureManifest,
): Promise<void> {
  await writeFile(
    getCaptureManifestPath(outputDirectory),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
}

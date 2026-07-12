import type { Stats } from "node:fs";
import { copyFile, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const sourceStart = "<!-- visual-canonicalization:start -->";
const sourceEnd = "<!-- visual-canonicalization:end -->";
const supportedViewports = {
  desktop: "1440x1200",
  mobile: "390x900",
} as const;

type CaptureManifest = {
  version: 1;
  branch: string;
  head: string;
  startedAt: string;
  completedAt: string;
  playwrightArgs: string[];
};

export type CanonicalizeVisualDesignOptions = {
  branch: string;
  head: string;
  rootDir: string;
  route: string;
  target: string;
};

export type CanonicalizeVisualDesignResult = {
  designDirectory: string;
  desktopSource: string;
  mobileSource: string;
  notesPath: string;
};

export async function canonicalizeVisualDesign(
  options: CanonicalizeVisualDesignOptions,
): Promise<CanonicalizeVisualDesignResult> {
  validateTarget(options.target);
  validateRoute(options.route);

  const sourceDirectory = path.join(options.rootDir, "test-results/visual");
  const designDirectory = path.join(
    options.rootDir,
    "docs/design",
    options.target,
  );
  const desktopSource = path.join(
    sourceDirectory,
    `${options.target}-desktop.png`,
  );
  const mobileSource = path.join(
    sourceDirectory,
    `${options.target}-mobile.png`,
  );
  const notesPath = path.join(designDirectory, "notes.md");
  const manifest = await readCaptureManifest(
    path.join(sourceDirectory, "capture-manifest.json"),
  );

  if (manifest.head !== options.head) {
    throw new Error(
      `Capture manifest head ${manifest.head} does not match current HEAD ${options.head}.`,
    );
  }

  await assertCapturedAfter(manifest.startedAt, desktopSource);
  await assertCapturedAfter(manifest.startedAt, mobileSource);

  const notes = await readFile(notesPath, "utf8");
  const updatedNotes = replaceCanonicalizationSource(notes, {
    branch: options.branch,
    head: options.head,
    route: options.route,
    target: options.target,
  });

  await copyFile(
    desktopSource,
    path.join(designDirectory, "design-desktop.png"),
  );
  await copyFile(mobileSource, path.join(designDirectory, "design-mobile.png"));
  await writeFile(notesPath, updatedNotes);

  return {
    designDirectory,
    desktopSource,
    mobileSource,
    notesPath,
  };
}

async function readCaptureManifest(file: string): Promise<CaptureManifest> {
  let value: unknown;

  try {
    value = JSON.parse(await readFile(file, "utf8"));
  } catch {
    throw new Error(
      `Missing or invalid capture manifest at ${file}. Run npm run visual:capture first.`,
    );
  }

  if (
    !isCaptureManifest(value) ||
    Number.isNaN(Date.parse(value.startedAt)) ||
    Number.isNaN(Date.parse(value.completedAt))
  ) {
    throw new Error(`Invalid capture manifest at ${file}.`);
  }

  return value;
}

async function assertCapturedAfter(
  startedAt: string,
  screenshotPath: string,
): Promise<void> {
  let details: Stats;

  try {
    details = await stat(screenshotPath);
  } catch {
    throw new Error(
      `Missing current screenshot at ${screenshotPath}. Run the matching visual test through npm run visual:capture.`,
    );
  }

  const captureStart = Date.parse(startedAt);
  if (details.mtimeMs + 1_000 < captureStart) {
    throw new Error(
      `Screenshot at ${screenshotPath} predates the current capture manifest.`,
    );
  }
}

function replaceCanonicalizationSource(
  notes: string,
  values: {
    branch: string;
    head: string;
    route: string;
    target: string;
  },
): string {
  const start = notes.indexOf(sourceStart);
  const end = notes.indexOf(sourceEnd);

  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `notes.md must include ${sourceStart} and ${sourceEnd} before canonicalization.`,
    );
  }

  const block = [
    sourceStart,
    `- command: \`npm run visual:canonicalize -- ${values.target} --route ${values.route}\``,
    `- source branch: \`${values.branch}\``,
    `- source commit: \`${values.head}\``,
    `- route: \`${values.route}\``,
    `- viewport: desktop ${supportedViewports.desktop}, mobile ${supportedViewports.mobile}`,
    `- capture manifest: \`test-results/visual/capture-manifest.json\``,
    sourceEnd,
  ].join("\n");

  return `${notes.slice(0, start)}${block}${notes.slice(
    end + sourceEnd.length,
  )}`;
}

function isCaptureManifest(value: unknown): value is CaptureManifest {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const manifest = value as Partial<CaptureManifest>;
  return (
    manifest.version === 1 &&
    typeof manifest.branch === "string" &&
    typeof manifest.head === "string" &&
    typeof manifest.startedAt === "string" &&
    typeof manifest.completedAt === "string" &&
    Array.isArray(manifest.playwrightArgs) &&
    manifest.playwrightArgs.every((argument) => typeof argument === "string")
  );
}

function validateRoute(route: string): void {
  if (!route.startsWith("/")) {
    throw new Error("Route must start with /.");
  }
}

function validateTarget(target: string): void {
  if (!/^[a-z0-9-]+$/.test(target)) {
    throw new Error(
      "Design target must use lowercase letters, digits, and hyphens.",
    );
  }
}

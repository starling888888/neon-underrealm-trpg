import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  stat,
  utimes,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { canonicalizeVisualDesign } from "../../scripts/canonicalize-visual-design/lib";

describe("visual design canonicalization", () => {
  it("copies current visual artifacts and records their provenance", async () => {
    const rootDir = await prepareFixture();
    const startedAt = new Date().toISOString();
    await writeManifest(rootDir, { head: "abc123", startedAt });
    await setScreenshotTimes(rootDir, new Date(Date.parse(startedAt) + 1_000));

    const result = await canonicalizeVisualDesign({
      branch: "26-2-advancement-page",
      head: "abc123",
      rootDir,
      route: "/advancement/",
      target: "advancement",
    });

    assert.equal(
      await readFile(
        path.join(result.designDirectory, "design-desktop.png"),
        "utf8",
      ),
      "desktop",
    );
    assert.equal(
      await readFile(
        path.join(result.designDirectory, "design-mobile.png"),
        "utf8",
      ),
      "mobile",
    );
    const notes = await readFile(result.notesPath, "utf8");
    assert.match(notes, /source commit: `abc123`/);
    assert.match(notes, /route: `\/advancement\/`/);
  });

  it("rejects screenshots that predate the capture manifest", async () => {
    const rootDir = await prepareFixture();
    const startedAt = new Date().toISOString();
    await writeManifest(rootDir, { head: "abc123", startedAt });
    await setScreenshotTimes(rootDir, new Date(Date.parse(startedAt) - 2_000));

    await assert.rejects(
      canonicalizeVisualDesign({
        branch: "26-2-advancement-page",
        head: "abc123",
        rootDir,
        route: "/advancement/",
        target: "advancement",
      }),
      /predates the current capture manifest/,
    );
  });

  it("rejects a capture manifest from another commit", async () => {
    const rootDir = await prepareFixture();
    const startedAt = new Date().toISOString();
    await writeManifest(rootDir, { head: "other", startedAt });
    await setScreenshotTimes(rootDir, new Date(Date.parse(startedAt) + 1_000));

    await assert.rejects(
      canonicalizeVisualDesign({
        branch: "26-2-advancement-page",
        head: "abc123",
        rootDir,
        route: "/advancement/",
        target: "advancement",
      }),
      /does not match current HEAD/,
    );
  });
});

async function prepareFixture(): Promise<string> {
  const rootDir = await mkdtemp(
    path.join(tmpdir(), "canonicalize-visual-design-"),
  );
  const sourceDir = path.join(rootDir, "test-results/visual");
  const designDir = path.join(rootDir, "docs/design/advancement");
  await mkdir(sourceDir, { recursive: true });
  await mkdir(designDir, { recursive: true });
  await writeFile(path.join(sourceDir, "advancement-desktop.png"), "desktop");
  await writeFile(path.join(sourceDir, "advancement-mobile.png"), "mobile");
  await writeFile(
    path.join(designDir, "notes.md"),
    `# advancement\n\n## Generation source\n\n<!-- visual-canonicalization:start -->\n<!-- visual-canonicalization:end -->\n`,
  );
  return rootDir;
}

async function setScreenshotTimes(rootDir: string, time: Date): Promise<void> {
  for (const name of ["advancement-desktop.png", "advancement-mobile.png"]) {
    const file = path.join(rootDir, "test-results/visual", name);
    await utimes(file, time, time);
    assert.ok((await stat(file)).mtimeMs > 0);
  }
}

async function writeManifest(
  rootDir: string,
  values: { head: string; startedAt: string },
): Promise<void> {
  await writeFile(
    path.join(rootDir, "test-results/visual/capture-manifest.json"),
    `${JSON.stringify({
      version: 1,
      branch: "26-2-advancement-page",
      head: values.head,
      startedAt: values.startedAt,
      completedAt: values.startedAt,
      playwrightArgs: ["--grep", "@advancement"],
    })}\n`,
  );
}

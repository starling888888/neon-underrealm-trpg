import assert from "node:assert/strict";
import {
  mkdir,
  mkdtemp,
  readFile,
  rename,
  stat,
  utimes,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { canonicalizeVisualDesign } from "../../scripts/canonicalize-visual-design/lib";
import {
  clearVisualArtifacts,
  getCaptureManifestPath,
  invalidateCaptureManifest,
  writeCaptureManifest,
} from "../../scripts/visual-capture/lib";

describe("visual design canonicalization", () => {
  it("copies current visual artifacts and records their provenance", async () => {
    const rootDir = await prepareFixture();
    const startedAt = new Date().toISOString();
    await writeManifest(rootDir, {
      completedAt: new Date(Date.parse(startedAt) + 2_000).toISOString(),
      head: "abc123",
      startedAt,
    });
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
    await writeManifest(rootDir, {
      completedAt: new Date(Date.parse(startedAt) + 2_000).toISOString(),
      head: "abc123",
      startedAt,
    });
    await setScreenshotTimes(rootDir, new Date(Date.parse(startedAt) - 2_000));

    await assert.rejects(
      canonicalizeVisualDesign({
        branch: "26-2-advancement-page",
        head: "abc123",
        rootDir,
        route: "/advancement/",
        target: "advancement",
      }),
      /outside the current capture manifest window/,
    );
  });

  it("rejects screenshots modified after the capture completes", async () => {
    const rootDir = await prepareFixture();
    const startedAt = new Date().toISOString();
    await writeManifest(rootDir, {
      completedAt: new Date(Date.parse(startedAt) + 1_000).toISOString(),
      head: "abc123",
      startedAt,
    });
    await setScreenshotTimes(rootDir, new Date(Date.parse(startedAt) + 3_000));

    await assert.rejects(
      canonicalizeVisualDesign({
        branch: "26-2-advancement-page",
        head: "abc123",
        rootDir,
        route: "/advancement/",
        target: "advancement",
      }),
      /outside the current capture manifest window/,
    );
  });

  it("rejects a capture manifest from another commit", async () => {
    const rootDir = await prepareFixture();
    const startedAt = new Date().toISOString();
    await writeManifest(rootDir, {
      completedAt: new Date(Date.parse(startedAt) + 2_000).toISOString(),
      head: "other",
      startedAt,
    });
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

  it("rolls back every design artifact when a replacement fails", async () => {
    const rootDir = await prepareFixture();
    const startedAt = new Date().toISOString();
    await writeManifest(rootDir, {
      completedAt: new Date(Date.parse(startedAt) + 2_000).toISOString(),
      head: "abc123",
      startedAt,
    });
    await setScreenshotTimes(rootDir, new Date(Date.parse(startedAt) + 1_000));
    const designDirectory = path.join(rootDir, "docs/design/advancement");
    await writeFile(
      path.join(designDirectory, "design-desktop.png"),
      "old desktop",
    );
    await writeFile(
      path.join(designDirectory, "design-mobile.png"),
      "old mobile",
    );
    await writeFile(
      path.join(designDirectory, "notes.md"),
      "old notes\n<!-- visual-canonicalization:start -->\n<!-- visual-canonicalization:end -->\n",
    );
    let replacements = 0;

    await assert.rejects(
      canonicalizeVisualDesign(
        {
          branch: "26-2-advancement-page",
          head: "abc123",
          rootDir,
          route: "/advancement/",
          target: "advancement",
        },
        async (source, destination) => {
          replacements += 1;
          if (replacements === 2) {
            throw new Error("replacement failed");
          }

          await rename(source, destination);
        },
      ),
      /replacement failed/,
    );

    assert.equal(
      await readFile(path.join(designDirectory, "design-desktop.png"), "utf8"),
      "old desktop",
    );
    assert.equal(
      await readFile(path.join(designDirectory, "design-mobile.png"), "utf8"),
      "old mobile",
    );
    assert.match(
      await readFile(path.join(designDirectory, "notes.md"), "utf8"),
      /old notes/,
    );
  });

  it("rejects a route that can alter provenance Markdown", async () => {
    const rootDir = await prepareFixture();
    const startedAt = new Date().toISOString();
    await writeManifest(rootDir, {
      completedAt: new Date(Date.parse(startedAt) + 2_000).toISOString(),
      head: "abc123",
      startedAt,
    });
    await setScreenshotTimes(rootDir, new Date(Date.parse(startedAt) + 1_000));

    await assert.rejects(
      canonicalizeVisualDesign({
        branch: "26-2-advancement-page",
        head: "abc123",
        rootDir,
        route: "/advancement/\n- forged: true",
        target: "advancement",
      }),
      /Route must be a lowercase site path/,
    );
  });

  it("clears old screenshots before a new capture run", async () => {
    const rootDir = await mkdtemp(path.join(tmpdir(), "visual-capture-"));
    const outputDirectory = path.join(rootDir, "test-results/visual");
    await mkdir(outputDirectory, { recursive: true });
    await writeFile(
      path.join(outputDirectory, "advancement-desktop.png"),
      "old",
    );
    await writeFile(
      path.join(outputDirectory, "advancement-mobile.png"),
      "old",
    );
    await writeFile(path.join(outputDirectory, "node-tests.tap"), "keep");
    await writeFile(getCaptureManifestPath(outputDirectory), "old manifest");

    await invalidateCaptureManifest(outputDirectory);
    await clearVisualArtifacts(outputDirectory);

    await assert.rejects(readFile(getCaptureManifestPath(outputDirectory)));
    await assert.rejects(
      readFile(path.join(outputDirectory, "advancement-desktop.png")),
    );
    await assert.rejects(
      readFile(path.join(outputDirectory, "advancement-mobile.png")),
    );
    assert.equal(
      await readFile(path.join(outputDirectory, "node-tests.tap"), "utf8"),
      "keep",
    );
  });

  it("rejects a partial capture after old artifacts are cleared", async () => {
    const rootDir = await prepareFixture();
    const sourceDirectory = path.join(rootDir, "test-results/visual");
    const startedAt = new Date().toISOString();
    await clearVisualArtifacts(sourceDirectory);
    await writeFile(
      path.join(sourceDirectory, "advancement-desktop.png"),
      "desktop",
    );
    await writeManifest(rootDir, {
      completedAt: new Date(Date.parse(startedAt) + 2_000).toISOString(),
      head: "abc123",
      startedAt,
    });
    await utimes(
      path.join(sourceDirectory, "advancement-desktop.png"),
      new Date(Date.parse(startedAt) + 1_000),
      new Date(Date.parse(startedAt) + 1_000),
    );

    await assert.rejects(
      canonicalizeVisualDesign({
        branch: "26-2-advancement-page",
        head: "abc123",
        rootDir,
        route: "/advancement/",
        target: "advancement",
      }),
      /Missing current screenshot.*advancement-mobile\.png/,
    );
  });

  it("does not publish a manifest when the manifest write fails", async () => {
    const rootDir = await mkdtemp(path.join(tmpdir(), "visual-capture-"));
    const outputDirectory = path.join(rootDir, "test-results/visual");
    await mkdir(outputDirectory, { recursive: true });

    await assert.rejects(
      writeCaptureManifest(
        outputDirectory,
        {
          branch: "26-2-advancement-page",
          completedAt: new Date().toISOString(),
          head: "abc123",
          playwrightArgs: [],
          runId: "failed-run",
          startedAt: new Date().toISOString(),
          version: 1,
        },
        async () => {
          throw new Error("manifest write failed");
        },
      ),
      /manifest write failed/,
    );

    await assert.rejects(readFile(getCaptureManifestPath(outputDirectory)));
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
  values: { completedAt: string; head: string; startedAt: string },
): Promise<void> {
  await writeFile(
    path.join(rootDir, "test-results/visual/capture-manifest.json"),
    `${JSON.stringify({
      version: 1,
      branch: "26-2-advancement-page",
      head: values.head,
      startedAt: values.startedAt,
      completedAt: values.completedAt,
      playwrightArgs: ["--grep", "@advancement"],
      runId: "run-1",
    })}\n`,
  );
}

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { processPageTocHtml } from "./lib";

const distDir = new URL("../../dist", import.meta.url).pathname;

async function main(): Promise<void> {
  const files = await collectHtmlFiles(distDir);

  for (const file of files) {
    const html = await readFile(file, "utf8");
    const result = processPageTocHtml(html);

    if (result.processed) {
      await writeFile(file, result.html);
    }

    for (const warning of result.warnings) {
      console.warn(`[page-toc] ${file}: ${warning}`);
    }
  }
}

async function collectHtmlFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true });
  const files: string[] = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...(await collectHtmlFiles(path)));
      continue;
    }

    if (entry.isFile() && path.endsWith(".html")) {
      files.push(path);
    }
  }

  return files;
}

await main();

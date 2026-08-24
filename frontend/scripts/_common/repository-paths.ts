import { fileURLToPath } from "node:url";
import { join } from "node:path";

export const frontendRoot = fileURLToPath(new URL("../..", import.meta.url));
export const repositoryRoot = fileURLToPath(
  new URL("../../..", import.meta.url),
);

export function frontendPath(...segments: string[]): string {
  return join(frontendRoot, ...segments);
}

export function repositoryPath(...segments: string[]): string {
  return join(repositoryRoot, ...segments);
}

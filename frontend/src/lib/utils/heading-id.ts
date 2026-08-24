import { createHash } from "./hash";

export function createHeadingId(depth: 2 | 3, text: string): string {
  const hashInput = `${depth}|${normalizeHeadingText(text)}`;
  const shortHash = createHash(hashInput, 8);
  return `h-${shortHash}`;
}

export function normalizeHeadingText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

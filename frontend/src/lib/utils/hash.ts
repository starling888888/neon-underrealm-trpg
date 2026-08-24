import { createHash as createNodeHash } from "node:crypto";

export function createHash(value: string, length = 12): string {
  return createNodeHash("sha256")
    .update(value, "utf8")
    .digest("hex")
    .slice(0, length);
}

export function createNameHash(name: string): string {
  return createHash(name.trim().replace(/\r\n?/g, "\n"));
}

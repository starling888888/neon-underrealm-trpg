const baseUrl = import.meta.env.BASE_URL;

const externalPattern = /^[a-z][a-z\d+\-.]*:/i;

function trimLeadingSlash(path: string): string {
  return path.replace(/^\/+/, "");
}

function normalizeBase(base: string): string {
  return base.endsWith("/") ? base : `${base}/`;
}

export function withBase(path: string): string {
  if (
    path === "" ||
    path.startsWith("#") ||
    path.startsWith("//") ||
    externalPattern.test(path)
  ) {
    return path;
  }

  return `${normalizeBase(baseUrl)}${trimLeadingSlash(path)}`;
}

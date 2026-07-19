type SearchTypeRule = {
  label: string;
  matches: (path: string) => boolean;
};

const searchTypeRules: SearchTypeRule[] = [
  { label: "トップ", matches: (path) => path === "/" },
  { label: "データ", matches: (path) => path.startsWith("/data/") },
  {
    label: "ルール",
    matches: (path) =>
      path.startsWith("/rules/") ||
      path === "/advancement/" ||
      path === "/character-making/",
  },
  { label: "更新履歴", matches: (path) => path === "/release-notes/" },
  { label: "ワールド", matches: (path) => path === "/world/" },
];

function removeBasePath(pathname: string, basePath: string): string {
  const normalizedBasePath = basePath.replace(/\/$/, "");

  if (!normalizedBasePath || !pathname.startsWith(normalizedBasePath)) {
    return pathname;
  }

  return pathname.slice(normalizedBasePath.length) || "/";
}

export function getSearchTypeLabel(pathname: string, basePath = "/"): string {
  const path = removeBasePath(pathname, basePath);
  return searchTypeRules.find((rule) => rule.matches(path))?.label ?? "本文";
}

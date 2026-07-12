export type SiteMenuItem = {
  label: string;
  href: string;
  children?: SiteMenuItem[];
};

export type SiteMenuItemState = "current" | "ancestor" | "none";

export const siteMenuItems: SiteMenuItem[] = [
  {
    label: "トップ",
    href: "/",
  },
  {
    label: "はじめに",
    href: "/introduction",
  },
  {
    label: "ワールドガイド",
    href: "/world",
  },
  {
    label: "キャラクターメイキング",
    href: "/character-making",
  },
  {
    label: "ルール",
    href: "/rules",
    children: [
      {
        label: "シナリオ進行",
        href: "/rules/scenario-play",
      },
      {
        label: "戦闘",
        href: "/rules/battle",
      },
    ],
  },
  {
    label: "データ",
    href: "/data",
    children: [
      {
        label: "流儀",
        href: "/data/ryugi",
      },
      {
        label: "生き様",
        href: "/data/ikizama",
      },
      {
        label: "共通スキル",
        href: "/data/common-skills",
      },
      {
        label: "アイテム",
        href: "/data/items",
        children: [
          {
            label: "武器",
            href: "/data/items/weapons",
          },
          {
            label: "防具",
            href: "/data/items/armors",
          },
          {
            label: "お守り",
            href: "/data/items/omamori",
          },
          {
            label: "サイバネ",
            href: "/data/items/cybernetics",
          },
          {
            label: "ナノマシン",
            href: "/data/items/nanomachines",
          },
          {
            label: "ドラッグ",
            href: "/data/items/drugs",
          },
        ],
      },
    ],
  },
  {
    label: "キャラクター成長",
    href: "/advancement",
  },
  {
    label: "更新履歴",
    href: "/release-notes",
  },
];

export function getSiteMenuItemState(
  item: SiteMenuItem,
  currentPath: string,
  basePath = "/",
): SiteMenuItemState {
  const normalizedCurrentPath = normalizeCurrentPath(currentPath, basePath);
  const itemPath = normalizeSitePath(item.href);

  if (normalizedCurrentPath === itemPath) {
    return "current";
  }

  if (
    item.children?.some(
      (child) => getSiteMenuItemState(child, normalizedCurrentPath) !== "none",
    )
  ) {
    return "ancestor";
  }

  if (isDescendantPath(normalizedCurrentPath, itemPath)) {
    return "ancestor";
  }

  return "none";
}

export function getSiteMenuItemInitialExpanded(
  item: SiteMenuItem,
  currentPath: string,
  basePath = "/",
): boolean {
  return getSiteMenuItemState(item, currentPath, basePath) === "ancestor";
}

function normalizeCurrentPath(currentPath: string, basePath: string): string {
  const normalizedPath = normalizeSitePath(currentPath);
  const normalizedBase = normalizeSitePath(basePath);

  if (normalizedBase === "/") {
    return normalizedPath;
  }

  if (normalizedPath === normalizedBase) {
    return "/";
  }

  if (normalizedPath.startsWith(`${normalizedBase}/`)) {
    return normalizeSitePath(normalizedPath.slice(normalizedBase.length));
  }

  return normalizedPath;
}

function normalizeSitePath(path: string): string {
  const pathWithoutHashOrQuery = path.split(/[?#]/, 1)[0] ?? "/";
  const pathWithLeadingSlash = pathWithoutHashOrQuery.startsWith("/")
    ? pathWithoutHashOrQuery
    : `/${pathWithoutHashOrQuery}`;
  const normalizedSlashes = pathWithLeadingSlash.replace(/\/{2,}/g, "/");
  const pathWithoutTrailingSlash = normalizedSlashes.replace(/\/+$/, "");

  return pathWithoutTrailingSlash === "" ? "/" : pathWithoutTrailingSlash;
}

function isDescendantPath(currentPath: string, parentPath: string): boolean {
  return parentPath !== "/" && currentPath.startsWith(`${parentPath}/`);
}

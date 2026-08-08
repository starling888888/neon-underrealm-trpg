import { getIkizamaList } from "../data/ikizama";
import { getRyugiList } from "../data/ryugi-list";

export type SiteMenuLinkItem = {
  kind?: "link";
  label: string;
  href: string;
  children?: SiteMenuLinkItem[];
  expandWhenCurrent?: boolean;
};

export type SiteMenuSectionItem = {
  kind: "section";
  label: string;
};

export type SiteMenuSeparatorItem = {
  kind: "separator";
};

export type SiteMenuItem =
  | SiteMenuLinkItem
  | SiteMenuSectionItem
  | SiteMenuSeparatorItem;

export type SiteMenuLink = Pick<SiteMenuLinkItem, "href" | "label">;

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
    kind: "section",
    label: "PLセクション",
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
    expandWhenCurrent: true,
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
    expandWhenCurrent: true,
    children: [
      {
        label: "流儀",
        href: "/data/ryugi",
        expandWhenCurrent: true,
        children: getRyugiList().map((ryugi) => ({
          label: ryugi.name,
          href: `/data/ryugi/${ryugi.id}`,
        })),
      },
      {
        label: "生き様",
        href: "/data/ikizama",
        expandWhenCurrent: true,
        children: getIkizamaList().map((ikizama) => ({
          label: ikizama.name,
          href: `/data/ikizama/${ikizama.id}`,
        })),
      },
      {
        label: "共通スキル",
        href: "/data/common-skills",
      },
      {
        label: "アイテム",
        href: "/data/items",
        expandWhenCurrent: true,
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
    kind: "section",
    label: "GMセクション",
  },
  {
    label: "GMガイド",
    href: "/gm-guide",
  },
  {
    kind: "separator",
  },
  {
    label: "キャラクターシート",
    href: "/character-sheet",
  },
  {
    label: "サポート",
    href: "/support",
  },
  {
    label: "更新履歴",
    href: "/release-notes",
  },
];

export const siteMenuLinks = flattenSiteMenuItems(siteMenuItems);

export function getSiteMenuLink(href: string): SiteMenuLink {
  const link = siteMenuLinks.find((item) => item.href === href);

  if (!link) {
    throw new Error(`Unknown site menu path "${href}".`);
  }

  return link;
}

export function flattenSiteMenuItems(
  items: readonly SiteMenuItem[],
): SiteMenuLink[] {
  const links = items.flatMap((item) => {
    if (!isSiteMenuLinkItem(item)) {
      return [];
    }

    return [
      { href: item.href, label: item.label },
      ...(item.children ? flattenSiteMenuItems(item.children) : []),
    ];
  });
  const hrefs = new Set<string>();

  for (const { href } of links) {
    if (hrefs.has(href)) {
      throw new Error(`Duplicate site menu path "${href}".`);
    }

    hrefs.add(href);
  }

  return links;
}

export function getSiteMenuItemState(
  item: SiteMenuLinkItem,
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
  item: SiteMenuLinkItem,
  currentPath: string,
  basePath = "/",
): boolean {
  const state = getSiteMenuItemState(item, currentPath, basePath);
  return (
    state === "ancestor" ||
    (item.expandWhenCurrent === true && state === "current")
  );
}

export function isSiteMenuLinkItem(
  item: SiteMenuItem,
): item is SiteMenuLinkItem {
  return item.kind !== "section" && item.kind !== "separator";
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

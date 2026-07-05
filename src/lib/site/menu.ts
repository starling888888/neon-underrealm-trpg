export type SiteMenuItem = {
  label: string;
  href: string;
  defaultExpanded?: boolean;
  children?: SiteMenuItem[];
};

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
    label: "データ",
    href: "/data",
    defaultExpanded: true,
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
        defaultExpanded: true,
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
    label: "ルール",
    href: "/rules",
    defaultExpanded: true,
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
    label: "キャラクター成長",
    href: "/advancement",
  },
  {
    label: "更新履歴",
    href: "/release-notes",
  },
];

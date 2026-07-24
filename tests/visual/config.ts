declare const process: {
  env: {
    VISUAL_BASE_HOST?: string;
    VISUAL_BASE_PATH?: string;
    VISUAL_BASE_PORT?: string;
  };
};

const visualBaseHost = process.env.VISUAL_BASE_HOST ?? "http://127.0.0.1";
const visualBasePort = process.env.VISUAL_BASE_PORT ?? "4321";
const visualBasePath = process.env.VISUAL_BASE_PATH ?? "/neon-underrealm-trpg";
const normalizedVisualBasePath = visualBasePath.replace(/\/?$/, "/");

export const visualBaseUrl = `${visualBaseHost}:${visualBasePort}${normalizedVisualBasePath}`;

export const visualRoutes = {
  home: "./",
  introduction: "introduction/",
  rules: "rules/",
  scenarioPlay: "rules/scenario-play/",
  battle: "rules/battle/",
  advancement: "advancement/",
  support: "support/",
  world: "world/",
  characterMaking: "character-making/",
  characterSheet: "character-sheet/",
  data: "data/",
  commonSkills: "data/common-skills/",
  dataRyugi: "data/ryugi/",
  dataRyugiDetail: (ryugiId: string) => `data/ryugi/${ryugiId}/`,
  dataIkizama: "data/ikizama/",
  dataIkizamaDetail: (ikizamaId: string) => `data/ikizama/${ikizamaId}/`,
  dataItems: "data/items/",
  releaseNotes: "release-notes/",
  dataItemsArmors: "data/items/armors/",
  dataItemsOmamori: "data/items/omamori/",
  dataItemsCybernetics: "data/items/cybernetics/",
  dataItemsNanomachines: "data/items/nanomachines/",
  dataItemsDrugs: "data/items/drugs/",
  notFound: "not-found/",
  mdxTest: "-local/mdx-test/",
  callouts: "-local/callouts/",
  npcCards: "-local/npc-cards/",
  dataCards: "-local/data-cards/",
  pageNavigation: "-local/page-navigation/",
  dataItemsWeapons: "data/items/weapons/",
  headerFooter: "-local/header-footer/",
  styleTiles: "-local/style-tiles/",
} as const;

export const visualViewports = {
  desktop: {
    width: 1440,
    height: 1200,
  },
  tablet: {
    width: 820,
    height: 1180,
  },
  mobile: {
    width: 390,
    height: 900,
  },
} as const;

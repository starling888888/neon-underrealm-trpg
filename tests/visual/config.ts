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
  world: "world/",
  characterMaking: "character-making/",
  data: "data/",
  commonSkills: "data/common-skills/",
  dataRyugi: "data/ryugi/",
  dataRyugiKenkaya: "data/ryugi/kenkaya/",
  dataIkizamaBurai: "data/ikizama/burai/",
  releaseNotes: "release-notes/",
  mdxTest: "-local/mdx-test/",
  callouts: "-local/callouts/",
  npcCards: "-local/npc-cards/",
  skillCards: "-local/skill-cards/",
  dataItemsWeapons: "data/items/weapons/",
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

export const visualOutputDir = "test-results/visual";

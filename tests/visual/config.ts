declare const process: {
  env: {
    VISUAL_BASE_HOST?: string;
    VISUAL_BASE_PATH?: string;
    VISUAL_BASE_PORT?: string;
    VISUAL_TARGET_URL?: string;
  };
};

export type VisualEnvironment = {
  VISUAL_BASE_HOST?: string;
  VISUAL_BASE_PATH?: string;
  VISUAL_BASE_PORT?: string;
  VISUAL_TARGET_URL?: string;
};

export function resolveVisualBaseUrl(environment: VisualEnvironment): string {
  const targetUrl = environment.VISUAL_TARGET_URL;
  if (targetUrl) {
    return targetUrl.replace(/\/?$/, "/");
  }

  const host = environment.VISUAL_BASE_HOST ?? "http://127.0.0.1";
  const port = environment.VISUAL_BASE_PORT ?? "4321";
  const basePath = environment.VISUAL_BASE_PATH ?? "/neon-underrealm-trpg";
  return `${host}:${port}${basePath.replace(/\/?$/, "/")}`;
}

export const visualBaseUrl = resolveVisualBaseUrl(process.env);

export const visualRoutes = {
  home: "./",
  introduction: "introduction/",
  rules: "rules/",
  scenarioPlay: "rules/scenario-play/",
  battle: "rules/battle/",
  advancement: "advancement/",
  world: "world/",
  characterMaking: "character-making/",
  releaseNotes: "release-notes/",
  mdxTest: "-local/mdx-test/",
  callouts: "-local/callouts/",
  npcCards: "-local/npc-cards/",
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

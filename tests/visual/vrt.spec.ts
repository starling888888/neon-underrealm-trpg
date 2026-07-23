import { expect, type Page, test } from "@playwright/test";
import { visualRoutes, visualViewports } from "./config";

type ViewportName = keyof typeof visualViewports;
type State =
  | "default"
  | "home-viewport"
  | "mobile-menu-open"
  | "mobile-page-toc-open"
  | "no-toc-home"
  | "no-toc-not-found"
  | "no-toc-release-notes"
  | "search-open"
  | "search-results";

type Scenario = {
  fullPage?: boolean;
  route: string;
  state?: State;
  target: string;
  viewports?: readonly ViewportName[];
};

const allViewports = ["desktop", "tablet", "mobile"] as const;
const mobileOnly = ["mobile"] as const;

const scenarios: readonly Scenario[] = [
  { target: "404", route: visualRoutes.notFound },
  { target: "advancement", route: visualRoutes.advancement },
  { target: "base-layout", route: visualRoutes.mdxTest },
  { target: "battle", route: visualRoutes.battle },
  { target: "callout", route: visualRoutes.callouts },
  { target: "character-making", route: visualRoutes.characterMaking },
  { target: "common-skills", route: visualRoutes.commonSkills },
  { target: "current-menu-highlight", route: visualRoutes.world },
  { target: "data", route: visualRoutes.data },
  { target: "data-cards", route: visualRoutes.dataCards },
  { target: "global-styles", route: visualRoutes.styleTiles },
  { target: "header-footer", route: visualRoutes.headerFooter },
  { target: "home", route: visualRoutes.home },
  {
    target: "home",
    route: visualRoutes.home,
    state: "home-viewport",
    fullPage: false,
  },
  { target: "ikizama-detail", route: visualRoutes.dataIkizamaBurai },
  { target: "ikizama-index", route: visualRoutes.dataIkizama },
  { target: "introduction", route: visualRoutes.introduction },
  { target: "items", route: visualRoutes.dataItems },
  { target: "items-armors", route: visualRoutes.dataItemsArmors },
  { target: "items-cybernetics", route: visualRoutes.dataItemsCybernetics },
  { target: "items-drugs", route: visualRoutes.dataItemsDrugs },
  { target: "items-nanomachines", route: visualRoutes.dataItemsNanomachines },
  { target: "items-omamori", route: visualRoutes.dataItemsOmamori },
  { target: "items-weapons", route: visualRoutes.dataItemsWeapons },
  { target: "npc-card", route: visualRoutes.npcCards },
  { target: "page-navigation-links", route: visualRoutes.pageNavigation },
  { target: "page-toc", route: visualRoutes.mdxTest },
  {
    target: "page-toc",
    route: visualRoutes.home,
    state: "no-toc-home",
    viewports: ["desktop"],
  },
  {
    target: "page-toc",
    route: visualRoutes.notFound,
    state: "no-toc-not-found",
    viewports: ["desktop"],
  },
  {
    target: "page-toc",
    route: visualRoutes.releaseNotes,
    state: "no-toc-release-notes",
    viewports: ["desktop"],
  },
  { target: "release-notes", route: visualRoutes.releaseNotes },
  { target: "rules", route: visualRoutes.rules },
  { target: "ryugi-detail", route: visualRoutes.dataRyugiKenkaya },
  { target: "ryugi-index", route: visualRoutes.dataRyugi },
  { target: "scenario-play", route: visualRoutes.scenarioPlay },
  { target: "site-layout", route: visualRoutes.mdxTest },
  {
    target: "site-layout",
    route: visualRoutes.dataItemsWeapons,
    state: "mobile-menu-open",
    viewports: mobileOnly,
  },
  {
    target: "site-layout",
    route: visualRoutes.mdxTest,
    state: "mobile-page-toc-open",
    viewports: mobileOnly,
  },
  { target: "site-menu", route: visualRoutes.world },
  { target: "support", route: visualRoutes.support },
  { target: "world", route: visualRoutes.world },
  {
    target: "mobile-menu",
    route: visualRoutes.dataItemsWeapons,
    state: "default",
    viewports: mobileOnly,
  },
  {
    target: "mobile-menu",
    route: visualRoutes.dataItemsWeapons,
    state: "mobile-menu-open",
    viewports: mobileOnly,
  },
  {
    target: "mobile-page-toc",
    route: visualRoutes.mdxTest,
    state: "default",
    viewports: mobileOnly,
  },
  {
    target: "mobile-page-toc",
    route: visualRoutes.mdxTest,
    state: "mobile-page-toc-open",
    viewports: mobileOnly,
  },
  {
    target: "search-modal",
    route: visualRoutes.commonSkills,
    state: "search-open",
    fullPage: false,
  },
  {
    target: "search-modal",
    route: visualRoutes.commonSkills,
    state: "search-results",
    fullPage: false,
  },
];

for (const scenario of scenarios) {
  for (const viewportName of scenario.viewports ?? allViewports) {
    test(`VRT ${scenario.target} ${scenario.state ?? "default"} ${viewportName}`, async ({
      page,
    }) => {
      await page.setViewportSize(visualViewports[viewportName]);
      await page.goto(scenario.route);
      await expect(page.locator("body")).toBeVisible();
      await prepareState(page, scenario.state ?? "default");

      await expect(page).toHaveScreenshot(
        `${scenario.target}-${scenario.state ?? "default"}-${viewportName}.png`,
        {
          animations: "disabled",
          fullPage: scenario.fullPage ?? true,
        },
      );
    });
  }
}

async function prepareState(page: Page, state: State): Promise<void> {
  if (state === "mobile-menu-open") {
    await page.locator("[data-mobile-menu-open]").click();
    await expect(page.locator("#mobile-site-menu-drawer")).toBeVisible();
    return;
  }

  if (state === "mobile-page-toc-open") {
    await page.locator("[data-mobile-page-toc-trigger]").click();
    await expect(page.locator("[data-mobile-page-toc-panel]")).toBeVisible();
    return;
  }

  if (state === "search-open" || state === "search-results") {
    const desktopInput = page.locator("[data-search-desktop-input]");
    const mobileToggle = page.locator("[data-search-mobile-toggle]");
    const usesDesktopInput = await desktopInput.isVisible();
    const input = usesDesktopInput
      ? desktopInput
      : page.locator("[data-search-mobile-input]");

    if (usesDesktopInput) {
      await desktopInput.focus();
    } else {
      await mobileToggle.click();
    }

    await expect(page.locator("[data-search-panel]")).toBeVisible();

    if (state === "search-results") {
      await input.fill("基本の一撃");
      if (!usesDesktopInput) {
        await page.locator(".mobile-search-submit").click();
      }
      await expect(page.locator("[data-search-results-list]")).toBeVisible();
    }
  }
}

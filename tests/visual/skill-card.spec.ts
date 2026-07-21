import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";

async function hideAstroDevToolbar(page: Page) {
  await page.locator("astro-dev-toolbar").evaluateAll((elements) => {
    for (const element of elements) {
      element.remove();
    }
  });
}

async function expectSkillCardCatalog(page: Page) {
  const cards = page.locator("[data-skill-card]");

  await expect(page).toHaveTitle(
    "スキルカード カタログ | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(cards).not.toHaveCount(0);
  await expect(cards.locator(".skill-card-summary")).toHaveCount(0);

  const gridHeights = await page
    .locator("[data-card-container]")
    .evaluateAll((grids) =>
      grids.map((grid) =>
        Array.from(grid.querySelectorAll("[data-skill-card]"), (card) =>
          Math.round(card.getBoundingClientRect().height),
        ),
      ),
    );
  for (const heights of gridHeights) {
    expect(new Set(heights).size).toBe(1);
  }

  await expect
    .poll(async () => {
      return await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
    })
    .toBe(0);
}

test("スキルカード カタログ desktop @skill-card-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.skillCards);
  await expectSkillCardCatalog(page);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/skill-card-desktop.png`,
  });
});

test("スキルカード カタログ mobile @skill-card-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.skillCards);
  await expectSkillCardCatalog(page);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/skill-card-mobile.png`,
  });
});

import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";

async function hideAstroDevToolbar(page: Page) {
  await page.locator("astro-dev-toolbar").evaluateAll((elements) => {
    for (const element of elements) {
      element.remove();
    }
  });
}

async function expectDataCardCatalog(page: Page) {
  const cards = page.locator("[data-card-container] > .data-card");

  await expect(page).toHaveTitle(
    "データカード カタログ | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(cards).toHaveCount(7);
  await expect(page.locator("[data-skill-card]")).toHaveCount(1);
  await expect(page.locator("[data-weapon-card]")).toHaveCount(1);
  await expect(page.locator("[data-armor-card]")).toHaveCount(1);
  await expect(page.locator("[data-omamori-card]")).toHaveCount(1);
  await expect(page.locator("[data-cybernetic-card]")).toHaveCount(1);
  await expect(page.locator("[data-nanomachine-card]")).toHaveCount(1);
  await expect(page.locator("[data-drug-card]")).toHaveCount(1);
  await expect(page.locator(".skill-card-summary")).toHaveCount(0);

  const gridHeights = await page
    .locator("[data-card-container]")
    .evaluateAll((grids) =>
      grids.map((grid) =>
        Array.from(grid.querySelectorAll(":scope > .data-card"), (card) => {
          const rectangle = card.getBoundingClientRect();
          return {
            height: Math.round(rectangle.height),
            top: Math.round(rectangle.top),
          };
        }),
      ),
    );
  for (const cards of gridHeights) {
    const heightsByRow = Map.groupBy(cards, (card) => card.top);
    for (const row of heightsByRow.values()) {
      expect(new Set(row.map((card) => card.height)).size).toBe(1);
    }
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

test("データカード カタログ desktop @data-cards-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.dataCards);
  await expectDataCardCatalog(page);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/data-cards-desktop.png`,
  });
});

test("データカード カタログ mobile @data-cards-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.dataCards);
  await expectDataCardCatalog(page);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/data-cards-mobile.png`,
  });
});

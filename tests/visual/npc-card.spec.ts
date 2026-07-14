import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";

async function hideAstroDevToolbar(page: Page) {
  await page.locator("astro-dev-toolbar").evaluateAll((elements) => {
    for (const element of elements) {
      element.remove();
    }
  });
}

async function expectNpcCardCatalog(page: Page) {
  const cards = page.locator("[data-npc-card]");

  await expect(page).toHaveTitle(
    "NPCカード カタログ | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(cards).not.toHaveCount(0);
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

test("NPCカード カタログ desktop @npc-card-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.npcCards);
  await expectNpcCardCatalog(page);
  const portraitSize = await page
    .locator(".npc-card-portrait")
    .first()
    .evaluate((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    });
  expect(portraitSize.width).toBeGreaterThan(0);
  expect(portraitSize.height).toBeGreaterThan(0);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/npc-card-desktop.png`,
  });
});

test("NPCカード カタログ mobile @npc-card-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.npcCards);
  await expectNpcCardCatalog(page);
  const portraitSize = await page
    .locator(".npc-card-portrait")
    .first()
    .evaluate((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    });
  expect(portraitSize.width).toBeGreaterThan(0);
  expect(portraitSize.height).toBeGreaterThan(0);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/npc-card-mobile.png`,
  });
});

import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";
import { expectGeneratedPageToc } from "./helpers/page-toc";

async function expectArmorsPage(page: Page) {
  const article = page.locator("article.mdx-layout");
  const hero = article.locator(
    "img[src$='images/data/items/armors_hero.webp']",
  );
  const legend = article.locator(".armor-legend");
  const armorList = article.locator(
    '[data-card-container][aria-label="防具一覧"]',
  );

  await expect(page).toHaveTitle(
    "防具 | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "防具", exact: true }),
  ).toHaveCount(1);
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute("alt", "");
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(legend.locator("[data-armor-card]")).toHaveCount(1);
  await expect(legend).toContainText("⑤肉体4以上");
  await expect(armorList.locator("[data-armor-card]")).toHaveCount(16);
  await expect(armorList.locator("[data-armor-card]").first()).toHaveAttribute(
    "id",
    /item-armor-/,
  );
  await expectGeneratedPageToc(page, "防具一覧");
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

test("防具一覧 desktop @items-armors-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.dataItemsArmors);
  await expectArmorsPage(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/items-armors-desktop.png`,
  });
});

test("防具一覧 mobile @items-armors-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.dataItemsArmors);
  await expectArmorsPage(page);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toContainText(
    "防具一覧",
  );
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/items-armors-mobile.png`,
  });
});

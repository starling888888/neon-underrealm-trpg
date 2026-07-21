import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";
import { expectGeneratedPageToc } from "./helpers/page-toc";

async function hideAstroDevToolbar(page: Page) {
  await page.locator("astro-dev-toolbar").evaluateAll((elements) => {
    for (const element of elements) {
      element.remove();
    }
  });
}

async function expectRyugiIndexPage(page: Page) {
  const article = page.locator("article.ryugi-index");
  const ryugiList = article.locator("[data-ryugi-list]");

  await expect(page).toHaveTitle(
    "流儀 | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "流儀", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "流儀データの見方", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "流儀一覧", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.locator("img[src$='images/data/ryugi_hero.webp']"),
  ).toHaveCount(1);
  await expect(
    article.locator("[data-ryugi-data-section][data-ryugi-id='kenkaya']"),
  ).toHaveCount(1);
  await expect(ryugiList.locator("li")).toHaveCount(10);
  await expect(ryugiList.locator("a").first()).toHaveText("ケンカヤ");
  await expect(ryugiList).not.toContainText("流儀詳細を見る");
  await expectGeneratedPageToc(page, "流儀一覧");
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

test("流儀一覧 desktop @ryugi-index-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.dataRyugi);
  await expectRyugiIndexPage(page);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/ryugi-index-desktop.png`,
  });
});

test("流儀一覧 mobile @ryugi-index-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.dataRyugi);
  await expectRyugiIndexPage(page);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/ryugi-index-mobile.png`,
  });
});

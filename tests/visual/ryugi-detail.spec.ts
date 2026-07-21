import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";
import { expectGeneratedPageToc } from "./helpers/page-toc";

async function expectRyugiDetailPage(page: Page) {
  const article = page.locator("article.ryugi-detail");
  const dataSection = article.locator("[data-ryugi-data-section]");

  await expect(article.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(article.locator(".ryugi-hero")).toBeVisible();
  await expect(dataSection).toBeVisible();
  await expect(
    dataSection.getByRole("heading", { name: "流儀データ", exact: true }),
  ).toHaveCount(1);
  await expect(article.locator("[data-ryugi-skills]")).toBeVisible();
  await expect(
    article.locator("[data-skill-card] .skill-card-max-level").first(),
  ).toBeVisible();
  await expectGeneratedPageToc(page, "流儀データ");
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

test("流儀詳細 desktop @ryugi-detail-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.dataRyugiKenkaya);
  await expectRyugiDetailPage(page);

  const columns = await page
    .locator("[data-ryugi-data-section] > .ryugi-data-grid")
    .evaluate((grid) => window.getComputedStyle(grid).gridTemplateColumns);

  expect(columns.trim().split(/\s+/)).toHaveLength(3);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/ryugi-detail-desktop.png`,
  });
});

test("流儀詳細 mobile @ryugi-detail-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.dataRyugiKenkaya);
  await expectRyugiDetailPage(page);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();

  const columns = await page
    .locator("[data-ryugi-data-section] > .ryugi-data-grid")
    .evaluate((grid) => window.getComputedStyle(grid).gridTemplateColumns);

  expect(columns.trim().split(/\s+/)).toHaveLength(2);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/ryugi-detail-mobile.png`,
  });
});

test("流儀詳細 tablet @ryugi-detail-tablet", async ({ page }) => {
  await page.setViewportSize(visualViewports.tablet);
  await page.goto(visualRoutes.dataRyugiKenkaya);
  await expectRyugiDetailPage(page);

  const columns = await page
    .locator("[data-ryugi-data-section] > .ryugi-data-grid")
    .evaluate((grid) => window.getComputedStyle(grid).gridTemplateColumns);

  expect(columns.trim().split(/\s+/)).toHaveLength(2);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/ryugi-detail-tablet.png`,
  });
});

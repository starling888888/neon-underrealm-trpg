import { expect, type Locator, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";
import { expectGeneratedPageToc } from "./helpers/page-toc";

async function expectIkizamaDetailPage(page: Page): Promise<Locator> {
  const article = page.locator("article.ikizama-detail");
  const dataSection = article.locator("[data-ikizama-data-section]");

  await expect(article.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(article.locator(".ikizama-hero")).toBeVisible();
  await expect(dataSection).toBeVisible();
  await expect(
    dataSection.getByRole("heading", { name: "生き様データ", exact: true }),
  ).toHaveCount(1);
  await expect(
    dataSection.getByRole("heading", { name: "生き様ボーナス", exact: true }),
  ).toHaveCount(1);
  await expect(dataSection.locator("[data-skill-card]")).toHaveCount(1);
  await expect(article.locator("[data-ikizama-skills]")).toBeVisible();
  await expect(
    article.locator("[data-ikizama-exclusive-item] a"),
  ).toBeVisible();
  await expectGeneratedPageToc(page, "生き様データ");
  await expect
    .poll(async () => {
      return await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
    })
    .toBe(0);

  return dataSection;
}

async function expectDataLayout(
  dataSection: Locator,
  viewport: "desktop" | "mobile",
) {
  const grid = dataSection.locator(".ikizama-data-grid");
  const [bonus, points, coefficients] = await Promise.all([
    grid.locator(".ikizama-data-bonus").boundingBox(),
    grid.locator(".ikizama-data-points").boundingBox(),
    grid.locator(".ikizama-data-coefficients").boundingBox(),
  ]);

  expect(bonus).not.toBeNull();
  expect(points).not.toBeNull();
  expect(coefficients).not.toBeNull();

  if (!bonus || !points || !coefficients) return;

  if (viewport === "desktop") {
    const columns = await grid.evaluate(
      (element) => window.getComputedStyle(element).gridTemplateColumns,
    );
    expect(columns.trim().split(/\s+/)).toHaveLength(3);
    expect(bonus.x).toBeLessThan(points.x);
    expect(points.x).toBeLessThan(coefficients.x);
    expect(bonus.y).toBeCloseTo(points.y, 0);
    expect(points.y).toBeCloseTo(coefficients.y, 0);
    return;
  }

  expect(bonus.x).toBeLessThan(points.x);
  expect(bonus.y).toBeCloseTo(points.y, 0);
  expect(coefficients.y).toBeGreaterThan(bonus.y);
  expect(coefficients.width).toBeGreaterThan(points.width * 1.8);
}

test("生き様詳細 desktop @ikizama-detail-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.dataIkizamaBurai);
  const dataSection = await expectIkizamaDetailPage(page);
  await expectDataLayout(dataSection, "desktop");
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/ikizama-detail-desktop.png`,
  });
});

test("生き様詳細 mobile @ikizama-detail-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.dataIkizamaBurai);
  const dataSection = await expectIkizamaDetailPage(page);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await expectDataLayout(dataSection, "mobile");
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/ikizama-detail-mobile.png`,
  });
});

test("生き様詳細 tablet @ikizama-detail-tablet", async ({ page }) => {
  await page.setViewportSize(visualViewports.tablet);
  await page.goto(visualRoutes.dataIkizamaBurai);
  await expectIkizamaDetailPage(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/ikizama-detail-tablet.png`,
  });
});

import { expect, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";

test("site layout desktop @site-layout-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.mdxTest);
  await expect(page.locator("body")).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/site-layout-desktop.png`,
  });
});

test("site layout tablet @site-layout-tablet", async ({ page }) => {
  await page.setViewportSize(visualViewports.tablet);
  await page.goto(visualRoutes.mdxTest);
  await expect(page.locator("body")).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/site-layout-tablet.png`,
  });
});

test("site layout mobile @site-layout-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.mdxTest);
  await expect(page.locator("body")).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/site-layout-mobile.png`,
  });
});

test("site layout mobile menu open @site-layout-mobile-menu-open", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.dataItemsWeapons);
  await page.locator("[data-mobile-menu-open]").click();
  await expect(page.locator("#mobile-site-menu-drawer")).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/site-layout-mobile-menu-open.png`,
  });
});

test("site layout mobile page toc open @site-layout-mobile-page-toc-open", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.mdxTest);
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/site-layout-mobile-page-toc-open.png`,
  });
});

test("site layout home no toc @site-layout-home-no-toc", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.home);
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("[data-page-toc-empty='true']")).toHaveCount(0);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/site-layout-home-no-toc.png`,
  });
});

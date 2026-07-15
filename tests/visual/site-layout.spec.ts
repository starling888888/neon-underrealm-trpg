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

test("site layout tablet keeps the header above the sticky page heading @site-layout-scroll-behavior", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.tablet);
  await page.goto(visualRoutes.mdxTest);
  const header = page.locator("[data-site-header]");
  const heading = page.locator("[data-mobile-page-heading]");

  await page.evaluate(() => window.scrollTo(0, 520));
  await expect
    .poll(async () => Math.round((await header.boundingBox())?.y ?? Number.NaN))
    .toBe(0);
  await expect
    .poll(async () =>
      Math.round((await heading.boundingBox())?.y ?? Number.NaN),
    )
    .toBe(88);
});

test("site layout keeps the header fixed at the 768px tablet boundary @site-layout-scroll-behavior", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto(visualRoutes.mdxTest);
  const header = page.locator("[data-site-header]");

  await page.evaluate(() => window.scrollTo(0, 520));
  await expect(header).not.toHaveClass(/is-hidden/);
  await expect
    .poll(async () => Math.round((await header.boundingBox())?.y ?? Number.NaN))
    .toBe(0);
});

test("site layout mobile @site-layout-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.mdxTest);
  await expect(page.locator("body")).toBeVisible();
  await expect(page.locator("[data-mobile-page-heading]")).toBeVisible();
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
  await expect(page.locator("[data-mobile-page-heading]")).toBeVisible();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/site-layout-mobile-page-toc-open.png`,
  });
});

test("site layout mobile page toc sticky @site-layout-mobile-page-toc-sticky", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.mdxTest);
  const heading = page.locator("[data-mobile-page-heading]");

  await expect(heading).toBeVisible();
  await page.evaluate(() => window.scrollTo(0, 520));
  await expect
    .poll(async () => {
      const box = await heading.boundingBox();
      return Math.round(box?.y ?? Number.NaN);
    })
    .toBe(0);
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/site-layout-mobile-page-toc-sticky.png`,
  });
});

test("site layout mobile header follows scroll direction and overlay state @site-layout-scroll-behavior", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(visualRoutes.world);
  const header = page.locator("[data-site-header]");
  const trigger = page.locator("[data-mobile-page-toc-trigger]");

  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(header).toHaveClass(/is-hidden/);

  await page.evaluate(() => window.scrollTo(0, 420));
  await expect(header).not.toHaveClass(/is-hidden/);
  await page.waitForTimeout(40);
  await expect
    .poll(async () => {
      return await page.evaluate(() => {
        const headerElement = document.querySelector("[data-site-header]");
        const headingElement = document.querySelector(
          "[data-mobile-page-heading]",
        );

        if (!headerElement || !headingElement) {
          return Number.NaN;
        }

        return Math.round(
          headingElement.getBoundingClientRect().top -
            headerElement.getBoundingClientRect().bottom,
        );
      });
    })
    .toBeLessThanOrEqual(1);
  await expect
    .poll(async () => Math.round((await header.boundingBox())?.y ?? Number.NaN))
    .toBe(0);

  await page.evaluate(() => window.scrollTo(0, 900));
  await expect(header).toHaveClass(/is-hidden/);
  await trigger.click();
  await expect(header).not.toHaveClass(/is-hidden/);
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeVisible();
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

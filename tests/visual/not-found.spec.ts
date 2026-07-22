import { test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";

test("not found desktop @404-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.notFound);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/404-desktop.png`,
  });
});

test("not found mobile @404-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.notFound);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/404-mobile.png`,
  });
});

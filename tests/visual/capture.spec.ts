import { expect, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";

test("desktop screenshot", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.home);
  await expect(page.locator("body")).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/actual-desktop.png`,
  });
});

test("mobile screenshot", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.home);
  await expect(page.locator("body")).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/actual-mobile.png`,
  });
});

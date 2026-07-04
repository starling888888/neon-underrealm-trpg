import { expect, test } from "@playwright/test";

declare const process: {
  env: {
    VISUAL_TARGET_URL?: string;
  };
};

const targetUrl =
  process.env.VISUAL_TARGET_URL ??
  "http://localhost:4321/neon-underrealm-trpg/";

test("desktop screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto(targetUrl);
  await expect(page.locator("body")).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: "test-results/visual/actual-desktop.png",
  });
});

test("mobile screenshot", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto(targetUrl);
  await expect(page.locator("body")).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: "test-results/visual/actual-mobile.png",
  });
});

import { expect, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";

test("home desktop viewport @home-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.home);

  await expect(
    page.getByRole("heading", { name: "最新リリースノート" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "更新履歴を見る" }),
  ).toBeVisible();
  await expect(
    page
      .getByLabel("最新リリースノート")
      .getByRole("link", { name: "はじめに" }),
  ).toBeVisible();
  await expect(page.locator("[data-page-toc-empty='true']")).toHaveCount(0);
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/home-desktop.png`,
  });
});

test("home desktop full page @home-desktop-full", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.home);

  await expect(page.getByRole("heading", { name: "クレジット" })).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/home-desktop-full.png`,
  });
});

test("home mobile viewport @home-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.home);

  await expect(
    page.getByRole("heading", { name: "最新リリースノート" }),
  ).toBeVisible();
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toHaveCount(0);
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/home-mobile.png`,
  });
});

test("home mobile full page @home-mobile-full", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.home);

  await expect(
    page.getByRole("heading", { name: "利用について" }),
  ).toBeVisible();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/home-mobile-full.png`,
  });
});

import { expect, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";

test("search panel desktop @search-modal-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.mdxTest);

  const searchInput = page.locator("[data-search-desktop-input]");
  const panel = page.locator("[data-search-panel]");

  await searchInput.focus();
  await expect(panel).toBeVisible();
  await expect(page.locator("[data-search-scrim]")).toBeVisible();
  await expect(searchInput).toHaveAttribute("aria-expanded", "true");
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/search-modal-desktop.png`,
  });

  await page.locator("[data-search-scrim]").click({ position: { x: 8, y: 8 } });
  await expect(panel).toBeHidden();
  await expect(searchInput).toBeFocused();
});

test("search panel mobile @search-modal-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.mdxTest);

  const toggle = page.locator("[data-search-mobile-toggle]");
  const panel = page.locator("[data-search-panel]");

  await toggle.click();
  await expect(panel).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-label", "検索を閉じる");
  await expect(page.locator("body")).toHaveClass(/search-open/);
  await expect(page.locator("[data-search-mobile-input]")).toBeFocused();
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/search-modal-mobile.png`,
  });

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(toggle).toHaveAttribute("aria-label", "検索を開く");
  await expect(toggle).toBeFocused();
});

test("search panel closes when another mobile overlay opens @search-modal-overlay", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.mdxTest);

  const searchToggle = page.locator("[data-search-mobile-toggle]");
  const searchPanel = page.locator("[data-search-panel]");
  const menuToggle = page.locator("[data-mobile-menu-open]");

  await searchToggle.click();
  await expect(searchPanel).toBeVisible();
  await menuToggle.click();
  await expect(searchPanel).toBeHidden();
  await expect(page.locator("#mobile-site-menu-drawer")).toBeVisible();

  await page.locator("[data-mobile-menu-close]").first().click();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeVisible();

  await searchToggle.click();
  await expect(searchPanel).toBeVisible();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
});

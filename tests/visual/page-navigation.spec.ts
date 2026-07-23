import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";

async function hideAstroDevToolbar(page: Page) {
  await page.locator("astro-dev-toolbar").evaluateAll((elements) => {
    elements.forEach((element) => {
      element.remove();
    });
  });
}

async function expectPageNavigation(page: Page) {
  const navigation = page.getByRole("navigation", {
    name: "ページ間ナビゲーション",
  });

  await expect(navigation).toBeVisible();
  await expect(navigation.getByRole("link")).toHaveCount(2);
  await expect(
    navigation.getByRole("link", { name: "キャラクターメイキング" }),
  ).toHaveAttribute("href", /\/character-making$/);
  await expect(
    navigation.getByRole("link", { name: "シナリオ進行" }),
  ).toHaveAttribute("href", /\/rules\/scenario-play$/);
  await expect
    .poll(async () => {
      return await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
    })
    .toBe(0);

  await navigation.scrollIntoViewIfNeeded();
  await hideAstroDevToolbar(page);
}

test("page navigation desktop @page-navigation-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.rules);
  await expectPageNavigation(page);
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/page-navigation-desktop.png`,
  });
});

test("page navigation mobile @page-navigation-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.rules);
  await expectPageNavigation(page);
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/page-navigation-mobile.png`,
  });
});

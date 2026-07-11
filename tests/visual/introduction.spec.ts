import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";
import { expectGeneratedPageToc } from "./helpers/page-toc";

async function hideAstroDevToolbar(page: Page) {
  await page.locator("astro-dev-toolbar").evaluateAll((elements) => {
    for (const element of elements) {
      element.remove();
    }
  });
}

async function expectIntroductionContent(page: Page) {
  const goldenRule = page.locator("[data-callout-type='warning']");

  await expect(page).toHaveTitle(
    "はじめに | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(page.getByRole("heading", { name: "はじめに" })).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "ゴールデンルール", exact: true }),
  ).toHaveCount(1);
  const calloutTitleTagName = await goldenRule
    .locator(".callout-title")
    .evaluate((element) => element.tagName);
  expect(calloutTitleTagName).toBe("H2");
  await expect(goldenRule.locator("p")).toHaveCount(2);
  await expect(goldenRule.locator("ol")).toHaveCount(1);
  await expect(goldenRule.locator("strong")).toHaveCount(4);
  await expect(
    page.locator("li").filter({ hasText: "判定に6面体サイコロは使いません。" }),
  ).toHaveCount(1);
  await expect(page.locator("a[href*='/support']")).toHaveCount(0);
  await expect(
    page.locator(".site-menu-link[aria-current='page']"),
  ).toHaveCount(2);
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

test("introduction desktop @introduction-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.introduction);
  await expectIntroductionContent(page);
  await expectGeneratedPageToc(page, "ゴールデンルール");
  await page.locator("[data-callout-type='warning']").scrollIntoViewIfNeeded();
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/introduction-desktop.png`,
  });
});

test("introduction mobile @introduction-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.introduction);
  await expectIntroductionContent(page);
  await expectGeneratedPageToc(page, "ゴールデンルール");
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toContainText(
    "ゴールデンルール",
  );
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
  await page.locator("[data-callout-type='warning']").scrollIntoViewIfNeeded();
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/introduction-mobile.png`,
  });
});

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

async function expectCalloutTitleLevels(page: Page) {
  const legacyTitles = page.locator("[data-callout-type] span.callout-title");
  const tocHeadingTitle = page.locator("[data-callout-type] h3.callout-title");
  const nonTocHeadingTitles = page.locator(
    "[data-callout-type] h4.callout-title, [data-callout-type] h5.callout-title, [data-callout-type] h6.callout-title",
  );
  const { desktop: desktopToc, mobile: mobileToc } =
    await expectGeneratedPageToc(page, "既定ラベル");

  await expect(legacyTitles).toHaveCount(8);
  await expect(tocHeadingTitle).toHaveText("見出しレベル指定");
  await expect(nonTocHeadingTitles).toHaveText([
    "H4見出し",
    "H5見出し",
    "H6見出し",
  ]);
  await expect(desktopToc).toContainText("見出しレベル指定");
  await expect(mobileToc).toContainText("見出しレベル指定");

  for (const title of [
    "コンボ中の注意",
    "処理例",
    "H4見出し",
    "H5見出し",
    "H6見出し",
  ]) {
    await expect(desktopToc).not.toContainText(title);
    await expect(mobileToc).not.toContainText(title);
  }
}

test("callout desktop @callout-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.callouts);
  await expect(
    page.getByRole("heading", { name: "Callout一覧確認" }),
  ).toBeVisible();
  await expect(page.locator("[data-callout-type]")).toHaveCount(12);
  await expectCalloutTitleLevels(page);
  await expect
    .poll(async () => {
      return await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
    })
    .toBe(0);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/callout-desktop.png`,
  });
});

test("callout mobile @callout-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.callouts);
  await expect(
    page.getByRole("heading", { name: "Callout一覧確認" }),
  ).toBeVisible();
  await expect(page.locator("[data-callout-type]")).toHaveCount(12);
  await expectCalloutTitleLevels(page);
  await expect
    .poll(async () => {
      return await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
    })
    .toBe(0);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/callout-mobile.png`,
  });
});

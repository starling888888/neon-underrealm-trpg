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

async function expectLegacyCalloutTitles(page: Page) {
  const titles = page.locator("[data-callout-type] .callout-title");
  const { desktop: desktopToc, mobile: mobileToc } =
    await expectGeneratedPageToc(page, "既定ラベル");

  await expect(titles).toHaveCount(8);
  expect(
    await titles.evaluateAll((elements) =>
      elements.every((element) => element.tagName === "SPAN"),
    ),
  ).toBe(true);

  for (const title of ["コンボ中の注意", "処理例"]) {
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
  await expect(page.locator("[data-callout-type]")).toHaveCount(8);
  await expectLegacyCalloutTitles(page);
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
  await expect(page.locator("[data-callout-type]")).toHaveCount(8);
  await expectLegacyCalloutTitles(page);
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

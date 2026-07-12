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

async function expectScenarioPlayContent(page: Page) {
  const article = page.locator("article.mdx-layout");

  await expect(page).toHaveTitle(
    "シナリオ進行ルール | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "シナリオ進行ルール", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "情報収集と小銭" }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "シーン中の縁" }),
  ).toHaveCount(1);
  await expect(article.locator("[data-callout-type='example']")).toContainText(
    "判定数14",
  );
  await expect(article).toContainText(
    "各PCは、1つの情報収集シーンにつき1回だけ判定できます",
  );
  await expect(article).toContainText(
    "シナリオ中に増えず、使った分だけ減ります",
  );
  const hero = article.locator("img[src$='images/scenario-play/hero.webp']");
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(
    hero.locator("xpath=ancestor::figure").locator("figcaption"),
  ).toHaveCount(0);
  await expectGeneratedPageToc(page, "情報収集と小銭");
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

test("scenario play desktop @scenario-play-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.scenarioPlay);
  await expectScenarioPlayContent(page);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/scenario-play-desktop.png`,
  });
});

test("scenario play mobile @scenario-play-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.scenarioPlay);
  await expectScenarioPlayContent(page);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/scenario-play-mobile.png`,
  });
});

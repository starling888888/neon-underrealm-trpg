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

async function expectRulesContent(page: Page) {
  const article = page.locator("article.mdx-layout");

  await expect(page).toHaveTitle(
    "ルール | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "ルール", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "判定の流れ" }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "達成値と効果値" }),
  ).toHaveCount(1);
  await expect(article.locator("[data-callout-type='example']")).toHaveCount(1);
  await expect(article.locator("[data-callout-type='example']")).toContainText(
    "11個の10面体ダイス",
  );
  await expect(article.locator("[data-callout-type='example']")).toContainText(
    "1, 1, 3, 4, 5, 5, 7, 8, 10, 10, 10",
  );
  await expect(article.locator("[data-callout-type='example']")).toContainText(
    "達成値は6、効果値は5",
  );
  await expect(article).toContainText("基準値の上限は 9、下限は 1");
  const hero = article.locator("img[src$='images/rules/hero.webp']");
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute(
    "alt",
    "机上を転がる2個の10面体ダイスを見つめる、オオサカの裏社会の3人。窓の外に通天閣を思わせる塔が見える。",
  );
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(
    hero.locator("xpath=ancestor::figure").locator("figcaption"),
  ).toHaveCount(0);
  await expect(
    article.locator("a[href$='introduction#h-f3926bd3']"),
  ).toHaveCount(2);
  await expect(article.locator("a[href$='rules/scenario-play']")).toHaveCount(
    1,
  );
  await expect(article.locator("a[href$='rules/battle']")).toHaveCount(1);
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

test("rules desktop @rules-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.rules);
  await expectRulesContent(page);
  await expectGeneratedPageToc(page, "達成値と効果値");
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/rules-desktop.png`,
  });
});

test("rules mobile @rules-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.rules);
  await expectRulesContent(page);
  await expectGeneratedPageToc(page, "達成値と効果値");
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toContainText(
    "達成値と効果値",
  );
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/rules-mobile.png`,
  });
});

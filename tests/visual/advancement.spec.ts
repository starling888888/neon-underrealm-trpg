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

async function expectAdvancementContent(page: Page) {
  const article = page.locator("article.mdx-layout");

  await expect(page).toHaveTitle(
    "成長ルール | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "成長ルール", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "経験点を使用した成長" }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "能力値の成長" }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "アイテムと信用" }),
  ).toHaveCount(1);
  const hero = article.locator("img[src$='images/advancement/hero.webp']");
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute(
    "alt",
    "サイバネ工房で義肢を確かめる女性、銃を整備する男性、静かな部屋で本を読む人物を三分割で描いたイラスト。",
  );
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(
    hero.locator("xpath=ancestor::figure").locator("figcaption"),
  ).toHaveCount(0);
  await expect(
    article.locator("[data-callout-type='example']", {
      hasText: "格30の能力値成長",
    }),
  ).toHaveCount(1);
  await expect(
    article.locator(
      "[data-callout-type] h2.callout-title, [data-callout-type] h3.callout-title",
    ),
  ).toHaveCount(0);
  await expect
    .poll(() => article.locator("[data-ikizama-coefficients] tbody tr").count())
    .toBeGreaterThan(0);
  await expect(
    article.getByRole("link", { name: "今生の縁で外道堕ちを解消した" }),
  ).toHaveAttribute("href", "/neon-underrealm-trpg/rules/battle#h-aa7d87a4");
  await expect(
    article.getByRole("link", { name: "シナリオ進行ルール" }).first(),
  ).toHaveAttribute("href", "/neon-underrealm-trpg/rules/scenario-play");
  await expect(article).toContainText(
    "シナリオ終了後に自分の信用へ加算・累積しません",
  );
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

test("advancement desktop @advancement-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.advancement);
  await expectAdvancementContent(page);
  await expectGeneratedPageToc(page, "アイテムと信用");
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/advancement-desktop.png`,
  });
});

test("advancement mobile @advancement-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.advancement);
  await expectAdvancementContent(page);
  await expectGeneratedPageToc(page, "アイテムと信用");
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toContainText(
    "アイテムと信用",
  );
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/advancement-mobile.png`,
  });
});

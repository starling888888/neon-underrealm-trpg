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

async function expectDataContent(page: Page) {
  const article = page.locator("article.mdx-layout");
  const legend = article.locator("[data-legend-container]");

  await expect(page).toHaveTitle(
    "データ | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "データ", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "スキルの見方", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "カードの項目", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "①基本の一撃", exact: true }),
  ).toHaveCount(0);
  await expect(article.locator("[data-skill-card]")).toHaveCount(1);
  await expect(legend).toContainText("①基本の一撃");
  await expect(legend).toContainText("②1");
  await expect(legend).toContainText("③○-○");
  await expect(legend).toContainText("④気0");
  await expect(legend).toContainText("⑤能動");
  await expect(legend).toContainText("⑥自動習得");
  await expect(legend).toContainText("⑦-");
  await expect(legend).toContainText("⑧1体");
  await expect(legend).toContainText("⑨武器");
  await expect(legend).toContainText("⑩攻撃を行う。");
  await expect(legend).toContainText("取得制限");
  await expect(legend).toContainText("使用制限");
  await expect(legend).toContainText("対象");
  await expect(legend).toContainText("射程");
  await expect(legend).toContainText("効果");
  const hero = article.locator("img[src$='images/data/hero.webp']");
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute(
    "alt",
    "裏社会の作業場で、義手を持つ女性と顔に刺青のある男性が机上の武器・装備データシートを読み比べている場面。",
  );
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(
    hero.locator("xpath=ancestor::figure").locator("figcaption"),
  ).toHaveCount(0);
  await expect(
    article.locator("[data-callout-type='danger']", {
      hasText: "特別なスキル",
    }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "取得制限", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "使用制限", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "対象", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "射程", exact: true }),
  ).toHaveCount(1);
  await expect(article).toContainText("プライマリ限定");
  await expect(article).toContainText("1シナリオにN回まで使用できる。");
  await expect(
    article.getByRole("link", { name: "戦闘ルールのクロスコンボ" }),
  ).toHaveAttribute("href", "/neon-underrealm-trpg/rules/battle#cross-combo");
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

async function expectDataPageToc(page: Page) {
  const tocs = await expectGeneratedPageToc(page, "アイテム");

  await expect(tocs.desktop).not.toContainText("①基本の一撃");
  await expect(tocs.mobile).not.toContainText("①基本の一撃");
}

async function expectLegendColumns(page: Page, count: number) {
  const columns = await page
    .locator("[data-legend-container]")
    .evaluate((legend) => window.getComputedStyle(legend).gridTemplateColumns);
  expect(columns.trim().split(/\s+/)).toHaveLength(count);
}

test("data desktop @data-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.data);
  await expectDataContent(page);
  await expectDataPageToc(page);
  await expectLegendColumns(page, 3);
  await page.locator("[data-legend-container]").evaluate((element) => {
    element.scrollIntoView({ block: "start" });
  });
  await hideAstroDevToolbar(page);
  await page.screenshot({ path: `${visualOutputDir}/data-desktop.png` });
});

test("data mobile @data-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.data);
  await expectDataContent(page);
  await expectDataPageToc(page);
  await expectLegendColumns(page, 2);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toContainText(
    "アイテム",
  );
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
  await page.locator("[data-legend-container]").evaluate((element) => {
    element.scrollIntoView({ block: "start" });
  });
  await hideAstroDevToolbar(page);
  await page.screenshot({ path: `${visualOutputDir}/data-mobile.png` });
});

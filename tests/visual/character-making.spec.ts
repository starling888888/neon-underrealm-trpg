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

async function expectCharacterMakingContent(page: Page) {
  const article = page.locator("article.mdx-layout");

  await expect(page).toHaveTitle(
    "キャラクターメイキング | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    page.getByRole("heading", { name: "キャラクターメイキング" }),
  ).toHaveCount(1);
  await expect(
    article.getByText("初めて仕事人を作るなら", { exact: false }),
  ).toHaveCount(1);
  await expect(
    article.getByText("対応能力値を2倍にして判定数を決めます", {
      exact: false,
    }),
  ).toHaveCount(2);
  await expect(
    article.getByRole("img", {
      name: "港沿いの作業場で、4人の仕事人が義手、刺青、ドラッグ、戦闘装備を整えている。窓の外に通天閣を思わせる塔が見える。",
    }),
  ).toHaveAttribute(
    "src",
    "/neon-underrealm-trpg/images/character-making/hero.webp",
  );
  await expect(
    page.getByRole("heading", { name: "初期縁の決定（RoC方式）" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "コンストラクション" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "フルスクラッチ" }),
  ).toHaveCount(1);
  await expect(page.locator("[data-callout-type='tip']")).toHaveCount(1);
  await expect(page.locator("[data-callout-type='warning']")).toHaveCount(1);
  await expect(page.locator("[data-callout-type='example']")).toHaveCount(4);
  await expect(page.locator("[data-initial-tie]")).toHaveCount(10);
  await expect(
    page.locator(
      "[data-callout-type] h2.callout-title, [data-callout-type] h3.callout-title",
    ),
  ).toHaveCount(0);
  await expect(
    article.getByRole("link", { name: "流儀", exact: true }),
  ).toHaveAttribute("href", "/neon-underrealm-trpg/data/ryugi");
  await expect(
    article.getByRole("link", { name: "生き様", exact: true }),
  ).toHaveAttribute("href", "/neon-underrealm-trpg/data/ikizama");
  await expect(
    article.getByRole("link", { name: "共通スキル", exact: true }),
  ).toHaveAttribute("href", "/neon-underrealm-trpg/data/common-skills");
  await expect(
    article.getByRole("link", { name: "アイテム", exact: true }),
  ).toHaveAttribute("href", "/neon-underrealm-trpg/data/items");
  await expect(
    article.getByRole("link", { name: "ルール", exact: true }),
  ).toHaveAttribute("href", "/neon-underrealm-trpg/rules");
  await expect(article).toContainText("筋力・敏捷・感覚");
  await expect(article).toContainText("肉体・精神");
  await expect(article).not.toContainText("受け | 感覚");
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

test("character making desktop @character-making-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.characterMaking);
  await expectCharacterMakingContent(page);
  await expectGeneratedPageToc(page, "コンストラクション");
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/character-making-desktop.png`,
  });
});

test("character making mobile @character-making-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.characterMaking);
  await expectCharacterMakingContent(page);
  await expectGeneratedPageToc(page, "コンストラクション");
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/character-making-mobile.png`,
  });
});

test("character making tablet @character-making-tablet", async ({ page }) => {
  await page.setViewportSize(visualViewports.tablet);
  await page.goto(visualRoutes.characterMaking);
  await expectCharacterMakingContent(page);
  await expectGeneratedPageToc(page, "コンストラクション");
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/character-making-tablet.png`,
  });
});

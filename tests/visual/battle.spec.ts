import { expect, type Page, test } from "@playwright/test";
import { createHeadingId } from "../../src/lib/utils/heading-id";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";
import { expectGeneratedPageToc } from "./helpers/page-toc";

const skillTimingHeadingId = createHeadingId(3, "タイミング");

async function hideAstroDevToolbar(page: Page) {
  await page.locator("astro-dev-toolbar").evaluateAll((elements) => {
    for (const element of elements) {
      element.remove();
    }
  });
}

async function expectBattleContent(page: Page) {
  const article = page.locator("article.mdx-layout");

  await expect(page).toHaveTitle(
    "戦闘ルール | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "戦闘ルール", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "戦闘の基本" }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "攻撃基準値と気合" }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "クロスコンボ" }),
  ).toHaveCount(1);
  await expect(article.getByRole("heading", { name: "掛け合い" })).toHaveCount(
    1,
  );
  await expect(
    article.getByRole("heading", { name: "気絶と死亡" }),
  ).toHaveCount(1);
  await expect(article.getByRole("heading", { name: "覚悟" })).toHaveCount(1);
  await expect(article.locator("[data-callout-type='example']")).toHaveCount(3);
  await expect(
    article.locator("[data-callout-type='example']", {
      hasText: "3回攻撃でつなぐコンボ",
    }),
  ).toHaveCount(1);
  await expect(
    article.locator("[data-callout-type='example']", {
      hasText: "防御に成功された攻撃",
    }),
  ).toHaveCount(1);
  await expect(article).toContainText("独立した特別なリアクション");
  const hero = article.locator("img[src$='images/battle/hero.webp']");
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute(
    "alt",
    "長柄刀を振るう傷だらけの女性と、巨大なサイバネ義手で受け止める影の男が、火花を散らして対峙するイラスト。",
  );
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(
    hero.locator("xpath=ancestor::figure").locator("figcaption"),
  ).toHaveCount(0);
  await expect(
    article.getByRole("link", { name: "データ", exact: true }),
  ).toHaveAttribute("href", "/neon-underrealm-trpg/data");
  await expect(
    article.getByRole("link", { name: "スキルのタイミング" }),
  ).toHaveAttribute(
    "href",
    `/neon-underrealm-trpg/data#${skillTimingHeadingId}`,
  );
  await expect(article.locator("#cross-combo")).toHaveCount(1);
  await expect(article).toContainText("コンボ中のどの攻撃でも使えます");
  await expect(article).toContainText("×-A、☆-A");
  await expect(article).toContainText("A-×、A-☆");
  await expect(
    article.getByRole("link", { name: "キャラクターメイキングの戦闘技能表" }),
  ).toHaveAttribute("href", "/neon-underrealm-trpg/character-making#戦闘技能");
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

test("battle desktop @battle-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.battle);
  await expectBattleContent(page);
  await expectGeneratedPageToc(page, "掛け合い");
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/battle-desktop.png`,
  });
});

test("battle mobile @battle-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.battle);
  await expectBattleContent(page);
  await expectGeneratedPageToc(page, "掛け合い");
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toContainText(
    "掛け合い",
  );
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/battle-mobile.png`,
  });
});

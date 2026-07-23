import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";
import { expectGeneratedPageToc } from "./helpers/page-toc";

async function expectDrugsPage(page: Page) {
  const article = page.locator("article.mdx-layout");
  const hero = article.locator("img[src$='images/data/items/drugs_hero.webp']");
  const legend = article.locator("[data-legend-container]");
  const warning = article.locator('[data-callout-type="warning"]');
  const drugs = article.locator(
    '[data-card-container][aria-label="ドラッグ一覧"]',
  );

  await expect(page).toHaveTitle(
    "ドラッグ | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "ドラッグ", exact: true }),
  ).toHaveCount(1);
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute("alt", "");
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(
    article.getByRole("link", { name: "バッドステータス", exact: true }),
  ).toHaveAttribute("href", "/neon-underrealm-trpg/rules/battle#h-62b2ec2b");
  await expect(warning).toContainText("戦闘外では使用することができません");
  await expect(
    article.getByRole("heading", { name: "データの見方", exact: true }),
  ).toHaveCount(1);
  await expect(legend.locator("[data-drug-card]")).toHaveCount(1);
  await expect(
    legend.getByRole("link", {
      name: "スキルの見方の「タイミング」",
      exact: true,
    }),
  ).toHaveAttribute("href", "/neon-underrealm-trpg/data#h-e1218826");
  await expect(legend).toContainText("③SU");
  await expect(legend).toContainText(
    "効果：ドラッグを使用した際、得られる効果です。",
  );
  await expect(drugs.locator("[data-drug-card]")).toHaveCount(18);
  await expect(drugs.locator("[data-drug-card]").first()).toHaveAttribute(
    "id",
    /item-drug-/,
  );
  await expectGeneratedPageToc(page, "ドラッグ一覧");
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

async function expectLegendColumns(page: Page, count: number) {
  const columns = await page
    .locator("[data-legend-container]")
    .evaluate((legend) => window.getComputedStyle(legend).gridTemplateColumns);
  expect(columns.trim().split(/\s+/)).toHaveLength(count);
}

test("ドラッグ一覧 desktop @items-drugs-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.dataItemsDrugs);
  await expectDrugsPage(page);
  await expectLegendColumns(page, 3);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/items-drugs-desktop.png`,
  });
});

test("ドラッグ一覧 mobile @items-drugs-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.dataItemsDrugs);
  await expectDrugsPage(page);
  await expectLegendColumns(page, 2);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toContainText(
    "ドラッグ一覧",
  );
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/items-drugs-mobile.png`,
  });
});

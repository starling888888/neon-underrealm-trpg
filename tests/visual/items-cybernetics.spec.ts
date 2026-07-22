import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";
import { expectGeneratedPageToc } from "./helpers/page-toc";

const cyberneticCategories = [
  ["頭部に埋め込むサイバネ", 5],
  ["胴体に埋め込む最バネ", 7],
  ["腕に埋め込むサイバネ", 8],
  ["足に埋め込むサイバネ", 6],
  ["どの部位にも埋め込めるサイバネ", 5],
] as const;

async function expectCyberneticsPage(page: Page) {
  const article = page.locator("article.mdx-layout");
  const hero = article.locator(
    "img[src$='images/data/items/cybernetics_hero.webp']",
  );
  const legend = article.locator("[data-legend-container]");
  const warning = article.locator('[data-callout-type="warning"]');
  const weapons = article.locator(
    '[data-card-container][aria-label="サイバネ武器"]',
  );

  await expect(page).toHaveTitle(
    "サイバネ | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "サイバネ", exact: true }),
  ).toHaveCount(1);
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute("alt", "");
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(warning).toContainText("11点以上：判定数が6減少します。");
  await expect(
    article.getByRole("link", { name: "休息シーン", exact: true }),
  ).toHaveAttribute(
    "href",
    "/neon-underrealm-trpg/rules/scenario-play#休息シーン",
  );
  await expect(legend.locator("[data-cybernetic-card]")).toHaveCount(1);
  await expect(legend).toContainText("④2");
  await expect(legend).toContainText(
    "効果：そのサイバネの持つ特殊庵効果です。",
  );

  for (const [label, count] of cyberneticCategories) {
    const container = article.locator(
      `[data-card-container][aria-label="${label}"]`,
    );
    await expect(container.locator("[data-cybernetic-card]")).toHaveCount(
      count,
    );
    await expect(
      container.locator("[data-cybernetic-card]").first(),
    ).toHaveAttribute("id", /item-cybernetics-/);
  }

  await expect(weapons.locator("[data-weapon-card]")).toHaveCount(10);
  await expect(weapons.locator("[data-weapon-card]").first()).toHaveAttribute(
    "id",
    /item-weapon-cybernetics-/,
  );
  await expectGeneratedPageToc(page, "サイバネ武器");
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

test("サイバネ一覧 desktop @items-cybernetics-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.dataItemsCybernetics);
  await expectCyberneticsPage(page);
  await expectLegendColumns(page, 3);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/items-cybernetics-desktop.png`,
  });
});

test("サイバネ一覧 mobile @items-cybernetics-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.dataItemsCybernetics);
  await expectCyberneticsPage(page);
  await expectLegendColumns(page, 2);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toContainText(
    "サイバネ武器",
  );
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/items-cybernetics-mobile.png`,
  });
});

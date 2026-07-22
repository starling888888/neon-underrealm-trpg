import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";
import { expectGeneratedPageToc } from "./helpers/page-toc";

async function expectNanomachinesPage(page: Page) {
  const article = page.locator("article.mdx-layout");
  const hero = article.locator(
    "img[src$='images/data/items/nanomachines_hero.webp']",
  );
  const legend = article.locator("[data-legend-container]");
  const warning = article.locator('[data-callout-type="warning"]');
  const nanomachines = article.locator(
    '[data-card-container][aria-label="ナノマシン一覧"]',
  );
  const weapons = article.locator(
    '[data-card-container][aria-label="武器化ナノマシン"]',
  );

  await expect(page).toHaveTitle(
    "ナノマシン | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "ナノマシン", exact: true }),
  ).toHaveCount(1);
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute("alt", "");
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(warning).toContainText("威圧感を与えてしまいます");
  await expect(legend.locator("[data-nanomachine-card]")).toHaveCount(1);
  await expect(legend).toContainText("③15");
  await expect(legend).toContainText(
    "効果：そのナノマシンを発動させているときに得られる効果です。",
  );
  await expect(nanomachines.locator("[data-nanomachine-card]")).toHaveCount(19);
  await expect(
    nanomachines.locator("[data-nanomachine-card]").first(),
  ).toHaveAttribute("id", /item-nanomachine-/);
  await expect(weapons.locator("[data-weapon-card]")).toHaveCount(10);
  await expect(weapons.locator("[data-weapon-card]").first()).toHaveAttribute(
    "id",
    /item-weapon-nanomachines-/,
  );
  await expectGeneratedPageToc(page, "武器化ナノマシン");
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

test("ナノマシン一覧 desktop @items-nanomachines-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.dataItemsNanomachines);
  await expectNanomachinesPage(page);
  await expectLegendColumns(page, 3);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/items-nanomachines-desktop.png`,
  });
});

test("ナノマシン一覧 mobile @items-nanomachines-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.dataItemsNanomachines);
  await expectNanomachinesPage(page);
  await expectLegendColumns(page, 2);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toContainText(
    "武器化ナノマシン",
  );
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/items-nanomachines-mobile.png`,
  });
});

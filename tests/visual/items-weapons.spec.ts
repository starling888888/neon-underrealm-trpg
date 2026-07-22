import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";
import { expectGeneratedPageToc } from "./helpers/page-toc";

const weaponCategories = [
  ["喧嘩武器", 4],
  ["暗殺武器", 7],
  ["発砲武器", 5],
  ["格闘武器", 4],
  ["干渉武器", 10],
] as const;

async function expectWeaponsPage(page: Page) {
  const article = page.locator("article.mdx-layout");
  const hero = article.locator(
    "img[src$='images/data/items/weapons_hero.webp']",
  );
  const legend = article.locator(".weapon-legend");

  await expect(page).toHaveTitle(
    "武器 | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "武器", exact: true }),
  ).toHaveCount(1);
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute("alt", "");
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(legend.locator("[data-weapon-card]")).toHaveCount(1);
  await expect(legend).toContainText("③射撃武器");

  for (const [label, count] of weaponCategories) {
    const container = article.locator(
      `[data-card-container][aria-label="${label}"]`,
    );
    await expect(container).toHaveCount(1);
    await expect(container.locator("[data-weapon-card]")).toHaveCount(count);
    await expect(
      container.locator("[data-weapon-card]").first(),
    ).toHaveAttribute("id", /item-weapon-/);
  }

  await expectGeneratedPageToc(page, "武器一覧");
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

test("武器一覧 desktop @items-weapons-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.dataItemsWeapons);
  await expectWeaponsPage(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/items-weapons-desktop.png`,
  });
});

test("武器一覧 mobile @items-weapons-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.dataItemsWeapons);
  await expectWeaponsPage(page);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toContainText(
    "武器一覧",
  );
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/items-weapons-mobile.png`,
  });
});

import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";
import { expectGeneratedPageToc } from "./helpers/page-toc";

const divineProtectionSkillId = "skill-ikizama-burai-basic-pv-570c394fe082";

async function expectOmamoriPage(page: Page) {
  const article = page.locator("article.mdx-layout");
  const hero = article.locator(
    "img[src$='images/data/items/omamori_hero.webp']",
  );
  const warning = article.locator('[data-callout-type="warning"]');
  const omamoriList = article.locator(
    '[data-card-container][aria-label="お守り一覧"]',
  );

  await expect(page).toHaveTitle(
    "お守り | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "お守り", exact: true }),
  ).toHaveCount(1);
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveAttribute("alt", "");
  await expect(hero).toHaveAttribute("loading", "eager");
  await expect(warning).toContainText(
    "ブライを生き様に選んだだけでは取得できない",
  );
  await expect(
    warning.getByRole("link", { name: "神仏の加護", exact: true }),
  ).toHaveAttribute(
    "href",
    `/neon-underrealm-trpg/data/ikizama/burai#${divineProtectionSkillId}`,
  );
  await expect(article.locator("[data-omamori-card]").first()).toContainText(
    "①活気のお守り",
  );
  await expect(omamoriList.locator("[data-omamori-card]")).toHaveCount(21);
  await expect(
    omamoriList.locator("[data-omamori-card]").first(),
  ).toHaveAttribute("id", /item-omamori-/);
  await expectGeneratedPageToc(page, "お守り一覧");
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

test("お守り一覧 desktop @items-omamori-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.dataItemsOmamori);
  await expectOmamoriPage(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/items-omamori-desktop.png`,
  });
});

test("お守り一覧 mobile @items-omamori-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.dataItemsOmamori);
  await expectOmamoriPage(page);
  const legendColumns = await page
    .locator(".omamori-legend")
    .evaluate((legend) => window.getComputedStyle(legend).gridTemplateColumns);
  expect(legendColumns.trim().split(/\s+/)).toHaveLength(2);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toContainText(
    "お守り一覧",
  );
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/items-omamori-mobile.png`,
  });
});

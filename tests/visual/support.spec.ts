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

async function expectSupportContent(page: Page) {
  const article = page.locator("article.mdx-layout");

  await expect(page).toHaveTitle(
    "サポート | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "サポート", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", {
      name: "オンラインツールでの運用（CCFOLIA）",
    }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "お問い合わせ" }),
  ).toHaveCount(1);
  await expect(article.locator("[data-callout-type='example']")).toHaveCount(2);
  await expect(
    article.locator(
      "[data-callout-type] h2.callout-title, [data-callout-type] h3.callout-title",
    ),
  ).toHaveCount(0);
  await expect(article.getByRole("link", { name: "こちら" })).toHaveAttribute(
    "href",
    "/neon-underrealm-trpg/images/battle-map.png",
  );
  await expect(article.getByRole("link", { name: "こちら" })).toHaveAttribute(
    "target",
    "_blank",
  );
  await expect(page.locator(".page-navigation")).toHaveCount(0);
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

test("support desktop @support-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.support);
  await expectSupportContent(page);
  await expectGeneratedPageToc(page, "ダイスロールコマンド");
  await expect(
    page
      .locator(".site-menu-desktop")
      .getByRole("link", { name: "サポート", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/support-desktop.png`,
  });
});

test("support mobile @support-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.support);
  await expectSupportContent(page);
  await expectGeneratedPageToc(page, "ダイスロールコマンド");
  await page.locator("[data-mobile-menu-open]").click();
  const mobileSiteMenu = page.locator("#mobile-site-menu-drawer");
  await expect(mobileSiteMenu).toBeVisible();
  await expect(
    mobileSiteMenu.getByRole("link", { name: "サポート", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await page.locator("[data-mobile-menu-close]").first().click();
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toContainText(
    "ダイスロールコマンド",
  );
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/support-mobile.png`,
  });
});

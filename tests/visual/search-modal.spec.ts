import { expect, test } from "@playwright/test";
import { createHash } from "../../src/lib/utils/hash";
import {
  visualBaseUrl,
  visualOutputDir,
  visualRoutes,
  visualViewports,
} from "./config";

const basicAttackId = `skill-common-bonus-a-${createHash("基本の一撃")}`;

test("search panel desktop @search-modal-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.commonSkills);

  await expect(
    page.locator(
      `#${basicAttackId} > .skill-card-header > span.skill-card-name`,
    ),
  ).toHaveText("基本の一撃");

  const searchInput = page.locator("[data-search-desktop-input]");
  const panel = page.locator("[data-search-panel]");

  await searchInput.focus();
  await expect(panel).toBeVisible();
  await expect(page.locator("[data-search-scrim]")).toBeVisible();
  await expect(searchInput).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("body")).toHaveClass(/search-open/);
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/search-modal-desktop.png`,
  });

  await page.locator("[data-search-scrim]").click({ position: { x: 8, y: 8 } });
  await expect(panel).toBeHidden();
  await expect(searchInput).not.toBeFocused();
  await expect(page.locator("body")).not.toHaveClass(/search-open/);

  await searchInput.fill("基本の一撃");
  await expect(panel).toBeVisible();
  await expect(
    page.locator(`.search-result-link[href$="#${basicAttackId}"]`),
  ).toBeVisible();
  await expect
    .poll(async () => {
      const box = await panel.boundingBox();
      return box ? box.y + box.height : Number.POSITIVE_INFINITY;
    })
    .toBeLessThanOrEqual(visualViewports.desktop.height / 2);
  await expect
    .poll(async () =>
      panel.evaluate((element) => {
        return element.scrollHeight > element.clientHeight;
      }),
    )
    .toBe(true);
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/search-modal-results-desktop.png`,
  });

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(searchInput).not.toBeFocused();
});

test("search panel mobile @search-modal-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.commonSkills);

  const toggle = page.locator("[data-search-mobile-toggle]");
  const panel = page.locator("[data-search-panel]");

  await toggle.click();
  await expect(panel).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-label", "検索を閉じる");
  await expect(page.locator("body")).toHaveClass(/search-open/);
  await expect(page.locator("[data-search-mobile-input]")).toBeFocused();
  await expect(page.locator("[data-search-mobile-form]")).toBeVisible();
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/search-modal-mobile.png`,
  });

  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(toggle).toHaveAttribute("aria-label", "検索を開く");
  await expect(toggle).toBeFocused();
});

test("search panel closes when another mobile overlay opens @search-modal-overlay", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.commonSkills);

  const searchToggle = page.locator("[data-search-mobile-toggle]");
  const searchPanel = page.locator("[data-search-panel]");
  const menuToggle = page.locator("[data-mobile-menu-open]");

  await searchToggle.click();
  await expect(searchPanel).toBeVisible();
  await menuToggle.click();
  await expect(searchPanel).toBeHidden();
  await expect(page.locator("#mobile-site-menu-drawer")).toBeVisible();

  await page.locator("[data-mobile-menu-close]").first().click();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeVisible();

  await searchToggle.click();
  await expect(searchPanel).toBeVisible();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
});

test("search panel displays a Pagefind data-card anchor result @search-modal-results", async ({
  page,
}) => {
  const index = await page.request.get(`${visualBaseUrl}pagefind/pagefind.js`);

  test.skip(
    !index.ok(),
    "Pagefind index has not been generated for this server.",
  );

  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.commonSkills);

  const searchInput = page.locator("[data-search-desktop-input]");
  await searchInput.fill("基本の一撃");

  const result = page.locator(`.search-result-link[href$="#${basicAttackId}"]`);
  await expect(page.locator("[data-search-results-list]")).toBeVisible();
  await expect(result).toHaveAttribute(
    "href",
    new RegExp(`#${basicAttackId}$`),
  );
  await expect(result.locator(".search-result-type")).toHaveText("データ");
  await expect(result.locator(".search-result-title")).toHaveText("共通スキル");
  await expect(result.locator(".search-result-section")).toHaveText(
    "基本の一撃",
  );
  await expect(result.locator(".search-result-excerpt")).not.toBeEmpty();
  await expect(
    result.locator(".search-result-excerpt mark").first(),
  ).toContainText("基本");
  await expect(result.locator(".search-result-excerpt mark").first()).toHaveCSS(
    "background-color",
    "rgb(255, 227, 110)",
  );

  await result.click();
  await expect(page).toHaveURL(
    new RegExp(`data/common-skills/\\?highlight=.*#${basicAttackId}$`),
  );
  await expect(
    page
      .locator("[data-pagefind-body] mark.pagefind-highlight")
      .filter({ hasText: /^基本$/ })
      .first(),
  ).toContainText("基本");
  await expect(
    page
      .locator("[data-pagefind-body] mark.pagefind-highlight")
      .filter({ hasText: /^基本$/ })
      .first(),
  ).toHaveCSS("background-color", "rgb(255, 227, 110)");

  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.commonSkills);
  await page.locator("[data-search-mobile-toggle]").click();
  await page.locator("[data-search-mobile-input]").fill("基本の一撃");
  await page.locator(".mobile-search-submit").click();
  await expect(
    page.locator(`.search-result-link[href$="#${basicAttackId}"]`),
  ).toBeVisible();
  await page.screenshot({
    fullPage: false,
    path: `${visualOutputDir}/search-modal-results-mobile.png`,
  });
});

test("search panel guides one-character kana and ASCII searches @search-modal-query-validation", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.commonSkills);

  const searchInput = page.locator("[data-search-desktop-input]");
  const status = page.locator("[data-search-results-status]");

  await searchInput.fill("あ");
  await expect(status).toHaveText(
    "ひらがな、カタカナ、英字は2文字以上で入力してください。",
  );

  await searchInput.fill("A");
  await expect(status).toHaveText(
    "ひらがな、カタカナ、英字は2文字以上で入力してください。",
  );

  await searchInput.fill("毒");
  await expect(page.locator("[data-search-results-list]")).toBeVisible();
});

test("search panel retries Pagefind after an initial load failure @search-modal-retry", async ({
  page,
}) => {
  const index = await page.request.get(`${visualBaseUrl}pagefind/pagefind.js`);

  test.skip(
    !index.ok(),
    "Pagefind index has not been generated for this server.",
  );

  let pagefindRequestCount = 0;
  await page.route(/pagefind\/pagefind\.js(?:\?.*)?$/u, async (route) => {
    pagefindRequestCount += 1;

    if (pagefindRequestCount === 1) {
      await route.fulfill({ status: 503, body: "temporarily unavailable" });
      return;
    }

    await route.continue();
  });

  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.commonSkills);

  const searchInput = page.locator("[data-search-desktop-input]");
  const status = page.locator("[data-search-results-status]");

  await searchInput.fill("基本の一撃");
  await expect(status).toHaveText(
    "検索indexを読み込めませんでした。時間をおいて再度お試しください。",
  );

  await searchInput.fill("基本の一撃 ");
  await expect(
    page.locator(`.search-result-link[href$="#${basicAttackId}"]`),
  ).toBeVisible();
  await expect.poll(() => pagefindRequestCount).toBeGreaterThanOrEqual(2);
});

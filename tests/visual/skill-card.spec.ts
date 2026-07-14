import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";

async function hideAstroDevToolbar(page: Page) {
  await page.locator("astro-dev-toolbar").evaluateAll((elements) => {
    for (const element of elements) {
      element.remove();
    }
  });
}

async function expectSkillCardCatalog(page: Page) {
  const cards = page.locator("[data-skill-card]");

  await expect(page).toHaveTitle(
    "スキルカード カタログ | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    page.getByRole("heading", { name: "共通スキル", exact: true }),
  ).toHaveCount(1);
  await expect(cards).toHaveCount(6);
  await expect(cards.first()).toHaveAttribute("id", "skill-common-bonus-a-1");
  await expect(cards.first()).not.toContainText("skill-common-bonus-a-1");
  await expect(cards.first()).toContainText("最大LV: 1");
  await expect(cards.first()).toContainText("取得制限");
  await expect(cards.first()).toContainText("使用制限");

  const selfTargetSkill = cards.filter({ hasText: "路地の勘" });
  await expect(selfTargetSkill).toHaveCount(1);
  await expect(selfTargetSkill.locator(".skill-card-meta span")).toHaveText([
    "Pv",
    "-",
    "危険察知",
    "最大LV: 2",
  ]);
  await expect(
    selfTargetSkill.locator(".skill-card-detail").nth(2),
  ).toContainText("自身");
  await expect(
    selfTargetSkill.locator(".skill-card-detail").nth(3),
  ).toContainText("-");

  const weights = await cards.first().evaluate((card) => {
    const acquisition = card.querySelector(".skill-card-detail-acquisition dd");
    const usage = card.querySelector(
      ".skill-card-detail:not(.skill-card-detail-acquisition) dd",
    );

    if (!acquisition || !usage) {
      throw new Error("スキル制限の表示要素が見つかりません。");
    }

    return {
      acquisition: Number.parseInt(
        window.getComputedStyle(acquisition).fontWeight,
        10,
      ),
      usage: Number.parseInt(window.getComputedStyle(usage).fontWeight, 10),
    };
  });
  expect(weights.acquisition).toBeGreaterThan(weights.usage);

  const gridHeights = await page
    .locator("[data-card-container]")
    .evaluateAll((grids) =>
      grids.map((grid) =>
        Array.from(grid.querySelectorAll("[data-skill-card]"), (card) =>
          Math.round(card.getBoundingClientRect().height),
        ),
      ),
    );
  for (const heights of gridHeights) {
    expect(new Set(heights).size).toBe(1);
  }

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

test("スキルカード カタログ desktop @skill-card-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.skillCards);
  await expectSkillCardCatalog(page);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/skill-card-desktop.png`,
  });
});

test("スキルカード カタログ mobile @skill-card-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.skillCards);
  await expectSkillCardCatalog(page);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/skill-card-mobile.png`,
  });
});

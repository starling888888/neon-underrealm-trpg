import { expect, type Page, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";
import { expectGeneratedPageToc } from "./helpers/page-toc";

async function expectCommonSkillsPage(page: Page) {
  const article = page.locator("article.mdx-layout");
  const lists = article.locator("[data-skill-list]");
  const cards = article.locator("[data-skill-card]");

  await expect(page).toHaveTitle(
    "共通スキル | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    article.getByRole("heading", { name: "共通スキル", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "自動習得スキル", exact: true }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", {
      name: "初期作成時から取得可能なスキル",
      exact: true,
    }),
  ).toHaveCount(1);
  await expect(
    article.getByRole("heading", { name: "上級スキル", exact: true }),
  ).toHaveCount(0);
  await expect(lists).toHaveCount(2);
  await expect(cards).toHaveCount(32);
  await expect(cards.first()).toHaveAttribute("id", "skill-common-bonus-a-001");
  await expect(cards.nth(1)).toHaveAttribute("id", "skill-common-basic-pv-001");
  await expect(cards.last()).toHaveAttribute("id", "skill-common-basic-d-006");
  await expect(cards.first()).not.toContainText("skill-common-bonus-a-001");
  await expectGeneratedPageToc(page, "初期作成時から取得可能なスキル");
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

test("共通スキル desktop @common-skills-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.commonSkills);
  await expectCommonSkillsPage(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/common-skills-desktop.png`,
  });
});

test("共通スキル mobile @common-skills-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.commonSkills);
  await expectCommonSkillsPage(page);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toContainText(
    "初期作成時から取得可能なスキル",
  );
  await page.locator("[data-mobile-page-toc-trigger]").click();
  await expect(page.locator("[data-mobile-page-toc-panel]")).toBeHidden();
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/common-skills-mobile.png`,
  });
});

test("共通スキルの個別アンカー @common-skills-anchor", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(`${visualRoutes.commonSkills}#skill-common-basic-pv-001`);

  await expect(page).toHaveURL(/#skill-common-basic-pv-001$/);
  await expect(page.locator("#skill-common-basic-pv-001")).toBeInViewport();
});

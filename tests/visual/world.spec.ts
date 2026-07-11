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

async function expectWorldGuide(page: Page) {
  await expect(page).toHaveTitle(
    "ワールドガイド | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(
    page.getByRole("heading", { name: "ワールドガイド" }),
  ).toHaveCount(1);
  await expect(
    page.getByRole("img", {
      name: "雨の夜のオオサカ副都の路地。遠景に通天閣を思わせる塔が見える。",
    }),
  ).toHaveAttribute("loading", "eager");
  await expect(page.getByRole("heading", { name: "強大な敵" })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "外道" })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "機龍" })).toHaveCount(1);
  await expect(page.getByRole("heading", { name: "ホムンクルス" })).toHaveCount(
    1,
  );
  await expect(page.getByRole("heading", { name: "悪魔" })).toHaveCount(1);
  await expectGeneratedPageToc(page, "強大な敵");
  await expect(page.locator("[data-npc-card]")).toHaveCount(9);
  await expect(page.locator(".npc-card-epithet")).toHaveCount(7);
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

test("world desktop @world-desktop", async ({ page }) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.world);
  await expectWorldGuide(page);
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/world-desktop.png`,
  });
});

test("world mobile @world-mobile", async ({ page }) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.world);
  await expectWorldGuide(page);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toBeVisible();
  await hideAstroDevToolbar(page);
  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/world-mobile.png`,
  });
});

import { expect, test } from "@playwright/test";
import { visualOutputDir, visualRoutes, visualViewports } from "./config";

test("release notes desktop viewport @release-notes-desktop", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.releaseNotes);

  await expect(page).toHaveTitle(
    "更新履歴 | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(page.getByRole("heading", { name: "更新履歴" })).toBeVisible();
  await expect(page.locator("[data-page-toc-empty='true']")).toHaveCount(0);
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toHaveCount(0);
  await expect(
    page.getByRole("link", { name: "更新履歴" }).first(),
  ).toHaveAttribute("aria-current", "page");
  await expect
    .poll(async () => {
      return await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
    })
    .toBe(0);

  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/release-notes-desktop.png`,
  });
});

test("release notes mobile viewport @release-notes-mobile", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.mobile);
  await page.goto(visualRoutes.releaseNotes);

  await expect(page).toHaveTitle(
    "更新履歴 | 光都暗域〈ネオン・アンダーレルム〉TRPG",
  );
  await expect(page.getByRole("heading", { name: "更新履歴" })).toBeVisible();
  await expect(page.locator("[data-mobile-page-toc-trigger]")).toHaveCount(0);
  await expect
    .poll(async () => {
      return await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
    })
    .toBe(0);

  await page.screenshot({
    fullPage: true,
    path: `${visualOutputDir}/release-notes-mobile.png`,
  });
});

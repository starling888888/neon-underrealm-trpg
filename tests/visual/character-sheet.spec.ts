import { expect, test } from "@playwright/test";
import { visualBaseUrl, visualViewports } from "./config";

test.describe("character sheet page", () => {
  test("keeps the desktop and tablet site menu while omitting page ToC", async ({
    page,
  }) => {
    for (const viewport of [visualViewports.desktop, visualViewports.tablet]) {
      await page.setViewportSize(viewport);
      await page.goto("character-sheet/");

      await expect(page.locator(".site-menu-desktop")).toBeVisible();
      await expect(
        page.getByRole("link", { name: "キャラクターシート", exact: true }),
      ).toHaveAttribute("aria-current", "page");
      await expect(page.locator(".page-toc")).toHaveCount(0);
      await expect(page.locator("[data-mobile-page-toc-trigger]")).toHaveCount(
        0,
      );
    }
  });

  test("omits the mobile site menu and keeps subpath links", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.mobile);
    await page.goto("character-sheet/");

    await expect(page.locator("[data-mobile-menu-open]")).toHaveCount(0);
    await expect(page.locator("#mobile-site-menu-drawer")).toHaveCount(0);
    await expect(page.locator(".page-toc")).toHaveCount(0);
    await expect(page.locator("[data-mobile-page-toc-trigger]")).toHaveCount(0);
    await expect(page.locator(".character-sheet-logo-link")).toHaveAttribute(
      "href",
      `${new URL(visualBaseUrl).pathname}`,
    );
  });
});

import { expect, test } from "@playwright/test";
import { visualRoutes, visualViewports } from "./config";

test("site menu disclosure controls keep a 32px target @site-menu-layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto(visualRoutes.world);

  const toggle = page.locator(".site-menu-desktop .site-menu-toggle").first();
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveCSS("width", "32px");
  await expect(toggle).toHaveCSS("height", "32px");
});

test("site menu uses its full row width for the longest non-disclosure link @site-menu-layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto(visualRoutes.world);

  const characterMaking = page
    .locator(".site-menu-desktop .site-menu-link")
    .filter({ hasText: "キャラクターメイキング" });

  await expect(characterMaking).toHaveCount(1);
  await expect
    .poll(async () => {
      return await characterMaking.evaluate((link) => {
        const row = link.parentElement;

        if (!row) {
          return false;
        }

        return (
          link.getBoundingClientRect().height <= 32 &&
          getComputedStyle(row).gridTemplateColumns.split(" ").length === 1
        );
      });
    })
    .toBe(true);
});

test("site menu marks the current page in desktop and mobile navigation @site-menu-current-page", async ({
  page,
}) => {
  await page.setViewportSize(visualViewports.desktop);
  await page.goto(visualRoutes.support);
  await expect(
    page
      .locator(".site-menu-desktop")
      .getByRole("link", { name: "サポート", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  await page.setViewportSize(visualViewports.mobile);
  await page.locator("[data-mobile-menu-open]").click();
  const drawer = page.locator("#mobile-site-menu-drawer");
  await expect(drawer).toBeVisible();
  await expect(
    drawer.getByRole("link", { name: "サポート", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

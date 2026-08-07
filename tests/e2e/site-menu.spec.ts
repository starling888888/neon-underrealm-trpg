import { expect, test } from "@playwright/test";
import { siteRoutes, siteViewports } from "../support/site";

test("site menu disclosure controls keep a 32px target @site-menu-layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto(siteRoutes.world);

  const toggle = page.locator(".site-menu-desktop .site-menu-toggle").first();
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveCSS("width", "32px");
  await expect(toggle).toHaveCSS("height", "32px");
});

test("site menu uses its full row width for the longest non-disclosure link @site-menu-layout", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await page.goto(siteRoutes.world);

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
  await page.setViewportSize(siteViewports.desktop);
  await page.goto(siteRoutes.support);
  await expect(
    page
      .locator(".site-menu-desktop")
      .getByRole("link", { name: "サポート", exact: true }),
  ).toHaveAttribute("aria-current", "page");

  await page.setViewportSize(siteViewports.mobile);
  await page.locator("[data-mobile-menu-open]").click();
  const drawer = page.locator("#mobile-site-menu-drawer");
  await expect(drawer).toBeVisible();
  await expect(
    drawer.getByRole("link", { name: "サポート", exact: true }),
  ).toHaveAttribute("aria-current", "page");
});

test("site menu presents PL and GM section labels without fake links @site-menu-sections", async ({
  page,
}) => {
  await page.setViewportSize(siteViewports.desktop);
  await page.goto(siteRoutes.gm);

  const desktopMenu = page.locator(".site-menu-desktop");
  await expect(
    desktopMenu.getByText("PLセクション", { exact: true }),
  ).toBeVisible();
  await expect(
    desktopMenu.getByText("GMセクション", { exact: true }),
  ).toBeVisible();
  await expect(
    desktopMenu.getByRole("link", { name: "PLセクション", exact: true }),
  ).toHaveCount(0);
  await expect(
    desktopMenu.getByRole("link", { name: "GMセクション", exact: true }),
  ).toHaveCount(0);
  await expect(
    desktopMenu.getByRole("link", { name: "GMガイド", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(desktopMenu.locator(".site-menu-separator")).toHaveCount(1);

  await page.setViewportSize(siteViewports.mobile);
  await page.locator("[data-mobile-menu-open]").click();
  const drawer = page.locator("#mobile-site-menu-drawer");
  await expect(drawer.getByText("PLセクション", { exact: true })).toBeVisible();
  await expect(drawer.getByText("GMセクション", { exact: true })).toBeVisible();
  await expect(
    drawer.getByRole("link", { name: "GMガイド", exact: true }),
  ).toHaveAttribute("aria-current", "page");
  await expect(drawer.locator(".site-menu-separator")).toHaveCount(1);
});

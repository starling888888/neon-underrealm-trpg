import { expect, type Page, test } from "@playwright/test";
import { visualBaseUrl, visualViewports } from "./config";

const layoutSelector = "[data-character-sheet-layout]";

async function expectLayoutColumnCount(page: Page, count: number) {
  const gridTemplateColumns = await page
    .locator(layoutSelector)
    .evaluate((element) =>
      getComputedStyle(element).gridTemplateColumns.trim().split(/\s+/),
    );

  expect(gridTemplateColumns).toHaveLength(count);
}

test.describe("character sheet page", () => {
  test("uses a header menu on desktop and a persistent menu on tablet", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    await expect(page.locator(".character-sheet-menu-rail")).toBeHidden();
    await expect(
      page.locator("[data-character-sheet-menu-open]:visible"),
    ).toHaveCount(1);
    await page.locator("[data-search-desktop-input]").focus();
    await expect(page.locator("[data-search-panel]")).toBeVisible();
    await page.locator("[data-character-sheet-menu-open]:visible").click();
    await expect(
      page.locator("#character-sheet-site-menu-drawer"),
    ).toBeVisible();
    await expect(page.locator("[data-search-panel]")).toBeHidden();
    await page.locator("[data-character-sheet-menu-close]").first().click();
    await expect(
      page.locator("#character-sheet-site-menu-drawer"),
    ).toBeHidden();
    await expect(page.locator(".page-toc")).toHaveCount(0);
    await expect(page.locator("[data-mobile-page-toc-trigger]")).toHaveCount(0);

    await page.setViewportSize(visualViewports.tablet);

    await expect(page.locator(".character-sheet-menu-rail")).toBeVisible();
    await expect(
      page.locator("[data-character-sheet-menu-open]:visible"),
    ).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "キャラクターシート", exact: true }),
    ).toHaveAttribute("aria-current", "page");
    await expect(page.locator(".page-toc")).toHaveCount(0);
    await expect(page.locator("[data-mobile-page-toc-trigger]")).toHaveCount(0);
  });

  test("uses a header menu on mobile and keeps subpath links", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.mobile);
    await page.goto("character-sheet/");

    await expect(
      page.locator("[data-character-sheet-menu-open]:visible"),
    ).toHaveCount(1);
    await expect(
      page.locator("#character-sheet-site-menu-drawer"),
    ).toBeHidden();
    await page.locator("[data-character-sheet-menu-open]:visible").click();
    await expect(
      page.locator("#character-sheet-site-menu-drawer"),
    ).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(
      page.locator("#character-sheet-site-menu-drawer"),
    ).toBeHidden();
    await expect(page.locator(".character-sheet-menu-rail")).toBeHidden();
    await expect(page.locator(".page-toc")).toHaveCount(0);
    await expect(page.locator("[data-mobile-page-toc-trigger]")).toHaveCount(0);
    await expect(page.locator(".character-sheet-logo-link")).toHaveAttribute(
      "href",
      `${new URL(visualBaseUrl).pathname}`,
    );
  });

  test("marks the page as excluded from the Pagefind index", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");
    await expect(page.locator("body")).toHaveAttribute(
      "data-pagefind-ignore",
      "",
    );
  });

  test("uses two editing columns only from the desktop breakpoint", async ({
    page,
  }) => {
    await page.goto("character-sheet/");

    await expect(
      page.locator('[data-character-sheet-layout-region="primary"]'),
    ).toHaveCount(1);
    await expect(
      page.locator('[data-character-sheet-layout-region="secondary"]'),
    ).toHaveCount(1);
    await expect(
      page.locator("[data-character-sheet-section-slot]"),
    ).toHaveCount(8);

    await page.setViewportSize(visualViewports.desktop);
    await expectLayoutColumnCount(page, 2);

    await page.setViewportSize({ width: 1280, height: 900 });
    await expectLayoutColumnCount(page, 2);

    await page.setViewportSize({ width: 1279, height: 900 });
    await expectLayoutColumnCount(page, 1);

    await page.setViewportSize(visualViewports.tablet);
    await expectLayoutColumnCount(page, 1);

    await page.setViewportSize(visualViewports.mobile);
    await expectLayoutColumnCount(page, 1);
  });
});

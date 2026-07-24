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

  test("caps and centers the sheet at the desktop content width", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.ultrawide);
    await page.goto("character-sheet/");

    const pageBox = await page
      .locator("[data-character-sheet-page]")
      .boundingBox();

    if (pageBox === null) {
      throw new Error("キャラクターシート本文の幅を確認できません。");
    }

    expect(pageBox.width).toBe(1440);
    expect(pageBox.x).toBeCloseTo((1920 - pageBox.width) / 2, 0);
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS(
      "margin-top",
      "0px",
    );
    await expect(page.getByRole("heading", { level: 1 })).toHaveCSS(
      "margin-bottom",
      "12px",
    );
  });

  test("opens editing section frames independently", async ({ page }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const bondsToggle = page.getByRole("button", { name: "縁", exact: true });
    const checksToggle = page.getByRole("button", {
      name: "判定",
      exact: true,
    });
    const bondsContentId = await bondsToggle.getAttribute("aria-controls");

    if (bondsContentId === null) {
      throw new Error("縁の開閉buttonが内容領域を参照していません。");
    }

    const bondsContent = page.locator(`#${bondsContentId}`);

    await expect(
      page.getByRole("heading", { level: 2, name: "縁", exact: true }),
    ).toBeVisible();
    await expect(bondsToggle).toHaveAttribute("aria-expanded", "true");
    await expect(checksToggle).toHaveAttribute("aria-expanded", "true");
    await expect(bondsContent).toBeVisible();

    await bondsToggle.focus();
    await page.keyboard.press("Enter");

    await expect(bondsToggle).toBeFocused();
    await expect(bondsToggle).toHaveAttribute("aria-expanded", "false");
    await expect(bondsContent).toBeHidden();
    await expect(checksToggle).toHaveAttribute("aria-expanded", "true");

    await page.keyboard.press("Space");

    await expect(bondsToggle).toBeFocused();
    await expect(bondsToggle).toHaveAttribute("aria-expanded", "true");
    await expect(bondsContent).toBeVisible();
  });

  test("edits profile fields and toggles the multiline setting", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const pcName = page.getByLabel("PC名", { exact: true });
    const settingToggle = page.getByRole("button", {
      name: "設定",
      exact: true,
    });

    await pcName.focus();
    await page.keyboard.type("ネオン");
    await expect(pcName).toHaveValue("ネオン");
    await expect(settingToggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByLabel("設定", { exact: true })).toBeHidden();

    await settingToggle.focus();
    await page.keyboard.press("Enter");

    const setting = page.getByLabel("設定", { exact: true });
    await expect(settingToggle).toBeFocused();
    await expect(settingToggle).toHaveAttribute("aria-expanded", "true");
    await setting.fill("ネオンの街\n雨の夜");
    await expect(setting).toHaveValue("ネオンの街\n雨の夜");
  });

  test("normalizes editable credit and presents derived values", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const acquiredCredit = page.getByLabel("取得信用", { exact: true });
    const providedCredit = page.getByLabel("融通した", { exact: true });
    const receivedCredit = page.getByLabel("融通された", { exact: true });
    const changeAdjustment = page.getByLabel("小銭修正", { exact: true });

    await expect(acquiredCredit).toHaveValue("10");
    await expect(page.locator("#character-sheet-合計信用")).toHaveValue("10");
    await expect(page.locator("#character-sheet-消費信用")).toHaveValue("0");
    await expect(page.locator("#character-sheet-小銭")).toHaveValue("10");
    await expect(acquiredCredit).toHaveCSS("text-align", "right");
    await expect(page.locator("#character-sheet-合計信用")).toHaveAttribute(
      "readonly",
      "",
    );

    await acquiredCredit.fill("");
    await providedCredit.fill("-3");
    await receivedCredit.fill("4");
    await changeAdjustment.focus();
    await changeAdjustment.press("ControlOrMeta+A");
    await changeAdjustment.pressSequentially("-2");
    await changeAdjustment.blur();

    await expect(acquiredCredit).toHaveValue("0");
    await expect(providedCredit).toHaveValue("0");
    await expect(changeAdjustment).toHaveValue("-2");
    await expect(page.locator("#character-sheet-合計信用")).toHaveValue("4");
    await expect(page.locator("#character-sheet-小銭")).toHaveValue("2");
  });
});

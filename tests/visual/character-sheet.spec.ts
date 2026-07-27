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

    await bondsToggle.click();

    await expect(bondsToggle).toHaveAttribute("aria-expanded", "false");
    await expect(bondsContent).toBeHidden();
    await expect(checksToggle).toHaveAttribute("aria-expanded", "true");

    await bondsToggle.click();

    await expect(bondsToggle).toHaveAttribute("aria-expanded", "true");
    await expect(bondsContent).toBeVisible();
  });

  test("edits representative profile and numeric fields and toggles setting", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const pcName = page.getByLabel("PC名", { exact: true });
    const acquiredCredit = page.getByLabel("取得信用", { exact: true });
    const settingToggle = page.getByRole("button", {
      name: "設定",
      exact: true,
    });

    await pcName.focus();
    await page.keyboard.type("ネオン");
    await expect(pcName).toHaveValue("ネオン");
    await acquiredCredit.fill("12");
    await expect(acquiredCredit).toHaveValue("12");
    await expect(settingToggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByLabel("設定", { exact: true })).toBeHidden();

    await settingToggle.click();

    const setting = page.getByLabel("設定", { exact: true });
    await expect(settingToggle).toHaveAttribute("aria-expanded", "true");
    await setting.fill("ネオンの街\n雨の夜");
    await expect(setting).toHaveValue("ネオンの街\n雨の夜");
  });

  test("renders the G7 build inputs with the specified default state", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const buildSlot = page.locator(
      '[data-character-sheet-section-slot="build"]',
    );
    const profileSlot = page.locator(
      '[data-character-sheet-section-slot="profile"]',
    );

    await expect(
      buildSlot.getByRole("combobox", {
        name: "プライマリ流儀",
        exact: true,
      }),
    ).toHaveValue("");
    await expect(buildSlot.getByLabel("プライマリ流儀Lv")).toHaveValue("1");
    await expect(
      buildSlot.getByRole("combobox", { name: "生き様", exact: true }),
    ).toHaveValue("");
    await expect(buildSlot.getByLabel("生き様Lv")).toHaveValue("1");
    await expect(profileSlot.getByLabel("取得経験点")).toHaveValue("50");
    await expect(
      buildSlot.getByText("能力値ポイント: 0, 0, 0, 0"),
    ).toBeVisible();
  });

  test("keeps the narrow desktop attribute headers on one line except points", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("character-sheet/");

    const attributePane = page.locator('[class*="attributePane"]');
    const attributeHeaders = page.locator('[class*="attributeHeader"]');
    const pointsHeader = page.locator('[class*="pointsHeader"]');

    await expect(attributePane).toBeVisible();
    expect(
      await attributePane.evaluate(
        (element) => element.scrollWidth <= element.clientWidth,
      ),
    ).toBe(true);
    expect(
      await attributeHeaders.evaluateAll((headers) =>
        headers.every(
          (header) => getComputedStyle(header).whiteSpace === "nowrap",
        ),
      ),
    ).toBe(true);
    await expect(pointsHeader).toHaveText("能力値ポイント");
  });

  test("opens and dismisses the confirmation dialog without changing the form", async ({
    page,
  }) => {
    for (const viewport of [
      visualViewports.desktop,
      visualViewports.tablet,
      visualViewports.mobile,
    ]) {
      await page.setViewportSize(viewport);
      await page.goto("character-sheet/");

      const trigger = page.getByRole("button", {
        name: "確認ダイアログを開く",
      });
      const dialog = page.getByRole("dialog", { name: "確認" });
      await expect(async () => {
        await trigger.click();
        await expect(dialog).toBeVisible({ timeout: 250 });
      }).toPass();
      await page.keyboard.press("Escape");
      await expect(dialog).toBeHidden();

      const pcName = page.getByLabel("PC名", { exact: true });
      await pcName.fill("ネオン");
      await expect(async () => {
        await trigger.click();
        await expect(dialog).toBeVisible({ timeout: 250 });
      }).toPass();
      await expect(
        dialog.getByText(
          "この操作は確認用です。キャラクターシートの内容は変更されません。",
        ),
      ).toBeVisible();
      await expect(
        dialog.getByRole("button", { name: "キャンセル" }),
      ).toBeFocused();
      await page.mouse.click(0, 0);
      await expect(dialog).toBeVisible();
      const dialogBody = dialog.locator("p").locator("..");
      await dialog.locator("p").evaluate((element) => {
        element.textContent = "確認用の本文です。".repeat(300);
      });
      expect(
        await dialogBody.evaluate(
          (element) => element.scrollHeight > element.clientHeight,
        ),
      ).toBe(true);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);

      await page.keyboard.press("Escape");

      await expect(dialog).toBeHidden();
      await expect(trigger).toBeFocused();
      await expect(pcName).toHaveValue("ネオン");
    }
  });
});

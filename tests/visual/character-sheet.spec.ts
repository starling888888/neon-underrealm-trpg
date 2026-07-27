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
  test("uses a menu rail only when the one-column sheet has enough width", async ({
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

    await expect(page.locator(".character-sheet-menu-rail")).toBeHidden();
    await expect(
      page.locator("[data-character-sheet-menu-open]:visible"),
    ).toHaveCount(1);
    await page.locator("[data-character-sheet-menu-open]:visible").click();
    await expect(
      page.locator("#character-sheet-site-menu-drawer"),
    ).toBeVisible();
    await page.keyboard.press("Escape");

    await page.setViewportSize({ width: 1024, height: 1180 });

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

  test("edits representative secondary fields", async ({ page }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const movementModifier = page.getByLabel("移動力修正", { exact: true });
    const temporaryChoice = page.getByRole("checkbox", {
      exact: true,
      name: "移動力の一時修正を適用",
    });

    await movementModifier.fill("-2");
    await movementModifier.blur();
    await expect(movementModifier).toHaveValue("-2");
    await temporaryChoice.check();
    await expect(temporaryChoice).toBeChecked();
  });

  test("edits attack and reaction checks while keeping one attack row", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const attackSkill = page.getByLabel("攻撃1の技能", { exact: true });
    const attackAttribute = page.getByLabel("攻撃1の対応能力", {
      exact: true,
    });
    const attackModifier = page.getByLabel("攻撃1の判定修正", {
      exact: true,
    });
    const finalRemove = page.getByRole("button", { name: "攻撃1を削除" });

    await expect(finalRemove).toBeDisabled();
    await attackSkill.selectOption("shooting");
    await expect(attackAttribute).toHaveValue("perception");
    await attackAttribute.selectOption("mind");
    await attackModifier.fill("-2");
    await expect(attackModifier).toHaveValue("-2");
    await page.getByRole("button", { name: "＋ 攻撃を追加" }).click();
    await expect(page.getByLabel("攻撃2の技能", { exact: true })).toHaveValue(
      "brawl",
    );
    await expect(finalRemove).toBeEnabled();
    await page
      .getByLabel("防御の対応能力", { exact: true })
      .selectOption("agility");
    await expect(
      page.getByLabel("防御の対応能力", { exact: true }),
    ).toHaveValue("agility");
  });

  test("edits a noncombat check from its initially collapsed section", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const favorite = page.getByLabel("脅迫を得意技能にする", {
      exact: true,
    });
    const modifier = page.getByLabel("脅迫の判定修正", { exact: true });

    await page
      .getByRole("button", { exact: true, name: "非戦闘技能を開閉" })
      .click();
    await favorite.check();
    await expect(favorite).toBeChecked();
    await modifier.fill("-2");
    await expect(modifier).toHaveValue("-2");
  });

  test("locks resolved bonds, clears only unlocked rows, and warns when over the limit", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.mobile);
    await page.goto("character-sheet/");

    const firstTarget = page.getByLabel("縁1の対象", { exact: true });
    const firstResolve = page.getByLabel("縁1の覚悟", { exact: true });
    const firstClear = page.getByRole("button", {
      name: "縁1をクリア（行は削除しません）",
    });

    await firstTarget.fill("アキラ");
    await firstResolve.check();
    await expect(firstTarget).toBeDisabled();
    await expect(firstClear).toBeDisabled();
    await firstResolve.uncheck();
    await expect(firstTarget).toBeEnabled();
    await firstClear.click();
    await expect(firstTarget).toHaveValue("");

    const bondLimitModifier = page.getByLabel("縁最大数修正", {
      exact: true,
    });
    await page.getByLabel("縁1の対象", { exact: true }).fill("アキラ");
    await page.getByLabel("縁2の対象", { exact: true }).fill("ベラ");
    await bondLimitModifier.fill("-3");
    await expect(
      page.getByText("入力済みの縁が結べる縁の上限を超えています。"),
    ).toBeVisible();
    await page.getByRole("button", { name: "縁2を削除" }).click();
    await expect(
      page.getByText("入力済みの縁が結べる縁の上限を超えています。"),
    ).toBeHidden();
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

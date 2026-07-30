import { readFile } from "node:fs/promises";

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

async function addSpecialItemCategory(page: Page, name: string): Promise<void> {
  await page
    .getByRole("button", { exact: true, name: `${name}を追加` })
    .click();
}

async function restoreFixedCyberneticPartMismatch(page: Page): Promise<void> {
  await addSpecialItemCategory(page, "サイバネ");
  const cybernetics = page.locator("[data-cybernetics-section]");
  await cybernetics
    .getByRole("button", { exact: true, name: "その他1：サイバネを選択" })
    .click();
  const picker = page.getByRole("dialog", {
    exact: true,
    name: "サイバネを選択",
  });
  await picker
    .getByRole("button", { exact: true, name: "ガードアーム" })
    .click();
  await page.waitForTimeout(250);
  await page.evaluate(() => {
    const storageKey = "neon-underrealm-character-sheet-form";
    const stored = localStorage.getItem(storageKey);
    if (stored === null) throw new Error("Expected a saved character sheet.");
    const values = JSON.parse(stored);
    values.cybernetics.headId = values.cybernetics.otherRows[0].cyberneticId;
    localStorage.setItem(storageKey, JSON.stringify(values));
  });
  await page.reload();
}

test.describe("character sheet page", () => {
  test("rejects a malformed saved form without changing the initial form", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("neon-underrealm-character-sheet-form", "{");
    });
    await page.goto("character-sheet/");

    const dialog = page.getByRole("dialog", { name: "自動復元の失敗" });
    await expect(dialog).toBeVisible();
    await expect(
      dialog.getByText("自動復元に失敗しました。", { exact: true }),
    ).toBeVisible();
    await expect(dialog.getByRole("button", { name: "確認" })).toBeVisible();
    await dialog.getByRole("button", { name: "確認" }).click();
    await expect(dialog).toBeHidden();
    const pcName = page.getByLabel("PC名", { exact: true });
    await expect(pcName).toHaveValue("");
    await expect(pcName).toBeFocused();
  });

  test("returns focus after dismissing the restore error dialog with Escape", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      localStorage.setItem("neon-underrealm-character-sheet-form", "{");
    });
    await page.goto("character-sheet/");

    const dialog = page.getByRole("dialog", { name: "自動復元の失敗" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(page.getByLabel("PC名", { exact: true })).toBeFocused();
  });

  test("restores an incompatible fixed cybernetic as a local row error", async ({
    page,
  }) => {
    await page.goto("character-sheet/");
    await restoreFixedCyberneticPartMismatch(page);

    const cybernetics = page.locator("[data-cybernetics-section]");
    const picker = cybernetics.getByRole("button", {
      exact: true,
      name: "頭：ガードアーム",
    });
    await expect(picker).toHaveAttribute("aria-invalid", "true");
    await expect(picker.locator("xpath=ancestor::fieldset")).toHaveAttribute(
      "data-invalid",
      "true",
    );
  });

  test("exports JSON from desktop and responsive action buttons", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const pcName = page.getByLabel("PC名", { exact: true });
    await pcName.fill("テストPC");
    await page.getByLabel("PL名", { exact: true }).fill("テストPL");
    await expect(
      page.getByRole("region", { name: "キャラクターシートの操作" }),
    ).toContainText("エラーはありません。");

    const desktopDownloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { exact: true, name: "エクスポート" })
      .click();
    const desktopDownload = await desktopDownloadPromise;
    expect(desktopDownload.suggestedFilename()).toMatch(
      /^neon-underrealm_character-sheet_\d{4}-\d{2}-\d{2}_テストPL_テストPC\.json$/,
    );

    for (const name of ["ヘルプ", "インポート", "CCFOLIAコピー"]) {
      await page.getByRole("button", { exact: true, name }).click();
    }
    await page.getByRole("button", { exact: true, name: "確認" }).click();
    const errorDialog = page.getByRole("dialog", { name: "エラー" });
    await expect(errorDialog).toContainText("エラーはありません。");
    await errorDialog
      .getByRole("button", { exact: true, name: "閉じる" })
      .click();
    await expect(errorDialog).toBeHidden();
    await expect(pcName).toHaveValue("テストPC");

    for (const viewport of [visualViewports.tablet, visualViewports.mobile]) {
      await page.setViewportSize(viewport);
      await expect(page.getByRole("button", { name: "ヘルプ" })).toBeVisible();
      const trigger = page.getByRole("button", {
        exact: true,
        name: "操作メニューを開く、エラーはありません。",
      });
      await trigger.click();
      const menu = page.getByRole("region", {
        name: "キャラクターシートの操作メニュー",
      });
      await expect(menu).toBeVisible();
      const responsiveDownloadPromise = page.waitForEvent("download");
      await menu
        .getByRole("button", { exact: true, name: "エクスポート" })
        .click();
      const responsiveDownload = await responsiveDownloadPromise;
      expect(responsiveDownload.suggestedFilename()).toMatch(
        /^neon-underrealm_character-sheet_\d{4}-\d{2}-\d{2}_テストPL_テストPC\.json$/,
      );
      await expect(
        page.getByRole("button", {
          exact: true,
          name: "操作メニューを閉じる、エラーはありません。",
        }),
      ).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();
    }

    await page.setViewportSize(visualViewports.desktop);
    const resetTrigger = page.getByRole("button", {
      exact: true,
      name: "初期化",
    });
    await resetTrigger.click();
    const resetDialog = page.getByRole("dialog", { name: "入力内容を初期化" });
    await expect(resetDialog).toContainText(
      "入力済みのデータと画像を初期状態に戻します。\n本当によろしいですか？",
    );
    await expect(resetDialog.getByRole("heading")).toHaveCount(0);
    await expect(
      resetDialog.getByRole("button", { exact: true, name: "キャンセル" }),
    ).toBeFocused();
    await resetDialog
      .getByRole("button", { exact: true, name: "キャンセル" })
      .click();
    await expect(pcName).toHaveValue("テストPC");
    await expect(resetTrigger).toBeFocused();

    await resetTrigger.click();
    await page.keyboard.press("Escape");
    await expect(resetDialog).toBeHidden();
    await expect(pcName).toHaveValue("テストPC");
    await expect(resetTrigger).toBeFocused();

    await resetTrigger.click();
    await resetDialog
      .getByRole("button", { exact: true, name: "初期化" })
      .click();
    await expect(resetDialog).toBeHidden();
    await expect(pcName).toHaveValue("");
    await expect(resetTrigger).toBeFocused();
  });

  test("replaces form values from JSON and reports an invalid imported image", async ({
    page,
  }) => {
    await page.goto("character-sheet/");

    const downloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", { exact: true, name: "エクスポート" })
      .click();
    const download = await downloadPromise;
    const downloadPath = await download.path();
    if (downloadPath === null) throw new Error("Expected an exported JSON.");
    const imported = JSON.parse(await readFile(downloadPath, "utf8")) as Record<
      string,
      unknown
    >;
    imported.profile = {
      ...(imported.profile as Record<string, unknown>),
      pcName: "JSON入力PC",
    };

    await page.getByRole("button", { exact: true, name: "インポート" }).click();
    await page.locator('input[accept="application/json,.json"]').setInputFiles({
      buffer: Buffer.from(JSON.stringify(imported)),
      mimeType: "application/json",
      name: "character.json",
    });
    const confirmDialog = page.getByRole("dialog", { name: "JSON入力の確認" });
    await expect(confirmDialog).toBeVisible();
    await confirmDialog
      .getByRole("button", { exact: true, name: "キャンセル" })
      .click();
    await expect(confirmDialog).toBeHidden();
    await expect(
      page.getByRole("button", { exact: true, name: "インポート" }),
    ).toBeFocused();

    await page.getByRole("button", { exact: true, name: "インポート" }).click();
    await page.locator('input[accept="application/json,.json"]').setInputFiles({
      buffer: Buffer.from(JSON.stringify(imported)),
      mimeType: "application/json",
      name: "character.json",
    });
    await expect(confirmDialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(confirmDialog).toBeHidden();
    await expect(
      page.getByRole("button", { exact: true, name: "インポート" }),
    ).toBeFocused();

    await page.getByRole("button", { exact: true, name: "インポート" }).click();
    await page.locator('input[accept="application/json,.json"]').setInputFiles({
      buffer: Buffer.from(JSON.stringify(imported)),
      mimeType: "application/json",
      name: "character.json",
    });
    await expect(confirmDialog).toBeVisible();
    await confirmDialog
      .getByRole("button", { exact: true, name: "インポート" })
      .click();
    await expect(page.getByLabel("PC名", { exact: true })).toHaveValue(
      "JSON入力PC",
    );
    await expect(
      page.getByRole("button", { exact: true, name: "インポート" }),
    ).toBeFocused();

    imported.imageBase64String = 42;
    await page.getByRole("button", { exact: true, name: "インポート" }).click();
    await page.locator('input[accept="application/json,.json"]').setInputFiles({
      buffer: Buffer.from(JSON.stringify(imported)),
      mimeType: "application/json",
      name: "broken-image.json",
    });
    await page
      .getByRole("dialog", { name: "JSON入力の確認" })
      .getByRole("button", { exact: true, name: "インポート" })
      .click();
    const imageError = page.getByRole("dialog", {
      name: "入力データの画像の誤り",
    });
    await expect(imageError).toContainText(
      "入力データの画像に誤りがあり表示できませんでした。",
    );
    await imageError.getByRole("button", { exact: true, name: "確認" }).click();
    await expect(
      page.getByRole("button", { exact: true, name: "インポート" }),
    ).toBeFocused();
    await expect(page.getByLabel("PC名", { exact: true })).toHaveValue(
      "JSON入力PC",
    );

    imported.imageBase64String = null;
    await page.setViewportSize(visualViewports.mobile);
    await page
      .getByRole("button", {
        exact: true,
        name: "操作メニューを開く、エラーはありません。",
      })
      .click();
    const menu = page.getByRole("region", {
      name: "キャラクターシートの操作メニュー",
    });
    const mobileImport = menu.getByRole("button", {
      exact: true,
      name: "インポート",
    });
    await mobileImport.click();
    await page.locator('input[accept="application/json,.json"]').setInputFiles({
      buffer: Buffer.from(JSON.stringify(imported)),
      mimeType: "application/json",
      name: "mobile-character.json",
    });
    await page
      .getByRole("dialog", { name: "JSON入力の確認" })
      .getByRole("button", { exact: true, name: "インポート" })
      .click();
    await expect(mobileImport).toBeFocused();
  });

  test("dismisses an open dialog before the responsive action menu", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.mobile);
    await page.goto("character-sheet/");

    const trigger = page.getByRole("button", {
      exact: true,
      name: "操作メニューを開く、エラーはありません。",
    });
    const menu = page.getByRole("region", {
      name: "キャラクターシートの操作メニュー",
    });
    const weaponPicker = page
      .getByRole("region", { exact: true, name: "武器" })
      .getByRole("button", { exact: true, name: "武器1：武器を選択" });

    await trigger.click();
    await expect(menu).toBeVisible();
    await weaponPicker.focus();
    await weaponPicker.press("Enter");

    const dialog = page.getByRole("dialog", { name: "武器を選択" });
    await expect(dialog).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(menu).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("selects a primary skill and confirms a primary ryugi change", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const primaryRyugi = page.locator("[data-build-section] select").first();
    const primarySkills = page.getByRole("region", {
      name: "プライマリ流儀スキル",
    });
    const skillPicker = primarySkills.getByRole("button", {
      name: "未選択スキル1",
      exact: true,
    });

    await expect(async () => {
      await primaryRyugi.selectOption("kenkaya");
      await expect(skillPicker).toBeVisible();
    }).toPass();

    await skillPicker.click();
    const pickerDialog = page.getByRole("dialog", {
      name: "プライマリ流儀スキルを選択",
    });
    await expect(pickerDialog).toBeVisible();
    await pickerDialog.getByRole("button", { name: /旋風/ }).click();
    await expect(pickerDialog).toBeHidden();

    await primaryRyugi.selectOption("emono");
    const confirmationDialog = page.getByRole("dialog", {
      name: "プライマリ流儀の変更確認",
    });
    await expect(confirmationDialog).toBeVisible();
    await confirmationDialog.getByRole("button", { name: "変更" }).click();
    await expect(confirmationDialog).toBeHidden();
    await expect(primaryRyugi).toHaveValue("emono");
  });

  test("selects an ikizama skill", async ({ page }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const ikizama = page.locator("[data-build-section] select").nth(1);
    const ikizamaSkills = page.getByRole("region", { name: "生き様スキル" });
    const skillPicker = ikizamaSkills.getByRole("button", {
      name: "未選択スキル1",
      exact: true,
    });

    await expect(async () => {
      await ikizama.selectOption("burai");
      await expect(skillPicker).toBeVisible();
    }).toPass();

    await skillPicker.click();
    const pickerDialog = page.getByRole("dialog", {
      name: "生き様スキルを選択",
    });
    await expect(pickerDialog).toBeVisible();
    await pickerDialog.getByRole("button").first().click();
    await expect(pickerDialog).toBeHidden();
  });

  test("selects a common skill and reflects its level total", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const commonSkills = page.getByRole("region", { name: "共通スキル" });
    const skillPicker = commonSkills.getByRole("button", {
      name: "共通スキル未選択スキル1",
      exact: true,
    });

    await expect(async () => {
      await skillPicker.click();
      await expect(
        page.getByRole("dialog", { name: "共通スキルを選択" }),
      ).toBeVisible();
    }).toPass();
    const pickerDialog = page.getByRole("dialog", {
      name: "共通スキルを選択",
    });
    await pickerDialog.getByRole("button", { name: "基本の連撃" }).click();
    await expect(pickerDialog).toBeHidden();
    await expect(
      commonSkills.getByText("取得合計レベル：1／合計レベル上限：1"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", {
        name: "共通スキルレベル合計／共通スキル上限",
      }),
    ).toBeVisible();
  });

  test("selects an other-ryugi skill and confirms its removal", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    await page.getByRole("button", { name: "＋ その他流儀を追加" }).click();
    const otherRyugi = page.getByRole("combobox", {
      exact: true,
      name: "その他流儀1",
    });
    await otherRyugi.selectOption("kenkaya");
    await page.getByLabel("その他流儀1Lv", { exact: true }).fill("1");

    const section = page.getByRole("region", { name: "その他流儀スキル1" });
    await section
      .getByRole("button", { name: "未選択スキル1", exact: true })
      .click();
    const picker = page.getByRole("dialog", { name: "その他流儀スキルを選択" });
    await expect(picker).toBeVisible();
    await picker.getByRole("button", { name: "旋風" }).click();
    await expect(picker).toBeHidden();

    await page.getByRole("button", { name: "その他流儀1を削除" }).click();
    const confirm = page.getByRole("dialog", { name: "その他流儀の削除確認" });
    await expect(confirm).toBeVisible();
    await confirm.getByRole("button", { name: "削除" }).click();
    await expect(confirm).toBeHidden();
    await expect(otherRyugi).toBeHidden();
  });

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
      "0px",
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
    await expect(
      page.locator("astro-island[component-url*='CharacterSheetContainer']"),
    ).not.toHaveAttribute("ssr");

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
    await firstResolve.focus();
    await firstResolve.press("Space");
    await expect(firstResolve).not.toBeChecked();
    await expect(firstTarget).toBeEnabled();
    await firstClear.click();
    await expect(firstTarget).toHaveValue("");

    const bondLimitModifier = page.getByLabel("縁最大数修正", {
      exact: true,
    });
    await page.getByLabel("縁1の対象", { exact: true }).fill("アキラ");
    await page.getByLabel("縁2の対象", { exact: true }).fill("ベラ");
    await bondLimitModifier.fill("-3");
    const bondLimitError = page
      .getByRole("region", { exact: true, name: "縁" })
      .getByText("入力済みの縁が結べる縁の上限を超えています。");
    await expect(bondLimitError).toBeVisible();
    const firstOverflowCandidate = page.getByLabel("縁1の対象", {
      exact: true,
    });
    const overflowTarget = page.getByLabel("縁2の対象", { exact: true });
    await expect(overflowTarget).toHaveCSS(
      "background-color",
      await firstOverflowCandidate.evaluate(
        (input) => getComputedStyle(input).backgroundColor,
      ),
    );
    await page.getByRole("button", { name: "縁2上へ移動" }).click();
    await expect(page.getByLabel("縁1の対象", { exact: true })).toHaveValue(
      "ベラ",
    );
    await expect(page.getByLabel("縁2の対象", { exact: true })).toHaveValue(
      "アキラ",
    );
    await page.getByRole("button", { name: "縁2を削除" }).click();
    await expect(bondLimitError).toBeHidden();
  });

  test("summarizes errors in the desktop dialog and responsive menu", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");
    await page.getByLabel("縁1の対象", { exact: true }).fill("アキラ");
    await page.getByLabel("縁2の対象", { exact: true }).fill("ベラ");
    await page.getByLabel("縁最大数修正", { exact: true }).fill("-3");
    await page.getByLabel("取得経験点", { exact: true }).fill("-1");

    const actionPane = page.getByRole("region", {
      name: "キャラクターシートの操作",
    });
    await expect(actionPane).toContainText("エラーが2件あります。");
    await page.getByRole("button", { exact: true, name: "確認" }).click();
    const dialog = page.getByRole("dialog", { name: "エラー" });
    await expect(dialog).toContainText("エラーが2件あります。");
    await expect(dialog.getByRole("list")).toContainText(
      "縁2「ベラ」：結べる縁の上限を超えています。",
    );
    await expect(dialog.getByRole("list")).toContainText(
      "消費経験点が取得経験点を超えているか、取得経験点が不正です。",
    );
    await dialog.getByRole("button", { exact: true, name: "閉じる" }).click();
    await expect(dialog).toBeHidden();

    await page.setViewportSize(visualViewports.mobile);
    const menuTrigger = page.getByRole("button", {
      exact: true,
      name: "操作メニューを開く、エラーが2件あります。",
    });
    await menuTrigger.click();
    const menu = page.getByRole("region", {
      name: "キャラクターシートの操作メニュー",
    });
    await expect(menu).toContainText("エラーが2件あります。");
    await expect(menu.getByRole("list")).toContainText(
      "縁2「ベラ」：結べる縁の上限を超えています。",
    );
    await expect(menu.getByRole("list")).toContainText(
      "消費経験点が取得経験点を超えているか、取得経験点が不正です。",
    );
    await expect(menu.getByRole("heading", { name: "エラー" })).toHaveCount(0);
  });

  test("selects, reorders, and removes weapons while keeping one row", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const weapons = page.getByRole("region", { exact: true, name: "武器" });
    const weaponPicker = page.getByRole("dialog", {
      exact: true,
      name: "武器を選択",
    });

    await weapons
      .getByRole("button", { exact: true, name: "武器1：武器を選択" })
      .click();
    await expect(weaponPicker).toBeVisible();
    await weaponPicker.getByRole("button", { exact: true, name: "刀" }).click();
    await expect(weaponPicker).toBeHidden();
    await expect(
      weapons.getByRole("button", { exact: true, name: "武器1：刀" }),
    ).toBeVisible();

    await weapons
      .getByRole("button", { exact: true, name: "＋ 武器を追加" })
      .click();
    await weapons
      .getByRole("button", { exact: true, name: "武器2：武器を選択" })
      .click();
    await weaponPicker
      .getByRole("button", { exact: true, name: "バット" })
      .click();
    await expect(weaponPicker).toBeHidden();
    await expect(
      weapons.getByRole("button", { exact: true, name: "武器1：刀を削除" }),
    ).toBeEnabled();
    await expect(
      weapons.getByRole("button", { exact: true, name: "武器1：刀下へ移動" }),
    ).toBeVisible();

    await weapons
      .getByRole("button", { exact: true, name: "武器1：刀下へ移動" })
      .click();
    await weapons
      .getByRole("button", { exact: true, name: "武器2：刀を削除" })
      .click();
    await expect(
      weapons.getByRole("button", { exact: true, name: "武器1：バットを削除" }),
    ).toBeDisabled();
  });

  test("selects and clears armor without a confirmation dialog", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const armor = page.getByRole("region", { exact: true, name: "防具" });
    const armorPicker = page.getByRole("dialog", {
      exact: true,
      name: "防具を選択",
    });

    await armor
      .getByRole("button", { exact: true, name: "防具を選択" })
      .click();
    await expect(armorPicker).toBeVisible();
    await armorPicker
      .getByRole("button", { exact: true, name: "チンピラ服" })
      .click();
    await expect(armorPicker).toBeHidden();
    await expect(
      armor.getByRole("button", { exact: true, name: "チンピラ服" }),
    ).toBeVisible();

    const defenseModifier = armor
      .locator('input[aria-label="チンピラ服防御力の修正"]')
      .first();
    await defenseModifier.fill("3");
    await expect(defenseModifier).toHaveValue("3");
    await armor.getByRole("button", { exact: true, name: "クリア" }).click();
    await expect(
      armor.getByRole("button", { exact: true, name: "防具を選択" }),
    ).toBeVisible();
    const clearedDefenseModifiers = armor.locator(
      'input[aria-label="防具を選択防御力の修正"]',
    );
    await expect(clearedDefenseModifiers).toHaveCount(2);
    await expect(clearedDefenseModifiers.first()).toHaveValue("");
    await expect(clearedDefenseModifiers.last()).toHaveValue("");
    await expect(page.getByRole("dialog")).toBeHidden();
  });

  test("manages special item categories and confirms removal of entered items", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    const specialItems = page.locator("[data-special-items-section]");
    const ikizama = page.locator("[data-build-section] select").nth(1);

    await expect(
      specialItems.getByText("生き様を選択してください。", { exact: true }),
    ).toBeVisible();
    await expect(
      specialItems.locator("[data-special-item-category]"),
    ).toHaveCount(0);
    await expect(
      specialItems.getByRole("button", { name: /を追加$/, exact: false }),
    ).toHaveCount(4);

    await addSpecialItemCategory(page, "お守り");
    const omamori = specialItems.locator(
      '[data-special-item-category="omamori"]',
    );
    await expect(omamori).toBeVisible();
    await expect(omamori).toHaveAttribute("data-unavailable", "true");
    await expect(
      omamori.getByText(/通常使用不可/, { exact: false }),
    ).toHaveCount(0);

    await omamori
      .getByRole("button", { exact: true, name: "お守りカテゴリを削除" })
      .click();
    await expect(omamori).toBeHidden();
    await expect(
      specialItems.getByRole("button", { exact: true, name: "お守りを追加" }),
    ).toBeFocused();

    await addSpecialItemCategory(page, "お守り");

    await ikizama.selectOption("sumi");
    await expect(
      specialItems.locator("[data-special-item-category]").first(),
    ).toHaveAttribute("data-special-item-category", "nanomachines");
    await expect(
      specialItems.getByText("スミでは通常使用不可", { exact: true }),
    ).toBeVisible();
    await expect(
      page
        .locator('[data-special-item-category="nanomachines"]')
        .getByRole("button", { name: /カテゴリを削除$/ }),
    ).toHaveCount(0);

    const picker = page.getByRole("dialog", {
      exact: true,
      name: "お守りを選択",
    });
    await omamori
      .getByRole("button", { exact: true, name: "＋ お守りを追加" })
      .click();
    await omamori
      .getByRole("button", { exact: true, name: "お守り1：お守りを選択" })
      .click();
    await picker
      .getByRole("button", { exact: true, name: "活気のお守り" })
      .click();
    await expect(
      omamori.getByRole("button", {
        exact: true,
        name: "お守り1：活気のお守り",
      }),
    ).toBeVisible();
    await expect(
      page
        .getByRole("button", { exact: true, name: "消費信用" })
        .locator("..")
        .locator("..")
        .getByRole("status"),
    ).toHaveText("2");

    const removeCategory = page.getByRole("button", {
      exact: true,
      name: "お守りカテゴリを削除",
    });
    await removeCategory.click();
    const confirm = page.getByRole("dialog", { name: "お守りカテゴリを削除" });
    await expect(confirm).toBeVisible();
    await confirm
      .getByRole("button", { exact: true, name: "キャンセル" })
      .click();
    await expect(confirm).toBeHidden();
    await expect(omamori).toBeVisible();

    await removeCategory.click();
    await confirm.getByRole("button", { exact: true, name: "削除" }).click();
    await expect(confirm).toBeHidden();
    await expect(omamori).toBeHidden();
    await expect(
      specialItems.getByRole("button", { exact: true, name: "お守りを追加" }),
    ).toBeFocused();

    await ikizama.selectOption("burai");
    await expect(
      specialItems.locator("[data-special-item-category]").first(),
    ).toHaveAttribute("data-special-item-category", "omamori");
    await expect(
      specialItems.locator("[data-special-item-category]").nth(1),
    ).toHaveAttribute("data-special-item-category", "nanomachines");
  });

  test("selects, reorders, removes, and expands omamori", async ({ page }) => {
    await page.setViewportSize(visualViewports.mobile);
    await page.goto("character-sheet/");

    await addSpecialItemCategory(page, "お守り");

    const omamori = page.getByRole("region", { exact: true, name: "お守り" });
    const picker = page.getByRole("dialog", {
      exact: true,
      name: "お守りを選択",
    });

    await omamori
      .getByRole("button", { exact: true, name: "＋ お守りを追加" })
      .click();
    await omamori
      .getByRole("button", { exact: true, name: "お守り1：お守りを選択" })
      .click();
    await expect(picker).toBeVisible();
    await picker
      .getByRole("button", { exact: true, name: "活気のお守り" })
      .click();
    await expect(picker).toBeHidden();

    await omamori
      .getByRole("button", { exact: true, name: "＋ お守りを追加" })
      .click();
    await omamori
      .getByRole("button", { exact: true, name: "お守り2：お守りを選択" })
      .click();
    await picker
      .getByRole("button", { exact: true, name: "疫病神のお守り" })
      .click();
    await expect(picker).toBeHidden();

    await omamori
      .getByRole("button", {
        exact: true,
        name: "お守り1：活気のお守り下へ移動",
      })
      .click();
    await omamori
      .getByRole("button", {
        exact: true,
        name: "お守り1：疫病神のお守りを削除",
      })
      .click();
    await expect(
      omamori.getByRole("button", {
        exact: true,
        name: "お守り1：活気のお守り",
      }),
    ).toBeVisible();

    await omamori
      .getByRole("button", {
        exact: true,
        name: "お守り1：活気のお守り効果を開く",
      })
      .click();
    await expect(omamori.locator('[id^="omamori-details-"]')).toBeVisible();
  });

  test("selects, reorders, removes, and expands drugs without duplicate selection", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.mobile);
    await page.goto("character-sheet/");

    await addSpecialItemCategory(page, "ドラッグ");

    const drugs = page.locator('[data-special-item-category="drugs"]');
    const picker = page.getByRole("dialog", {
      exact: true,
      name: "ドラッグを選択",
    });
    const firstPicker = drugs.getByRole("button", {
      exact: true,
      name: "ドラッグ1：ドラッグを選択",
    });

    await firstPicker.click();
    await expect(picker).toBeVisible();
    await picker
      .getByRole("button", { exact: true, name: "マッスルドラッグ" })
      .click();
    await expect(picker).toBeHidden();

    await drugs
      .getByRole("button", {
        exact: true,
        name: "ドラッグ2：ドラッグを選択",
      })
      .click();
    const duplicate = picker.getByRole("button", {
      exact: true,
      name: "マッスルドラッグ",
    });
    await expect(duplicate).toBeDisabled();
    await page.keyboard.press("Escape");
    await expect(picker).toBeHidden();
    await expect(
      drugs.getByRole("button", {
        exact: true,
        name: "ドラッグ2：ドラッグを選択",
      }),
    ).toBeFocused();

    await drugs
      .getByRole("button", {
        exact: true,
        name: "ドラッグ2：ドラッグを選択",
      })
      .click();
    await picker
      .getByRole("button", { exact: true, name: "スピードドラッグ" })
      .click();
    await expect(picker).toBeHidden();

    const quantity = drugs.getByLabel("ドラッグ1：マッスルドラッグ所持数", {
      exact: true,
    });
    await quantity.fill("2");
    await expect(quantity).toHaveValue("2");
    await drugs
      .getByRole("button", {
        exact: true,
        name: "ドラッグ1：マッスルドラッグ効果を開く",
      })
      .click();
    await expect(
      drugs.getByText("使用タイミング：", { exact: true }),
    ).toBeVisible();
    await expect(
      drugs.getByText("1セット数量：", { exact: true }),
    ).toBeVisible();

    await drugs
      .getByRole("button", {
        exact: true,
        name: "ドラッグ1：マッスルドラッグ下へ移動",
      })
      .click();
    await drugs
      .getByRole("button", {
        exact: true,
        name: "ドラッグ1：スピードドラッグを削除",
      })
      .click();
    await expect(
      drugs.getByRole("button", {
        exact: true,
        name: "ドラッグ1：マッスルドラッグ",
      }),
    ).toBeVisible();
  });

  test("selects cybernetics, manages other rows, and resets noncombat modifiers at the threshold", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.mobile);
    await page.goto("character-sheet/");

    await addSpecialItemCategory(page, "サイバネ");

    const cybernetics = page.locator("[data-cybernetics-section]");
    const picker = page.getByRole("dialog", {
      exact: true,
      name: "サイバネを選択",
    });

    async function selectCybernetic(target: string) {
      await cybernetics
        .getByRole("button", { exact: true, name: target })
        .first()
        .click();
      await expect(picker).toBeVisible();
      await picker
        .getByRole("button", { exact: true, name: "サイバーアイ" })
        .click();
      await expect(picker).toBeHidden();
    }

    await selectCybernetic("頭：サイバネを選択");
    await cybernetics
      .getByRole("button", { exact: true, name: "頭：サイバーアイ効果を開く" })
      .click();
    await expect(
      cybernetics.getByText("効果：感覚を用いる判定+1d。", { exact: true }),
    ).toBeVisible();

    await cybernetics
      .getByRole("button", { name: "＋ その他の部位を追加" })
      .click();
    await cybernetics
      .getByRole("button", { name: "＋ その他の部位を追加" })
      .click();
    await selectCybernetic("その他1：サイバネを選択");
    await selectCybernetic("その他2：サイバネを選択");

    await page
      .getByRole("button", { exact: true, name: "非戦闘技能を開閉" })
      .click();
    await expect(
      page.getByLabel("脅迫の判定修正", { exact: true }),
    ).toHaveValue("-2");
    await expect(
      cybernetics.getByRole("button", {
        exact: true,
        name: "その他2：サイバーアイを削除",
      }),
    ).toHaveCount(1);

    await cybernetics
      .getByRole("button", { exact: true, name: "その他2：サイバーアイを削除" })
      .click();
    await expect(
      cybernetics.getByRole("button", {
        exact: true,
        name: "その他2：サイバーアイを削除",
      }),
    ).toHaveCount(0);

    await cybernetics
      .getByRole("button", {
        exact: true,
        name: "その他1：サイバーアイをクリア",
      })
      .click();
    await expect(
      cybernetics.getByRole("button", {
        exact: true,
        name: "その他1：サイバネを選択",
      }),
    ).toHaveCount(1);
    await expect(
      cybernetics.getByRole("button", {
        exact: true,
        name: "その他2：サイバネを選択",
      }),
    ).toHaveCount(1);
    await page
      .getByRole("button", { exact: true, name: "非戦闘技能を開閉" })
      .click();
    await page
      .getByRole("button", { exact: true, name: "非戦闘技能を開閉" })
      .click();
    await expect(
      page.getByLabel("脅迫の判定修正", { exact: true }),
    ).toHaveValue("0");
  });

  test("selects, expands, clears, and dismisses the fixed nanomachine rows", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.mobile);
    await page.goto("character-sheet/");

    await addSpecialItemCategory(page, "ナノマシン");

    const nanomachines = page.locator("[data-nanomachines-section]");
    const picker = page.getByRole("dialog", {
      exact: true,
      name: "ナノマシンを選択",
    });
    const headPicker = nanomachines.getByRole("button", {
      exact: true,
      name: "頭：ナノマシンを選択",
    });

    await nanomachines
      .getByRole("button", { exact: true, name: "名称" })
      .hover();
    await expect(page.getByRole("tooltip")).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page.getByRole("tooltip")).toBeHidden();

    await nanomachines
      .getByRole("button", {
        exact: true,
        name: "埋め込み点数合計／埋め込み上限",
      })
      .hover();
    await expect(page.getByRole("tooltip")).toBeVisible();
    await page.mouse.move(0, 0);
    await expect(page.getByRole("tooltip")).toBeHidden();

    await headPicker.click();
    await expect(picker).toBeVisible();
    await picker.getByRole("button", { exact: true, name: "マシラ" }).click();
    await expect(picker).toBeHidden();

    const selectedHead = nanomachines.getByRole("button", {
      exact: true,
      name: "頭：マシラ",
    });
    await expect(selectedHead).toBeVisible();
    await nanomachines
      .getByRole("button", { exact: true, name: "頭：マシラ効果を開く" })
      .click();
    await expect(
      nanomachines.getByText("効果：武器化。筋力+1。", { exact: true }),
    ).toBeVisible();

    await nanomachines
      .getByRole("button", { exact: true, name: "頭：マシラをクリア" })
      .click();
    await expect(headPicker).toBeVisible();

    await headPicker.click();
    await expect(picker).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(picker).toBeHidden();
    await expect(headPicker).toBeFocused();

    await headPicker.click();
    await picker.getByRole("button", { exact: true, name: "マシラ" }).click();
    await page
      .locator("[data-build-section] select")
      .first()
      .selectOption("kenkaya");
    await page
      .locator("[data-build-section] select")
      .nth(1)
      .selectOption("burai");
    await nanomachines
      .getByLabel("埋め込み点数合計の修正", { exact: true })
      .fill("20");
    await expect(
      nanomachines.getByLabel(
        "埋め込み点数合計の最終値／埋め込み上限の最終値",
        { exact: true },
      ),
    ).toHaveAttribute("aria-invalid", "true");
    await expect(nanomachines.locator('[aria-invalid="true"]')).toHaveCount(1);
  });
});

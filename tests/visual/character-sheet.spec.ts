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

  test("selects an other-ryugi skill and confirms its removal", async ({
    page,
  }) => {
    await page.setViewportSize(visualViewports.desktop);
    await page.goto("character-sheet/");

    await page.getByRole("button", { name: "＋ その他流儀を追加" }).click();
    const otherRyugi = page.getByLabel("その他流儀1", { exact: true });
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
});

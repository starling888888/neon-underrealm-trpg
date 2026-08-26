import { expect, type Locator, type Page } from "@playwright/test";
import { siteRoutes } from "../support/site";
import {
  characterSheetMobileViewport,
  registerCharacterSheetVrtScenarios,
} from "./character-sheet-scenarios";

async function openTooltip(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { exact: true, name }).hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
}

async function openResetConfirm(page: Page): Promise<void> {
  const menuTrigger = page.getByRole("button", { name: /操作メニューを開く/ });
  if (await menuTrigger.isVisible()) {
    await menuTrigger.click();
  }

  await page.getByRole("button", { exact: true, name: "下書き破棄" }).click();
  await expect(page.getByRole("dialog", { name: "下書き破棄" })).toBeVisible();
}

async function openCcfoliaCopyConfirm(page: Page): Promise<void> {
  const menuTrigger = page.getByRole("button", { name: /操作メニューを開く/ });
  if (await menuTrigger.isVisible()) {
    await menuTrigger.click();
  }

  await page
    .getByRole("button", { exact: true, name: "CCFOLIAコピー" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "CCFOLIAコピー" }),
  ).toBeVisible();
}

async function selectCharacterImage(page: Page): Promise<void> {
  await page.locator('input[accept="image/*"]').setInputFiles({
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScLh+wAAAABJRU5ErkJggg==",
      "base64",
    ),
    mimeType: "image/png",
    name: "character.png",
  });
  await expect(
    page.getByRole("img", { name: "選択したキャラクター画像" }),
  ).toBeVisible();
}

async function fillBond(page: Page, row: number, value: string): Promise<void> {
  await page.getByLabel(`縁${row}の対象`, { exact: true }).fill(value);
}

async function prepareBondLimitError(page: Page): Promise<void> {
  await fillBond(page, 1, "アキラ");
  await fillBond(page, 2, "ベラ");
  await page.getByLabel("縁最大数修正", { exact: true }).fill("-3");
}

async function prepareRepresentativeErrors(page: Page): Promise<void> {
  await prepareBondLimitError(page);
  await page.getByLabel("取得経験点", { exact: true }).fill("-1");
}

async function addAttack(page: Page): Promise<void> {
  await page.getByRole("button", { name: "＋ 攻撃を追加" }).click();
  await expect(page.getByLabel("攻撃2の技能", { exact: true })).toBeVisible();
}

async function openWeaponPicker(page: Page): Promise<void> {
  await page
    .getByRole("region", { exact: true, name: "武器" })
    .getByRole("button", { name: /^武器\d+：武器を選択$/ })
    .click();
  await expect(page.getByRole("dialog", { name: "武器を選択" })).toBeVisible();
}

async function selectWeapon(page: Page, name = "刀"): Promise<void> {
  await openWeaponPicker(page);
  const picker = page.getByRole("dialog", { name: "武器を選択" });
  await picker.getByRole("button", { exact: true, name }).click();
  await expect(picker).toBeHidden();
}

async function openArmorPicker(page: Page): Promise<void> {
  await page
    .getByRole("region", { exact: true, name: "防具" })
    .getByRole("button", { exact: true, name: "防具を選択" })
    .click();
  await expect(page.getByRole("dialog", { name: "防具を選択" })).toBeVisible();
}

async function openOmamoriPicker(page: Page): Promise<void> {
  await addSpecialItemCategory(page, "お守り");
  const section = page.getByRole("region", { exact: true, name: "お守り" });
  await section
    .getByRole("button", { exact: true, name: "＋ お守りを追加" })
    .click();
  await section
    .getByRole("button", { exact: true, name: "お守り1：お守りを選択" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "お守りを選択" }),
  ).toBeVisible();
}

async function selectOmamori(page: Page): Promise<void> {
  await openOmamoriPicker(page);
  const picker = page.getByRole("dialog", { name: "お守りを選択" });
  await picker
    .getByRole("button", { exact: true, name: "活気のお守り" })
    .click();
  await expect(picker).toBeHidden();
}

async function openCyberneticsPicker(page: Page): Promise<void> {
  await addSpecialItemCategory(page, "サイバネ");
  await cyberneticsSection
    .resolve(page)
    .getByRole("button", { exact: true, name: "頭：サイバネを選択" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "サイバネを選択" }),
  ).toBeVisible();
}

async function selectCybernetic(page: Page): Promise<void> {
  await openCyberneticsPicker(page);
  const picker = page.getByRole("dialog", { name: "サイバネを選択" });
  await picker
    .getByRole("button", { exact: true, name: "サイバーアイ" })
    .click();
  await expect(picker).toBeHidden();
}

async function restoreFixedCyberneticPartMismatch(page: Page): Promise<void> {
  await addSpecialItemCategory(page, "サイバネ");
  await cyberneticsSection
    .resolve(page)
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

async function openNanomachinePicker(page: Page): Promise<void> {
  await addSpecialItemCategory(page, "ナノマシン");
  await nanomachinesSection
    .resolve(page)
    .getByRole("button", { exact: true, name: "頭：ナノマシンを選択" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "ナノマシンを選択" }),
  ).toBeVisible();
}

async function selectNanomachine(page: Page): Promise<void> {
  await openNanomachinePicker(page);
  const picker = page.getByRole("dialog", { name: "ナノマシンを選択" });
  await picker.getByRole("button", { exact: true, name: "マシラ" }).click();
  await expect(picker).toBeHidden();
}

async function openDrugsPicker(page: Page, row = 1): Promise<void> {
  await addSpecialItemCategory(page, "ドラッグ");
  await drugsSection
    .resolve(page)
    .getByRole("button", {
      exact: true,
      name: `ドラッグ${row}：ドラッグを選択`,
    })
    .click();
  await expect(
    page.getByRole("dialog", { name: "ドラッグを選択" }),
  ).toBeVisible();
}

async function selectDrug(
  page: Page,
  row = 1,
  name = "マッスルドラッグ",
): Promise<void> {
  await openDrugsPicker(page, row);
  const picker = page.getByRole("dialog", { name: "ドラッグを選択" });
  await picker.getByRole("button", { exact: true, name }).click();
  await expect(picker).toBeHidden();
}

async function selectOption(locator: Locator, value: string): Promise<void> {
  await expect(async () => {
    await locator.selectOption(value);
    await expect(locator).toHaveValue(value);
  }).toPass();
}

async function addSpecialItemCategory(page: Page, name: string): Promise<void> {
  const button = page.getByRole("button", {
    exact: true,
    name: `${name}を追加`,
  });
  if (await button.isVisible()) {
    await button.click();
  }
}

async function selectPrimaryRyugi(page: Page): Promise<void> {
  const primaryRyugi = page.locator("[data-build-section] select").first();
  await selectOption(primaryRyugi, "kenkaya");
}

async function selectSumi(page: Page): Promise<void> {
  await selectOption(
    page.locator("[data-build-section] select").nth(1),
    "sumi",
  );
}

async function openPrimarySkillPicker(page: Page): Promise<void> {
  await selectPrimaryRyugi(page);
  await primarySkills
    .resolve(page)
    .getByRole("button", { exact: true, name: "未選択スキル1" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "プライマリ流儀スキルを選択" }),
  ).toBeVisible();
}

async function selectPrimarySkill(page: Page): Promise<void> {
  await openPrimarySkillPicker(page);
  const picker = page.getByRole("dialog", {
    name: "プライマリ流儀スキルを選択",
  });
  await picker.getByRole("button", { name: /旋風/ }).click();
  await expect(picker).toBeHidden();
}

async function openPrimarySkillsSummaryTooltip(page: Page): Promise<void> {
  await selectPrimarySkill(page);
  await openTooltip(page, "取得合計レベル：1／流儀レベル：1");
}

async function preparePrimarySkillsTotalError(page: Page): Promise<void> {
  await selectPrimarySkill(page);
  await primarySkills
    .resolve(page)
    .getByRole("button", { exact: true, name: "未選択スキル2" })
    .click();
  const picker = page.getByRole("dialog", {
    name: "プライマリ流儀スキルを選択",
  });
  await picker.getByRole("button", { exact: true, name: "一閃" }).click();
  await expect(picker).toBeHidden();
}

async function selectLongIkizamaSkill(page: Page): Promise<void> {
  await page.getByLabel("生き様Lv", { exact: true }).fill("4");
  await selectOption(
    page.locator("[data-build-section] select").nth(1),
    "burai",
  );
  await ikizamaSkills
    .resolve(page)
    .getByRole("button", { exact: true, name: "未選択スキル1" })
    .click();
  const picker = page.getByRole("dialog", { name: "生き様スキルを選択" });
  await picker
    .getByRole("button", { name: /帰還不能地点/ })
    .first()
    .click();
  await expect(picker).toBeHidden();
}

async function openIkizamaSkillsSummaryTooltip(page: Page): Promise<void> {
  await selectLongIkizamaSkill(page);
  await openTooltip(page, "取得合計レベル：1／生き様レベル：4");
}

async function prepareIkizamaSkillsTotalError(page: Page): Promise<void> {
  await openIkizamaSkillPicker(page);
  const picker = page.getByRole("dialog", { name: "生き様スキルを選択" });
  await picker.getByRole("button", { exact: true, name: "超常発露" }).click();
  await expect(picker).toBeHidden();
  await ikizamaSkills
    .resolve(page)
    .getByRole("button", { exact: true, name: "未選択スキル2" })
    .click();
  await picker.getByRole("button", { exact: true, name: "装備の達人" }).click();
  await expect(picker).toBeHidden();
}

async function openIkizamaSkillPicker(page: Page): Promise<void> {
  await selectOption(
    page.locator("[data-build-section] select").nth(1),
    "burai",
  );
  await ikizamaSkills
    .resolve(page)
    .getByRole("button", { exact: true, name: "未選択スキル1" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "生き様スキルを選択" }),
  ).toBeVisible();
}

async function openCommonSkillPicker(page: Page): Promise<void> {
  await commonSkills
    .resolve(page)
    .getByRole("button", { exact: true, name: "共通スキル未選択スキル1" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "共通スキルを選択" }),
  ).toBeVisible();
}

async function openBasicCommonSkillPicker(page: Page): Promise<void> {
  await openCommonSkillPicker(page);
  await expect(
    page
      .getByRole("dialog", { name: "共通スキルを選択" })
      .getByRole("button", { exact: true, name: "裏社会の繋がり" }),
  ).toHaveCount(0);
}

async function openAdvancedCommonSkillPicker(page: Page): Promise<void> {
  await page.getByLabel("プライマリ流儀Lv", { exact: true }).fill("11");
  await openCommonSkillPicker(page);
  await page
    .getByRole("dialog", { name: "共通スキルを選択" })
    .getByRole("button", { exact: true, name: "裏社会の繋がり" })
    .scrollIntoViewIfNeeded();
}

async function selectCommonSkill(page: Page): Promise<void> {
  await openCommonSkillPicker(page);
  const picker = page.getByRole("dialog", { name: "共通スキルを選択" });
  await picker.getByRole("button", { exact: true, name: "基本の連撃" }).click();
  await expect(picker).toBeHidden();
}

async function openCommonSkillsSummaryTooltip(page: Page): Promise<void> {
  await selectCommonSkill(page);
  await openTooltip(page, "取得合計レベル：1／合計レベル上限：1");
}

async function addOtherRyugi(page: Page): Promise<void> {
  await page.getByRole("button", { name: "＋ その他流儀を追加" }).click();
  await selectOption(
    page.getByRole("combobox", { name: "その他流儀1", exact: true }),
    "kenkaya",
  );
  await page
    .getByRole("spinbutton", { name: "その他流儀1Lv", exact: true })
    .fill("1");
}

async function addUnselectedOtherRyugi(page: Page): Promise<void> {
  await page.getByRole("button", { name: "＋ その他流儀を追加" }).click();
}

async function openOtherRyugiSkillPicker(page: Page): Promise<void> {
  await addOtherRyugi(page);
  await otherRyugiSkills
    .resolve(page)
    .getByRole("button", { exact: true, name: "未選択スキル1" })
    .click();
  await expect(
    page.getByRole("dialog", { name: "その他流儀スキルを選択" }),
  ).toBeVisible();
}

async function selectOtherRyugiSkill(page: Page): Promise<void> {
  await openOtherRyugiSkillPicker(page);
  const picker = page.getByRole("dialog", { name: "その他流儀スキルを選択" });
  await picker.getByRole("button", { exact: true, name: "旋風" }).click();
  await expect(picker).toBeHidden();
}

async function prepareOtherRyugiSkillsTotalError(page: Page): Promise<void> {
  await selectOtherRyugiSkill(page);
  const section = otherRyugiSkills.resolve(page);
  await section
    .getByRole("button", { exact: true, name: "＋ スキルを追加" })
    .click();
  await section
    .getByRole("button", { exact: true, name: "未選択スキル2" })
    .click();
  const picker = page.getByRole("dialog", { name: "その他流儀スキルを選択" });
  await picker.getByRole("button", { exact: true, name: "一閃" }).click();
  await expect(picker).toBeHidden();
}

async function openActionMenu(
  page: Page,
  errorStatusText = "エラーはありません。",
): Promise<void> {
  await page
    .getByRole("button", {
      exact: true,
      name: `操作メニューを開く、${errorStatusText}`,
    })
    .click();
  await expect(
    page.getByRole("region", { name: "キャラクターシートの操作メニュー" }),
  ).toBeVisible();
}

async function openCharacterSheetSiteMenu(page: Page): Promise<void> {
  await page.locator("[data-character-sheet-menu-open]:visible").click();
  await expect(page.locator("#character-sheet-site-menu-drawer")).toBeVisible();
}

async function openErrorDialog(page: Page): Promise<void> {
  await prepareRepresentativeErrors(page);
  await page.getByRole("button", { exact: true, name: "確認" }).click();
  await expect(page.getByRole("dialog", { name: "エラー" })).toBeVisible();
}

async function openEmptyErrorDialog(page: Page): Promise<void> {
  await page.getByRole("button", { exact: true, name: "確認" }).click();
  await expect(page.getByRole("dialog", { name: "エラー" })).toBeVisible();
}

async function openHelpDialog(page: Page): Promise<void> {
  await page.getByRole("button", { exact: true, name: "ヘルプ" }).click();
  await expect(page.getByRole("dialog", { name: "ヘルプ" })).toBeVisible();
}

async function scrollHelpDialog(
  page: Page,
  position: "middle" | "end",
): Promise<void> {
  await openHelpDialog(page);
  const content = page
    .getByRole("dialog", { name: "ヘルプ" })
    .locator("header + div");

  await content.evaluate((element, scrollPosition) => {
    const maximumScrollTop = element.scrollHeight - element.clientHeight;
    element.scrollTop =
      scrollPosition === "middle"
        ? Math.round(maximumScrollTop / 2)
        : maximumScrollTop;
  }, position);
}

async function openErrorActionMenu(page: Page): Promise<void> {
  await prepareRepresentativeErrors(page);
  await openActionMenu(page, "エラーが2件あります。");
}

const section = (selector: string) => ({
  resolve: (page: Page) => page.locator(selector),
});
const sectionFrame = (heading: string) => ({
  resolve: (page: Page) =>
    page.getByRole("heading", { exact: true, name: heading }).locator(".."),
});
const dialog = (name: string) => ({
  resolve: (page: Page) => page.getByRole("dialog", { name }),
});

const profileSection = section('[data-character-sheet-section-slot="profile"]');
const buildSection = section('[data-character-sheet-section-slot="build"]');
const secondaryAttributesSection = section(
  '[data-character-sheet-section-slot="secondary"]',
);
const bondsSection = sectionFrame("縁");
const combatSection = sectionFrame("判定");
const skillsSection = sectionFrame("スキル");
const weaponsAndArmorSection = sectionFrame("武器・防具");
const specialItemsSection = sectionFrame("生き様専用アイテム");
const noncombatChecks = section(
  'section[aria-labelledby="noncombat-checks-heading"]',
);
const primarySkills = section(
  "[data-primary-skills-section] section[data-skill-section]",
);
const ikizamaSkills = section(
  "[data-ikizama-skills-section] section[data-skill-section]",
);
const commonSkills = {
  resolve: (page: Page) =>
    page.locator("section[data-skill-section]").filter({
      has: page.getByRole("heading", { exact: true, name: "共通スキル" }),
    }),
};
const otherRyugiSkills = {
  resolve: (page: Page) =>
    page.getByRole("region", { name: "その他流儀スキル1" }),
};
const omamoriSection = section('[data-special-item-category="omamori"]');
const cyberneticsSection = section(
  '[data-special-item-category="cybernetics"]',
);
const nanomachinesSection = section("[data-nanomachines-section]");
const drugsSection = section('[data-special-item-category="drugs"]');
const actionPane = section('[aria-label="キャラクターシートの操作"]');
const actionControls = section("[data-character-sheet-action-controls]");
const actionMenu = {
  resolve: (page: Page) =>
    page.getByRole("region", { name: "キャラクターシートの操作メニュー" }),
};
const characterSheetSiteMenuDrawer = section(
  "#character-sheet-site-menu-drawer",
);

registerCharacterSheetVrtScenarios([
  {
    id: "default",
    kind: "full-page",
    route: siteRoutes.characterSheet,
  },
  {
    id: "tooltip-representative",
    kind: "full-page",
    prepare: (page) => openTooltip(page, "合計信用"),
    route: siteRoutes.characterSheet,
  },
  {
    id: "action-pane-desktop",
    kind: "section",
    locator: actionPane,
    route: siteRoutes.characterSheet,
    viewports: ["desktop"],
  },
  {
    id: "action-controls",
    kind: "section",
    locator: actionControls,
    route: siteRoutes.characterSheet,
    viewports: ["tablet", "mobile"],
  },
  {
    id: "action-menu-open",
    kind: "section",
    locator: actionMenu,
    prepare: openActionMenu,
    route: siteRoutes.characterSheet,
    viewports: ["tablet", "mobile"],
  },
  {
    id: "site-menu-open",
    kind: "section",
    locator: characterSheetSiteMenuDrawer,
    prepare: openCharacterSheetSiteMenu,
    route: siteRoutes.characterSheet,
    viewports: characterSheetMobileViewport,
  },
  {
    id: "action-pane-error",
    kind: "section",
    locator: actionPane,
    prepare: prepareRepresentativeErrors,
    route: siteRoutes.characterSheet,
    viewports: ["desktop"],
  },
  {
    id: "action-controls-error",
    kind: "section",
    locator: actionControls,
    prepare: prepareRepresentativeErrors,
    route: siteRoutes.characterSheet,
    viewports: ["tablet", "mobile"],
  },
  {
    id: "action-menu-error",
    kind: "section",
    locator: actionMenu,
    prepare: openErrorActionMenu,
    route: siteRoutes.characterSheet,
    viewports: ["tablet", "mobile"],
  },
  {
    id: "error-dialog",
    kind: "dialog",
    locator: dialog("エラー"),
    prepare: openErrorDialog,
    route: siteRoutes.characterSheet,
    viewports: ["desktop"],
  },
  {
    id: "error-dialog-empty",
    kind: "dialog",
    locator: dialog("エラー"),
    prepare: openEmptyErrorDialog,
    route: siteRoutes.characterSheet,
    viewports: ["desktop"],
  },
  {
    id: "help-dialog",
    kind: "dialog",
    locator: dialog("ヘルプ"),
    prepare: openHelpDialog,
    route: siteRoutes.characterSheet,
  },
  {
    id: "help-dialog-middle",
    kind: "dialog",
    locator: dialog("ヘルプ"),
    prepare: (page) => scrollHelpDialog(page, "middle"),
    route: siteRoutes.characterSheet,
  },
  {
    id: "help-dialog-end",
    kind: "dialog",
    locator: dialog("ヘルプ"),
    prepare: (page) => scrollHelpDialog(page, "end"),
    route: siteRoutes.characterSheet,
  },
  {
    id: "reset-confirm",
    kind: "dialog",
    locator: dialog("下書き破棄"),
    prepare: openResetConfirm,
    route: siteRoutes.characterSheet,
  },
  {
    id: "ccfolia-copy-confirm",
    kind: "dialog",
    locator: dialog("CCFOLIAコピー"),
    prepare: openCcfoliaCopyConfirm,
    route: siteRoutes.characterSheet,
  },
  {
    id: "profile-default",
    kind: "section",
    locator: profileSection,
    route: siteRoutes.characterSheet,
  },
  {
    id: "profile-image-selected",
    kind: "section",
    locator: profileSection,
    prepare: selectCharacterImage,
    route: siteRoutes.characterSheet,
  },
  {
    id: "build-default",
    kind: "section",
    locator: buildSection,
    route: siteRoutes.characterSheet,
  },
  {
    id: "build-primary-ryugi-selected",
    kind: "section",
    locator: buildSection,
    prepare: selectPrimaryRyugi,
    route: siteRoutes.characterSheet,
  },
  {
    id: "bonds-default",
    kind: "section",
    locator: bondsSection,
    route: siteRoutes.characterSheet,
  },
  {
    id: "bonds-input",
    kind: "section",
    locator: bondsSection,
    prepare: async (page) => {
      await fillBond(page, 1, "アキラ");
      const resolve = page.getByLabel("縁1の覚悟", { exact: true });
      await resolve.focus();
      await resolve.press("Space");
      await expect(resolve).toBeChecked();
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "bonds-error",
    kind: "section",
    locator: bondsSection,
    prepare: prepareBondLimitError,
    route: siteRoutes.characterSheet,
  },
  {
    id: "combat-default",
    kind: "section",
    locator: combatSection,
    route: siteRoutes.characterSheet,
  },
  {
    id: "combat-input",
    kind: "section",
    locator: combatSection,
    prepare: addAttack,
    route: siteRoutes.characterSheet,
  },
  {
    id: "noncombat-input",
    kind: "section",
    locator: noncombatChecks,
    prepare: async (page) => {
      await page
        .getByRole("button", { exact: true, name: "非戦闘技能を開閉" })
        .click();
      await page.getByLabel("脅迫を得意技能にする").check();
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "primary-skills-input",
    kind: "section",
    locator: primarySkills,
    prepare: selectPrimarySkill,
    route: siteRoutes.characterSheet,
  },
  {
    id: "primary-skills-tooltip",
    kind: "full-page",
    prepare: openPrimarySkillsSummaryTooltip,
    route: siteRoutes.characterSheet,
  },
  {
    id: "primary-skills-unavailable",
    kind: "section",
    locator: primarySkills,
    route: siteRoutes.characterSheet,
  },
  {
    id: "primary-skills-error",
    kind: "section",
    locator: primarySkills,
    prepare: async (page) => {
      await selectPrimarySkill(page);
      await page.getByLabel("プライマリ流儀Lv", { exact: true }).fill("9");
      await page.getByLabel("旋風Lv", { exact: true }).fill("9");
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "primary-skills-total-error",
    kind: "section",
    locator: primarySkills,
    prepare: preparePrimarySkillsTotalError,
    route: siteRoutes.characterSheet,
  },
  {
    id: "ikizama-skills-input",
    kind: "section",
    locator: ikizamaSkills,
    prepare: selectLongIkizamaSkill,
    route: siteRoutes.characterSheet,
  },
  {
    id: "ikizama-skills-tooltip",
    kind: "full-page",
    prepare: openIkizamaSkillsSummaryTooltip,
    route: siteRoutes.characterSheet,
  },
  {
    id: "ikizama-skills-unavailable",
    kind: "section",
    locator: ikizamaSkills,
    route: siteRoutes.characterSheet,
  },
  {
    id: "ikizama-skills-error",
    kind: "section",
    locator: ikizamaSkills,
    prepare: async (page) => {
      await selectLongIkizamaSkill(page);
      await page.getByLabel("生き様Lv", { exact: true }).fill("20");
      const levels = ikizamaSkills.resolve(page).locator("input[type=number]");
      await levels.nth(0).fill("9");
      await levels.nth(1).fill("9");
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "ikizama-skills-total-error",
    kind: "section",
    locator: ikizamaSkills,
    prepare: prepareIkizamaSkillsTotalError,
    route: siteRoutes.characterSheet,
  },
  {
    id: "common-skills-default",
    kind: "section",
    locator: commonSkills,
    route: siteRoutes.characterSheet,
  },
  {
    id: "common-skills-input",
    kind: "section",
    locator: commonSkills,
    prepare: selectCommonSkill,
    route: siteRoutes.characterSheet,
  },
  {
    id: "common-skills-tooltip",
    kind: "full-page",
    prepare: openCommonSkillsSummaryTooltip,
    route: siteRoutes.characterSheet,
  },
  {
    id: "common-skills-error",
    kind: "section",
    locator: commonSkills,
    prepare: async (page) => {
      await selectCommonSkill(page);
      await page.getByLabel("基本の連撃Lv", { exact: true }).fill("2");
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "other-ryugi-skills-input",
    kind: "section",
    locator: otherRyugiSkills,
    prepare: selectOtherRyugiSkill,
    route: siteRoutes.characterSheet,
  },
  {
    id: "other-ryugi-skills-unavailable",
    kind: "section",
    locator: otherRyugiSkills,
    prepare: addUnselectedOtherRyugi,
    route: siteRoutes.characterSheet,
  },
  {
    id: "other-ryugi-skills-error",
    kind: "section",
    locator: otherRyugiSkills,
    prepare: async (page) => {
      await selectOtherRyugiSkill(page);
      await page.getByLabel("その他流儀1Lv", { exact: true }).fill("9");
      await otherRyugiSkills
        .resolve(page)
        .getByLabel("旋風Lv", { exact: true })
        .fill("2");
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "other-ryugi-skills-total-error",
    kind: "section",
    locator: otherRyugiSkills,
    prepare: prepareOtherRyugiSkillsTotalError,
    route: siteRoutes.characterSheet,
  },
  {
    id: "skills-overview",
    kind: "section",
    locator: skillsSection,
    route: siteRoutes.characterSheet,
  },
  {
    id: "weapons-and-armor-default",
    kind: "section",
    locator: weaponsAndArmorSection,
    route: siteRoutes.characterSheet,
  },
  {
    id: "weapons-and-armor-input",
    kind: "section",
    locator: weaponsAndArmorSection,
    prepare: selectWeapon,
    route: siteRoutes.characterSheet,
  },
  {
    id: "omamori-default",
    kind: "section",
    locator: omamoriSection,
    prepare: (page) => addSpecialItemCategory(page, "お守り"),
    route: siteRoutes.characterSheet,
  },
  {
    id: "omamori-input",
    kind: "section",
    locator: omamoriSection,
    prepare: selectOmamori,
    route: siteRoutes.characterSheet,
  },
  {
    id: "omamori-mobile-effect",
    kind: "section",
    locator: omamoriSection,
    prepare: async (page) => {
      await selectOmamori(page);
      await page
        .getByRole("button", {
          exact: true,
          name: "お守り1：活気のお守り効果を開く",
        })
        .click();
    },
    route: siteRoutes.characterSheet,
    viewports: characterSheetMobileViewport,
  },
  {
    id: "cybernetics-default",
    kind: "section",
    locator: cyberneticsSection,
    prepare: (page) => addSpecialItemCategory(page, "サイバネ"),
    route: siteRoutes.characterSheet,
  },
  {
    id: "cybernetics-input",
    kind: "section",
    locator: cyberneticsSection,
    prepare: selectCybernetic,
    route: siteRoutes.characterSheet,
  },
  {
    id: "cybernetics-error",
    kind: "section",
    locator: cyberneticsSection,
    prepare: async (page) => {
      await selectCybernetic(page);
      await cyberneticsSection
        .resolve(page)
        .getByLabel("埋め込み点数合計の修正", { exact: true })
        .first()
        .fill("20");
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "cybernetics-part-error",
    kind: "section",
    locator: cyberneticsSection,
    prepare: restoreFixedCyberneticPartMismatch,
    route: siteRoutes.characterSheet,
  },
  {
    id: "nanomachines-default",
    kind: "section",
    locator: nanomachinesSection,
    prepare: (page) => addSpecialItemCategory(page, "ナノマシン"),
    route: siteRoutes.characterSheet,
  },
  {
    id: "nanomachines-input",
    kind: "section",
    locator: nanomachinesSection,
    prepare: selectNanomachine,
    route: siteRoutes.characterSheet,
  },
  {
    id: "nanomachines-expanded",
    kind: "section",
    locator: nanomachinesSection,
    prepare: async (page) => {
      await selectNanomachine(page);
      await nanomachinesSection
        .resolve(page)
        .getByRole("button", {
          exact: true,
          name: "頭：マシラ効果を開く",
        })
        .click();
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "nanomachines-error",
    kind: "section",
    locator: nanomachinesSection,
    prepare: async (page) => {
      await selectPrimaryRyugi(page);
      await selectOption(
        page.locator("[data-build-section] select").nth(1),
        "burai",
      );
      await selectNanomachine(page);
      await nanomachinesSection
        .resolve(page)
        .getByLabel("埋め込み点数合計の修正", { exact: true })
        .fill("20");
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "drugs-default",
    kind: "section",
    locator: drugsSection,
    prepare: (page) => addSpecialItemCategory(page, "ドラッグ"),
    route: siteRoutes.characterSheet,
  },
  {
    id: "drugs-input",
    kind: "section",
    locator: drugsSection,
    prepare: async (page) => {
      await selectDrug(page);
      await drugsSection
        .resolve(page)
        .getByLabel("ドラッグ1：マッスルドラッグ所持数", { exact: true })
        .fill("2");
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "drugs-expanded",
    kind: "section",
    locator: drugsSection,
    prepare: async (page) => {
      await selectDrug(page);
      await drugsSection
        .resolve(page)
        .getByRole("button", {
          exact: true,
          name: "ドラッグ1：マッスルドラッグ効果を開く",
        })
        .click();
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "special-items-overview",
    kind: "section",
    locator: specialItemsSection,
    route: siteRoutes.characterSheet,
  },
  {
    id: "g22-special-items-unselected",
    kind: "section",
    locator: specialItemsSection,
    route: siteRoutes.characterSheet,
  },
  {
    id: "g22-special-items-unselected-added",
    kind: "section",
    locator: specialItemsSection,
    prepare: (page) => addSpecialItemCategory(page, "お守り"),
    route: siteRoutes.characterSheet,
  },
  {
    id: "g22-special-items-sumi-exclusive",
    kind: "section",
    locator: specialItemsSection,
    prepare: selectSumi,
    route: siteRoutes.characterSheet,
  },
  {
    id: "g22-special-items-warning",
    kind: "section",
    locator: specialItemsSection,
    prepare: async (page) => {
      await selectSumi(page);
      await addSpecialItemCategory(page, "お守り");
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "g22-special-items-ikizama-changed",
    kind: "section",
    locator: specialItemsSection,
    prepare: async (page) => {
      await addSpecialItemCategory(page, "お守り");
      await selectSumi(page);
      await selectOption(
        page.locator("[data-build-section] select").nth(1),
        "burai",
      );
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "g22-credit-overage",
    kind: "section",
    locator: profileSection,
    prepare: async (page) => {
      await page.getByLabel("取得信用", { exact: true }).fill("0");
      await selectOmamori(page);
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "g22-sumi-maximum-health",
    kind: "section",
    locator: secondaryAttributesSection,
    prepare: async (page) => {
      await selectPrimaryRyugi(page);
      await selectSumi(page);
      await selectNanomachine(page);
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "g22-special-items-remove-confirm",
    kind: "dialog",
    locator: dialog("お守りカテゴリを削除"),
    prepare: async (page) => {
      await selectOmamori(page);
      await page
        .getByRole("button", { exact: true, name: "お守りカテゴリを削除" })
        .click();
      await expect(
        page.getByRole("dialog", { name: "お守りカテゴリを削除" }),
      ).toBeVisible();
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "weapon-picker",
    kind: "dialog",
    locator: dialog("武器を選択"),
    prepare: openWeaponPicker,
    route: siteRoutes.characterSheet,
  },
  {
    id: "armor-picker",
    kind: "dialog",
    locator: dialog("防具を選択"),
    prepare: openArmorPicker,
    route: siteRoutes.characterSheet,
  },
  {
    id: "omamori-picker",
    kind: "dialog",
    locator: dialog("お守りを選択"),
    prepare: openOmamoriPicker,
    route: siteRoutes.characterSheet,
  },
  {
    id: "cybernetics-picker",
    kind: "dialog",
    locator: dialog("サイバネを選択"),
    prepare: openCyberneticsPicker,
    route: siteRoutes.characterSheet,
  },
  {
    id: "nanomachines-picker",
    kind: "dialog",
    locator: dialog("ナノマシンを選択"),
    prepare: openNanomachinePicker,
    route: siteRoutes.characterSheet,
  },
  {
    id: "drugs-picker",
    kind: "dialog",
    locator: dialog("ドラッグを選択"),
    prepare: openDrugsPicker,
    route: siteRoutes.characterSheet,
  },
  {
    id: "drugs-picker-duplicate",
    kind: "dialog",
    locator: dialog("ドラッグを選択"),
    prepare: async (page) => {
      await selectDrug(page);
      await openDrugsPicker(page, 2);
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "primary-skill-picker",
    kind: "dialog",
    locator: dialog("プライマリ流儀スキルを選択"),
    prepare: openPrimarySkillPicker,
    route: siteRoutes.characterSheet,
  },
  {
    id: "ikizama-skill-picker",
    kind: "dialog",
    locator: dialog("生き様スキルを選択"),
    prepare: openIkizamaSkillPicker,
    route: siteRoutes.characterSheet,
  },
  {
    id: "common-skill-picker",
    kind: "dialog",
    locator: dialog("共通スキルを選択"),
    prepare: openBasicCommonSkillPicker,
    route: siteRoutes.characterSheet,
  },
  {
    id: "common-skill-advanced-picker",
    kind: "dialog",
    locator: dialog("共通スキルを選択"),
    prepare: openAdvancedCommonSkillPicker,
    route: siteRoutes.characterSheet,
  },
  {
    id: "other-ryugi-skill-picker",
    kind: "dialog",
    locator: dialog("その他流儀スキルを選択"),
    prepare: openOtherRyugiSkillPicker,
    route: siteRoutes.characterSheet,
  },
  {
    id: "primary-ryugi-change-confirm",
    kind: "dialog",
    locator: dialog("プライマリ流儀の変更確認"),
    prepare: async (page) => {
      await selectPrimarySkill(page);
      const confirmation = page.getByRole("dialog", {
        name: "プライマリ流儀の変更確認",
      });
      await expect(async () => {
        await page
          .locator("[data-build-section] select")
          .first()
          .selectOption("emono");
        await expect(confirmation).toBeVisible();
      }).toPass();
    },
    route: siteRoutes.characterSheet,
  },
  {
    id: "other-ryugi-remove-confirm",
    kind: "dialog",
    locator: dialog("その他流儀の削除確認"),
    prepare: async (page) => {
      await selectOtherRyugiSkill(page);
      await page.getByRole("button", { name: "その他流儀1を削除" }).click();
      await expect(
        page.getByRole("dialog", { name: "その他流儀の削除確認" }),
      ).toBeVisible();
    },
    route: siteRoutes.characterSheet,
  },
]);

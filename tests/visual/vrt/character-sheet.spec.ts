import { expect, type Page } from "@playwright/test";
import { visualRoutes } from "../config";
import { registerVrtScenarios } from "../helpers/vrt";

async function openTooltip(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { exact: true, name }).hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
}

async function openCommonSkillLimitTooltip(page: Page): Promise<void> {
  await expect(async () => {
    await page
      .getByRole("button", {
        exact: true,
        name: "共通スキルレベル合計／共通スキル上限",
      })
      .click();
    await expect(page.getByRole("tooltip")).toBeVisible();
  }).toPass();
}

async function fillBond(page: Page, row: number, value: string): Promise<void> {
  await page.getByLabel(`縁${row}の対象`, { exact: true }).fill(value);
}

async function addAttack(page: Page): Promise<void> {
  await page.getByRole("button", { name: "＋ 攻撃を追加" }).click();
  await expect(page.getByLabel("攻撃2の技能", { exact: true })).toBeVisible();
}

async function openChecksTooltip(page: Page): Promise<void> {
  await page
    .getByRole("button", { exact: true, name: "攻撃の判定数の説明" })
    .hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
}

async function openWeaponPicker(page: Page): Promise<void> {
  const weapons = page.getByRole("region", { exact: true, name: "武器" });

  await weapons.getByRole("button", { name: /^武器\d+：武器を選択$/ }).click();
  await expect(
    page.getByRole("dialog", { exact: true, name: "武器を選択" }),
  ).toBeVisible();
}

async function selectWeapon(page: Page, weaponName = "刀"): Promise<void> {
  await openWeaponPicker(page);
  const picker = page.getByRole("dialog", {
    exact: true,
    name: "武器を選択",
  });

  await picker.getByRole("button", { exact: true, name: weaponName }).click();
  await expect(picker).toBeHidden();
}

async function openArmorPicker(page: Page): Promise<void> {
  const armor = page.getByRole("region", { exact: true, name: "防具" });

  await armor.getByRole("button", { exact: true, name: "防具を選択" }).click();
  await expect(
    page.getByRole("dialog", { exact: true, name: "防具を選択" }),
  ).toBeVisible();
}

async function selectArmor(
  page: Page,
  armorName = "チンピラ服",
): Promise<void> {
  await openArmorPicker(page);
  const picker = page.getByRole("dialog", {
    exact: true,
    name: "防具を選択",
  });

  await picker.getByRole("button", { exact: true, name: armorName }).click();
  await expect(picker).toBeHidden();
}

async function openWeaponsTooltip(page: Page): Promise<void> {
  await page
    .getByRole("region", { exact: true, name: "武器" })
    .getByRole("button", { exact: true, name: "攻撃力／ガード値" })
    .hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
}

async function openNoncombatChecks(page: Page): Promise<void> {
  const favorite = page.getByLabel("脅迫を得意技能にする");

  await expect(async () => {
    if (!(await favorite.isVisible())) {
      await page
        .getByRole("button", { exact: true, name: "非戦闘技能を開閉" })
        .click();
    }
    await expect(favorite).toBeVisible();
  }).toPass();
}

async function selectNoncombatFavorite(page: Page): Promise<void> {
  await openNoncombatChecks(page);
  await page.getByLabel("脅迫を得意技能にする").check();
  await page
    .getByRole("button", { exact: true, name: "非戦闘技能を開閉" })
    .click();
}

async function selectPrimaryRyugi(page: Page): Promise<void> {
  const primaryRyugi = page.locator("[data-build-section] select").first();

  await primaryRyugi.selectOption("kenkaya");
  await expect(primaryRyugi).toHaveValue("kenkaya");
  await expect(
    page.getByRole("button", { exact: true, name: "気合十分の詳細を開く" }),
  ).toBeVisible();
}

async function selectPrimarySkill(page: Page): Promise<void> {
  await selectPrimaryRyugi(page);
  await page
    .locator("[data-primary-skills-section]")
    .getByRole("button", { exact: true, name: "未選択スキル1" })
    .click();
  const picker = page.getByRole("dialog", {
    name: "プライマリ流儀スキルを選択",
  });
  await expect(picker).toBeVisible();
  await picker.getByRole("button", { name: /旋風/ }).click();
  await expect(picker).toBeHidden();
}

async function selectPrimaryAdvancedSkill(page: Page): Promise<void> {
  await selectPrimaryRyugi(page);
  await page.getByLabel("プライマリ流儀Lv", { exact: true }).fill("6");
  await page
    .locator("[data-primary-skills-section]")
    .getByRole("button", { exact: true, name: "未選択スキル1" })
    .click();
  const picker = page.getByRole("dialog", {
    name: "プライマリ流儀スキルを選択",
  });

  await expect(picker).toBeVisible();
  await picker
    .getByRole("button", { exact: true, name: "受け流し強化" })
    .click();
  await expect(picker).toBeHidden();
}

async function selectLongIkizamaSkill(page: Page): Promise<void> {
  const ikizama = page.locator("[data-build-section] select").nth(1);

  await page.getByLabel("生き様Lv", { exact: true }).fill("4");
  await ikizama.selectOption("burai");
  await page
    .locator("[data-ikizama-skills-section]")
    .getByRole("button", { exact: true, name: "未選択スキル1" })
    .click();
  const picker = page.getByRole("dialog", { name: "生き様スキルを選択" });

  await picker
    .getByRole("button", { name: /帰還不能地点/ })
    .first()
    .click();
  await expect(picker).toBeHidden();
}

async function openCommonSkillPicker(page: Page, row = 1): Promise<void> {
  const commonSkills = page.getByRole("region", { name: "共通スキル" });

  await expect(async () => {
    await commonSkills
      .getByRole("button", {
        exact: true,
        name: `共通スキル未選択スキル${row}`,
      })
      .click();
    await expect(
      page.getByRole("dialog", { name: "共通スキルを選択" }),
    ).toBeVisible();
  }).toPass();
}

async function selectCommonSkill(
  page: Page,
  row = 1,
  skillName = "基本の連撃",
): Promise<void> {
  await openCommonSkillPicker(page, row);
  const picker = page.getByRole("dialog", { name: "共通スキルを選択" });

  await picker.getByRole("button", { exact: true, name: skillName }).click();
  await expect(picker).toBeHidden();
}

async function selectCommonSkillBonusLevel(
  page: Page,
  commonSkillLevel: 2 | 5 | 9,
): Promise<void> {
  await selectPrimaryRyugi(page);
  await page.getByLabel("プライマリ流儀Lv", { exact: true }).fill("9");
  await page.getByLabel("生き様Lv", { exact: true }).fill("9");
  await selectCommonSkill(page, 1, "基本の連撃");
  await page.getByLabel("基本の連撃Lv", { exact: true }).fill("3");

  if (commonSkillLevel <= 3) {
    await page
      .getByLabel("基本の連撃Lv", { exact: true })
      .fill(String(commonSkillLevel));
    return;
  }

  await selectCommonSkill(page, 2, "血流操作");
  await page
    .getByLabel("血流操作Lv", { exact: true })
    .fill(String(Math.min(commonSkillLevel - 3, 3)));

  if (commonSkillLevel <= 6) {
    return;
  }

  await page
    .getByRole("region", { name: "共通スキル" })
    .getByRole("button", { exact: true, name: "＋ スキルを追加" })
    .click();
  await selectCommonSkill(page, 3, "心血融合");
  await page
    .getByLabel("心血融合Lv", { exact: true })
    .fill(String(commonSkillLevel - 6));
}

async function addOtherRyugi(
  page: Page,
  index: number,
  ryugiId: string,
): Promise<void> {
  await page.getByRole("button", { name: "＋ その他流儀を追加" }).click();
  await page
    .getByRole("combobox", { name: `その他流儀${index}`, exact: true })
    .selectOption(ryugiId);
  await page
    .getByRole("spinbutton", { name: `その他流儀${index}Lv`, exact: true })
    .fill("1");
}

async function selectOtherRyugiSkill(page: Page): Promise<void> {
  await addOtherRyugi(page, 1, "kenkaya");
  const section = page.getByRole("region", { name: "その他流儀スキル1" });

  await section
    .getByRole("button", { exact: true, name: "未選択スキル1" })
    .click();
  const picker = page.getByRole("dialog", { name: "その他流儀スキルを選択" });
  await expect(picker).toBeVisible();
  await picker.getByRole("button", { name: "旋風" }).click();
  await expect(picker).toBeHidden();
}

const noncombatChecksLocator = {
  name: "noncombat-checks",
  resolve: (page: Page) =>
    page.locator('section[aria-labelledby="noncombat-checks-heading"]'),
};

const bondsSectionLocator = {
  name: "bonds-section",
  resolve: (page: Page) =>
    page.locator('[data-character-sheet-section-slot="bonds"]'),
};

const checksSectionLocator = {
  name: "checks-section",
  resolve: (page: Page) =>
    page.locator('[data-character-sheet-section-slot="checks"]'),
};

const weaponsAndArmorSectionLocator = {
  name: "weapons-and-armor-section",
  resolve: (page: Page) => page.locator("[data-weapons-and-armor-section]"),
};

const weaponPickerLocator = {
  name: "weapon-picker",
  resolve: (page: Page) =>
    page.getByRole("dialog", { exact: true, name: "武器を選択" }),
};

const armorPickerLocator = {
  name: "armor-picker",
  resolve: (page: Page) =>
    page.getByRole("dialog", { exact: true, name: "防具を選択" }),
};

const profileSectionLocator = {
  name: "profile-section",
  resolve: (page: Page) =>
    page.locator('[data-character-sheet-section-slot="profile"]'),
};

const buildSectionLocator = {
  name: "build-section",
  resolve: (page: Page) =>
    page.locator('[data-character-sheet-section-slot="build"]'),
};

const primarySkillsLocator = {
  name: "primary-skills-section",
  resolve: (page: Page) =>
    page.locator("[data-primary-skills-section] section[data-skill-section]"),
};

const primarySkillPickerLocator = {
  name: "primary-skill-picker",
  resolve: (page: Page) =>
    page.getByRole("dialog", { name: "プライマリ流儀スキルを選択" }),
};

const primaryRyugiChangeConfirmLocator = {
  name: "primary-ryugi-change-confirm",
  resolve: (page: Page) =>
    page.getByRole("dialog", { name: "プライマリ流儀の変更確認" }),
};

const ikizamaSkillsLocator = {
  name: "ikizama-skills-section",
  resolve: (page: Page) =>
    page.locator("[data-ikizama-skills-section] section[data-skill-section]"),
};

const commonSkillsLocator = {
  name: "common-skills-section",
  resolve: (page: Page) =>
    page.locator("section[data-skill-section]").filter({
      has: page.getByRole("heading", { exact: true, name: "共通スキル" }),
    }),
};

const commonSkillPickerLocator = {
  name: "common-skill-picker",
  resolve: (page: Page) =>
    page.getByRole("dialog", { name: "共通スキルを選択" }),
};

const otherRyugiSkillsLocator = {
  name: "other-ryugi-skills-section",
  resolve: (page: Page) =>
    page.getByRole("region", { name: "その他流儀スキル1" }),
};

const otherRyugiSkillPickerLocator = {
  name: "other-ryugi-skill-picker",
  resolve: (page: Page) =>
    page.getByRole("dialog", { name: "その他流儀スキルを選択" }),
};

const otherRyugiRemoveConfirmLocator = {
  name: "other-ryugi-remove-confirm",
  resolve: (page: Page) =>
    page.getByRole("dialog", { name: "その他流儀の削除確認" }),
};

const tooltipLocator = {
  name: "tooltip",
  resolve: (page: Page) => page.getByRole("tooltip"),
};

registerVrtScenarios("character-sheet", [
  {
    id: "common-skills-default",
    locatorOnly: true,
    locators: [profileSectionLocator, buildSectionLocator, commonSkillsLocator],
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "common-skill-picker-open",
    locatorOnly: true,
    locators: [commonSkillsLocator, commonSkillPickerLocator],
    prepare: openCommonSkillPicker,
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "common-skill-limit-tooltip-open",
    locatorOnly: true,
    locators: [profileSectionLocator, tooltipLocator],
    prepare: openCommonSkillLimitTooltip,
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "common-skill-selected",
    locatorOnly: true,
    locators: [profileSectionLocator, buildSectionLocator, commonSkillsLocator],
    prepare: selectCommonSkill,
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "common-skill-level-error",
    locatorOnly: true,
    locators: [profileSectionLocator, buildSectionLocator, commonSkillsLocator],
    prepare: async (page) => {
      await selectCommonSkill(page);
      await page.getByLabel("基本の連撃Lv", { exact: true }).fill("2");
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "common-skill-maximum-level-error",
    locatorOnly: true,
    locators: [profileSectionLocator, buildSectionLocator, commonSkillsLocator],
    prepare: async (page) => {
      await selectCommonSkill(page);
      await page.getByLabel("プライマリ流儀Lv", { exact: true }).fill("9");
      await page.getByLabel("生き様Lv", { exact: true }).fill("9");
      await page.getByLabel("基本の連撃Lv", { exact: true }).fill("9");
      await expect(commonSkillsLocator.resolve(page)).not.toHaveAttribute(
        "aria-invalid",
      );
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "common-skill-bonus-level-2",
    locatorOnly: true,
    locators: [buildSectionLocator],
    prepare: async (page) => selectCommonSkillBonusLevel(page, 2),
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "common-skill-bonus-level-5",
    locatorOnly: true,
    locators: [buildSectionLocator],
    prepare: async (page) => selectCommonSkillBonusLevel(page, 5),
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "common-skill-bonus-level-9",
    locatorOnly: true,
    locators: [buildSectionLocator],
    prepare: async (page) => selectCommonSkillBonusLevel(page, 9),
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "other-ryugi-skill-selected",
    locatorOnly: true,
    locators: [otherRyugiSkillsLocator],
    prepare: selectOtherRyugiSkill,
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "other-ryugi-skills-multiple",
    locatorOnly: true,
    locators: [
      otherRyugiSkillsLocator,
      {
        name: "other-ryugi-skills-section-2",
        resolve: (page: Page) =>
          page.getByRole("region", { name: "その他流儀スキル2" }),
      },
    ],
    prepare: async (page) => {
      await addOtherRyugi(page, 1, "kenkaya");
      await addOtherRyugi(page, 2, "emono");
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "other-ryugi-skill-picker-open",
    locatorOnly: true,
    locators: [otherRyugiSkillsLocator, otherRyugiSkillPickerLocator],
    prepare: async (page) => {
      await addOtherRyugi(page, 1, "kenkaya");
      await page
        .getByRole("region", { name: "その他流儀スキル1" })
        .getByRole("button", { exact: true, name: "未選択スキル1" })
        .click();
      await expect(
        page.getByRole("dialog", { name: "その他流儀スキルを選択" }),
      ).toBeVisible();
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "other-ryugi-skill-total-error",
    locatorOnly: true,
    locators: [buildSectionLocator, otherRyugiSkillsLocator],
    prepare: async (page) => {
      await selectOtherRyugiSkill(page);
      await page.getByLabel("その他流儀1Lv", { exact: true }).fill("9");
      await page
        .getByRole("region", { name: "その他流儀スキル1" })
        .getByLabel("旋風Lv", { exact: true })
        .fill("2");
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "other-ryugi-skill-maximum-level-error",
    locatorOnly: true,
    locators: [buildSectionLocator, otherRyugiSkillsLocator],
    prepare: async (page) => {
      await selectOtherRyugiSkill(page);
      await page.getByLabel("その他流儀1Lv", { exact: true }).fill("9");
      await page
        .getByRole("region", { name: "その他流儀スキル1" })
        .getByLabel("旋風Lv", { exact: true })
        .fill("9");
      await expect(otherRyugiSkillsLocator.resolve(page)).not.toHaveAttribute(
        "aria-invalid",
      );
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "other-ryugi-remove-confirm",
    locatorOnly: true,
    locators: [
      buildSectionLocator,
      otherRyugiSkillsLocator,
      otherRyugiRemoveConfirmLocator,
    ],
    prepare: async (page) => {
      await selectOtherRyugiSkill(page);
      await page.getByRole("button", { name: "その他流儀1を削除" }).click();
      await expect(
        page.getByRole("dialog", { name: "その他流儀の削除確認" }),
      ).toBeVisible();
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "ikizama-long-skill-selected",
    locatorOnly: true,
    locators: [ikizamaSkillsLocator],
    prepare: selectLongIkizamaSkill,
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "ikizama-skill-maximum-level-error",
    locatorOnly: true,
    locators: [ikizamaSkillsLocator],
    prepare: async (page) => {
      await selectLongIkizamaSkill(page);
      await page.getByLabel("生き様Lv", { exact: true }).fill("20");
      const levels = ikizamaSkillsLocator
        .resolve(page)
        .locator("input[type=number]");
      await levels.nth(0).fill("9");
      await levels.nth(1).fill("9");
      await expect(levels.nth(0)).toHaveAttribute("aria-invalid", "true");
      await expect(levels.nth(1)).toHaveAttribute("aria-invalid", "true");
      await expect(ikizamaSkillsLocator.resolve(page)).not.toHaveAttribute(
        "aria-invalid",
      );
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "primary-skills-selected",
    locators: [primarySkillsLocator],
    prepare: selectPrimaryRyugi,
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "primary-skill-maximum-level-error",
    locatorOnly: true,
    locators: [primarySkillsLocator],
    prepare: async (page) => {
      await selectPrimarySkill(page);
      await page.getByLabel("プライマリ流儀Lv", { exact: true }).fill("9");
      await page.getByLabel("旋風Lv", { exact: true }).fill("9");
      await expect(page.getByLabel("旋風Lv", { exact: true })).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      await expect(primarySkillsLocator.resolve(page)).not.toHaveAttribute(
        "aria-invalid",
      );
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "primary-skill-advanced-error",
    locatorOnly: true,
    locators: [primarySkillsLocator],
    prepare: async (page) => {
      await selectPrimaryAdvancedSkill(page);
      await page.getByLabel("プライマリ流儀Lv", { exact: true }).fill("1");
      await expect(primarySkillsLocator.resolve(page)).toHaveAttribute(
        "aria-invalid",
        "true",
      );
      await expect(
        primarySkillsLocator
          .resolve(page)
          .locator('[data-skill-row="primary-skill-1"]'),
      ).toHaveAttribute("data-invalid", "true");
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "primary-skill-picker-open",
    locators: [primarySkillsLocator, primarySkillPickerLocator],
    prepare: async (page) => {
      await selectPrimaryRyugi(page);
      await page
        .locator("[data-primary-skills-section]")
        .getByRole("button", { exact: true, name: "未選択スキル1" })
        .click();
      await expect(
        page.getByRole("dialog", { name: "プライマリ流儀スキルを選択" }),
      ).toBeVisible();
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "primary-skill-details-expanded",
    locators: [primarySkillsLocator],
    prepare: async (page) => {
      await selectPrimaryRyugi(page);
      await page.getByRole("button", { name: "気合十分の詳細を開く" }).click();
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "primary-ryugi-change-confirm",
    locators: [primarySkillsLocator, primaryRyugiChangeConfirmLocator],
    prepare: async (page) => {
      await selectPrimarySkill(page);
      await page
        .locator("[data-build-section] select")
        .first()
        .selectOption("emono");
      await expect(
        page.getByRole("dialog", { name: "プライマリ流儀の変更確認" }),
      ).toBeVisible();
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "noncombat-expanded",
    locators: [noncombatChecksLocator],
    prepare: openNoncombatChecks,
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "noncombat-favorite-selected",
    locators: [noncombatChecksLocator],
    prepare: selectNoncombatFavorite,
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "noncombat-modifier-changed",
    locators: [noncombatChecksLocator],
    prepare: async (page) => {
      await openNoncombatChecks(page);
      await page.getByLabel("脅迫の判定修正").fill("-12");
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "noncombat-tooltip-open",
    locators: [noncombatChecksLocator, tooltipLocator],
    prepare: async (page) => {
      await expect(async () => {
        await page.getByRole("button", { name: "非戦闘技能の説明" }).click();
        await expect(page.getByRole("tooltip")).toBeVisible();
      }).toPass();
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "attack-row-added",
    locators: [checksSectionLocator],
    prepare: addAttack,
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "attack-attribute-changed",
    locators: [checksSectionLocator],
    prepare: async (page) => {
      await page
        .getByLabel("攻撃1の対応能力", { exact: true })
        .selectOption("mind");
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "checks-tooltip-open",
    locators: [checksSectionLocator, tooltipLocator],
    prepare: openChecksTooltip,
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "checks-bonds-default",
    locators: [bondsSectionLocator, checksSectionLocator],
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "ultrawide", "tablet", "mobile"],
  },
  {
    id: "weapons-and-armor-default",
    locatorOnly: true,
    locators: [weaponsAndArmorSectionLocator],
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "weapons-and-armor-multiple-weapons",
    locatorOnly: true,
    locators: [weaponsAndArmorSectionLocator],
    prepare: async (page) => {
      await selectWeapon(page);
      await page
        .getByRole("region", { exact: true, name: "武器" })
        .getByRole("button", { exact: true, name: "＋ 武器を追加" })
        .click();
      await selectWeapon(page, "バット");
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "weapon-picker-open",
    locatorOnly: true,
    locators: [weaponsAndArmorSectionLocator, weaponPickerLocator],
    prepare: openWeaponPicker,
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "weapon-details-expanded",
    locatorOnly: true,
    locators: [weaponsAndArmorSectionLocator],
    prepare: async (page) => {
      await selectWeapon(page);
      await page
        .getByRole("button", { exact: true, name: "武器1：刀詳細を開く" })
        .click();
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "armor-picker-open",
    locatorOnly: true,
    locators: [weaponsAndArmorSectionLocator, armorPickerLocator],
    prepare: openArmorPicker,
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "armor-details-expanded",
    locatorOnly: true,
    locators: [weaponsAndArmorSectionLocator],
    prepare: async (page) => {
      await selectArmor(page);
      await page
        .getByRole("button", { exact: true, name: "チンピラ服詳細を開く" })
        .click();
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "weapons-tooltip-open",
    locatorOnly: true,
    locators: [weaponsAndArmorSectionLocator, tooltipLocator],
    prepare: openWeaponsTooltip,
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "tooltip-alignment-default",
    locators: [profileSectionLocator, buildSectionLocator, bondsSectionLocator],
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "profile-tooltip-open",
    locators: [tooltipLocator, profileSectionLocator],
    prepare: (page) => openTooltip(page, "合計信用"),
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "build-tooltip-open",
    locators: [tooltipLocator, buildSectionLocator],
    prepare: (page) => openTooltip(page, "常時修正"),
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "secondary-tooltip-open",
    prepare: (page) => openTooltip(page, "最大体力"),
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "bond-resolved",
    locators: [tooltipLocator, bondsSectionLocator],
    prepare: async (page) => {
      await fillBond(page, 1, "アキラ");
      await page.getByLabel("縁1の覚悟", { exact: true }).check();
      await openTooltip(page, "覚悟の説明");
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "bond-over-limit",
    locators: [bondsSectionLocator],
    prepare: async (page) => {
      await fillBond(page, 1, "アキラ");
      await fillBond(page, 2, "ベラ");
      await page.getByLabel("縁最大数修正", { exact: true }).fill("-3");
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "ultrawide", "tablet", "mobile"],
  },
]);

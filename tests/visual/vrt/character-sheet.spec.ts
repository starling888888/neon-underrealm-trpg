import { expect, type Page } from "@playwright/test";
import { visualRoutes } from "../config";
import { registerVrtScenarios } from "../helpers/vrt";

async function openTooltip(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { exact: true, name }).hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
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

const tooltipLocator = {
  name: "tooltip",
  resolve: (page: Page) => page.getByRole("tooltip"),
};

registerVrtScenarios("character-sheet", [
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

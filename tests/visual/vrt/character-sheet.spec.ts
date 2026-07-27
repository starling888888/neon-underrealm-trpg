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

registerVrtScenarios("character-sheet", [
  {
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "ultrawide", "tablet", "mobile"],
  },
  {
    id: "profile-tooltip-open",
    prepare: (page) => openTooltip(page, "合計信用"),
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
  {
    id: "build-tooltip-open",
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
    prepare: async (page) => {
      await page.getByLabel("縁最大数修正", { exact: true }).fill("-3");
      await fillBond(page, 1, "アキラ");
      await fillBond(page, 2, "ベラ");
    },
    route: visualRoutes.characterSheet,
    viewports: ["desktop", "tablet", "mobile"],
  },
]);

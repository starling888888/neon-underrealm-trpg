import { expect, type Page } from "@playwright/test";
import { visualRoutes } from "../config";
import { registerVrtScenarios } from "../helpers/vrt";

async function openTooltip(page: Page, name: string): Promise<void> {
  await page.getByRole("button", { exact: true, name }).hover();
  await expect(page.getByRole("tooltip")).toBeVisible();
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
]);

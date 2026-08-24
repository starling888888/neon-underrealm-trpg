import { expect, type Locator, type Page, test } from "@playwright/test";
import { siteViewports } from "../support/site";

type ViewportName = keyof typeof siteViewports;

export const characterSheetViewports = ["desktop", "tablet", "mobile"] as const;
export const characterSheetMobileViewport = ["mobile"] as const;

type CharacterSheetLocator = {
  resolve: (page: Page) => Locator;
};

export type CharacterSheetVrtScenario = {
  id: string;
  kind: "dialog" | "full-page" | "section";
  locator?: CharacterSheetLocator;
  beforeGoto?: (page: Page) => Promise<void>;
  prepare?: (page: Page) => Promise<void>;
  route: string;
  viewports?: readonly ViewportName[];
};

/**
 * Registers character-sheet-specific VRT contracts.
 *
 * Static pages retain the generic full-page helper. Character sheet uses this
 * helper so section and dialog screenshots are canonical VRT baselines too.
 */
export function registerCharacterSheetVrtScenarios(
  scenarios: readonly CharacterSheetVrtScenario[],
): void {
  for (const scenario of scenarios) {
    for (const viewportName of scenario.viewports ?? characterSheetViewports) {
      test(`character-sheet ${scenario.id} @vrt @character-sheet @${scenario.kind} @${viewportName} @${scenario.id}`, async ({
        page,
      }) => {
        await page.setViewportSize(siteViewports[viewportName]);
        await scenario.beforeGoto?.(page);
        await page.goto(scenario.route);
        await expect(page.locator("body")).toBeVisible();
        await scenario.prepare?.(page);

        if (scenario.kind === "full-page") {
          await expect(page).toHaveScreenshot(
            [
              "character-sheet",
              "full-page",
              `${scenario.id}-${viewportName}.png`,
            ],
            { animations: "disabled", fullPage: true },
          );
          return;
        }

        if (scenario.locator === undefined) {
          throw new Error(`${scenario.id} requires a ${scenario.kind} locator`);
        }

        await expect(scenario.locator.resolve(page)).toHaveScreenshot(
          [
            "character-sheet",
            scenario.kind === "dialog" ? "dialogs" : "sections",
            `${scenario.id}-${viewportName}.png`,
          ],
          { animations: "disabled" },
        );
      });
    }
  }
}

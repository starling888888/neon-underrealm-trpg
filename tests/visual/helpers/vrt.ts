import { expect, type Page, test } from "@playwright/test";
import { visualViewports } from "../config";

type ViewportName = keyof typeof visualViewports;
export type VrtState =
  | "default"
  | "home-viewport"
  | "mobile-menu-open"
  | "mobile-page-toc-open"
  | "no-toc-home"
  | "no-toc-not-found"
  | "no-toc-release-notes"
  | "search-open"
  | "search-results";

export type VrtScenario = {
  fullPage?: boolean;
  route: string;
  state?: VrtState;
  viewports?: readonly ViewportName[];
};

export const allVrtViewports = ["desktop", "tablet", "mobile"] as const;
export const mobileVrtViewport = ["mobile"] as const;

export function registerVrtScenarios(
  target: string,
  scenarios: readonly VrtScenario[],
): void {
  for (const scenario of scenarios) {
    for (const viewportName of scenario.viewports ?? allVrtViewports) {
      const state = scenario.state ?? "default";

      test(`${target} ${state} @vrt @${target} @${viewportName} @${state}`, async ({
        page,
      }) => {
        await page.setViewportSize(visualViewports[viewportName]);
        await page.goto(scenario.route);
        await expect(page.locator("body")).toBeVisible();
        await prepareVrtState(page, state);

        await expect(page).toHaveScreenshot(
          [target, `${state}-${viewportName}.png`],
          {
            animations: "disabled",
            fullPage: scenario.fullPage ?? true,
          },
        );
      });
    }
  }
}

async function prepareVrtState(page: Page, state: VrtState): Promise<void> {
  if (state === "mobile-menu-open") {
    await page.locator("[data-mobile-menu-open]").click();
    await expect(page.locator("#mobile-site-menu-drawer")).toBeVisible();
    return;
  }

  if (state === "mobile-page-toc-open") {
    await page.locator("[data-mobile-page-toc-trigger]").click();
    await expect(page.locator("[data-mobile-page-toc-panel]")).toBeVisible();
    return;
  }

  if (state === "search-open" || state === "search-results") {
    const desktopInput = page.locator("[data-search-desktop-input]");
    const usesDesktopInput = await desktopInput.isVisible();
    const input = usesDesktopInput
      ? desktopInput
      : page.locator("[data-search-mobile-input]");

    if (usesDesktopInput) {
      await desktopInput.focus();
    } else {
      await page.locator("[data-search-mobile-toggle]").click();
    }

    await expect(page.locator("[data-search-panel]")).toBeVisible();

    if (state === "search-results") {
      await input.fill("基本の一撃");
      if (!usesDesktopInput) {
        await page.locator(".mobile-search-submit").click();
      }
      await expect(page.locator("[data-search-results-list]")).toBeVisible();
    }
  }
}

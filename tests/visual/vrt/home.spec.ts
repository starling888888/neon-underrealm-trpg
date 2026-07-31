import type { Page } from "@playwright/test";
import { visualRoutes } from "../config";
import { allVrtViewports, registerVrtScenarios } from "../helpers/vrt";

const releaseNotesSection = {
  resolve: (page: Page) =>
    page.locator("section.home-section").filter({
      has: page.getByRole("heading", {
        exact: true,
        name: "最新リリースノート",
      }),
    }),
};

registerVrtScenarios("home", [
  { locator: releaseNotesSection, route: visualRoutes.home },
  {
    locator: releaseNotesSection,
    route: visualRoutes.home,
    state: "home-viewport",
    viewports: allVrtViewports,
    fullPage: false,
  },
]);

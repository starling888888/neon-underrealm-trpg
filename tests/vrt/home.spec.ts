import type { Page } from "@playwright/test";
import { siteRoutes } from "../support/site";
import { allVrtViewports, registerVrtScenarios } from "./helpers/vrt";

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
  { locator: releaseNotesSection, route: siteRoutes.home },
  {
    locator: releaseNotesSection,
    route: siteRoutes.home,
    state: "home-viewport",
    viewports: allVrtViewports,
    fullPage: false,
  },
]);

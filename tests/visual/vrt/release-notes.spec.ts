import type { Page } from "@playwright/test";
import { visualRoutes } from "../config";
import { registerVrtScenarios } from "../helpers/vrt";

const releaseNotesPage = {
  resolve: (page: Page) => page.locator(".release-notes-page"),
};

registerVrtScenarios("release-notes", [
  { locator: releaseNotesPage, route: visualRoutes.releaseNotes },
]);

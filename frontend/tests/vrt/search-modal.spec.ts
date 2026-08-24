import { siteRoutes } from "../support/site";
import { allVrtViewports, registerVrtScenarios } from "./helpers/vrt";

registerVrtScenarios("search-modal", [
  {
    route: siteRoutes.commonSkills,
    state: "search-open",
    viewports: allVrtViewports,
    fullPage: false,
  },
  {
    route: siteRoutes.commonSkills,
    state: "search-results",
    viewports: allVrtViewports,
    fullPage: false,
  },
]);

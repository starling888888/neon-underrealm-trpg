import { visualRoutes } from "../config";
import { allVrtViewports, registerVrtScenarios } from "../helpers/vrt";

registerVrtScenarios("search-modal", [
  {
    route: visualRoutes.commonSkills,
    state: "search-open",
    viewports: allVrtViewports,
    fullPage: false,
  },
  {
    route: visualRoutes.commonSkills,
    state: "search-results",
    viewports: allVrtViewports,
    fullPage: false,
  },
]);

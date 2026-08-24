import { siteRoutes } from "../support/site";
import { registerVrtScenarios } from "./helpers/vrt";

registerVrtScenarios("page-navigation-links", [
  { route: siteRoutes.pageNavigation },
]);

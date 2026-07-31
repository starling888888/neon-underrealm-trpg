import { siteRoutes } from "../support/site";
import { mobileVrtViewport, registerVrtScenarios } from "./helpers/vrt";

registerVrtScenarios("mobile-menu", [
  {
    route: siteRoutes.dataItemsWeapons,
    state: "default",
    viewports: mobileVrtViewport,
  },
  {
    route: siteRoutes.dataItemsWeapons,
    state: "mobile-menu-open",
    viewports: mobileVrtViewport,
  },
]);

import { visualRoutes } from "../config";
import { mobileVrtViewport, registerVrtScenarios } from "../helpers/vrt";

registerVrtScenarios("mobile-menu", [
  {
    route: visualRoutes.dataItemsWeapons,
    state: "default",
    viewports: mobileVrtViewport,
  },
  {
    route: visualRoutes.dataItemsWeapons,
    state: "mobile-menu-open",
    viewports: mobileVrtViewport,
  },
]);

import { visualRoutes } from "../config";
import { allVrtViewports, registerVrtScenarios } from "../helpers/vrt";

registerVrtScenarios("home", [
  { route: visualRoutes.home },
  {
    route: visualRoutes.home,
    state: "home-viewport",
    viewports: allVrtViewports,
    fullPage: false,
  },
]);

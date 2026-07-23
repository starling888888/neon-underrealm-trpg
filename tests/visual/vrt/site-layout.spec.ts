import { visualRoutes } from "../config";
import { mobileVrtViewport, registerVrtScenarios } from "../helpers/vrt";

registerVrtScenarios("site-layout", [
  { route: visualRoutes.mdxTest },
  {
    route: visualRoutes.dataItemsWeapons,
    state: "mobile-menu-open",
    viewports: mobileVrtViewport,
  },
  {
    route: visualRoutes.mdxTest,
    state: "mobile-page-toc-open",
    viewports: mobileVrtViewport,
  },
]);

import { siteRoutes } from "../support/site";
import { mobileVrtViewport, registerVrtScenarios } from "./helpers/vrt";

registerVrtScenarios("site-layout", [
  { route: siteRoutes.mdxTest },
  {
    route: siteRoutes.dataItemsWeapons,
    state: "mobile-menu-open",
    viewports: mobileVrtViewport,
  },
  {
    route: siteRoutes.mdxTest,
    state: "mobile-page-toc-open",
    viewports: mobileVrtViewport,
  },
]);

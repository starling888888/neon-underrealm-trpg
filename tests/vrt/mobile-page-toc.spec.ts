import { siteRoutes } from "../support/site";
import { mobileVrtViewport, registerVrtScenarios } from "./helpers/vrt";

registerVrtScenarios("mobile-page-toc", [
  {
    route: siteRoutes.mdxTest,
    state: "default",
    viewports: mobileVrtViewport,
  },
  {
    route: siteRoutes.mdxTest,
    state: "mobile-page-toc-open",
    viewports: mobileVrtViewport,
  },
]);

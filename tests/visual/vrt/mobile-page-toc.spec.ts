import { visualRoutes } from "../config";
import { mobileVrtViewport, registerVrtScenarios } from "../helpers/vrt";

registerVrtScenarios("mobile-page-toc", [
  {
    route: visualRoutes.mdxTest,
    state: "default",
    viewports: mobileVrtViewport,
  },
  {
    route: visualRoutes.mdxTest,
    state: "mobile-page-toc-open",
    viewports: mobileVrtViewport,
  },
]);

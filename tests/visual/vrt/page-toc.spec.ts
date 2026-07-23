import { visualRoutes } from "../config";
import { registerVrtScenarios } from "../helpers/vrt";

registerVrtScenarios("page-toc", [
  { route: visualRoutes.mdxTest },
  { route: visualRoutes.home, state: "no-toc-home", viewports: ["desktop"] },
  {
    route: visualRoutes.notFound,
    state: "no-toc-not-found",
    viewports: ["desktop"],
  },
  {
    route: visualRoutes.releaseNotes,
    state: "no-toc-release-notes",
    viewports: ["desktop"],
  },
]);

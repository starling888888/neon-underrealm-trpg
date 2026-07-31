import { siteRoutes } from "../support/site";
import { registerVrtScenarios } from "./helpers/vrt";

registerVrtScenarios("page-toc", [
  { route: siteRoutes.mdxTest },
  { route: siteRoutes.home, state: "no-toc-home", viewports: ["desktop"] },
  {
    route: siteRoutes.notFound,
    state: "no-toc-not-found",
    viewports: ["desktop"],
  },
  {
    route: siteRoutes.releaseNotes,
    state: "no-toc-release-notes",
    viewports: ["desktop"],
  },
]);

import { siteRoutes } from "../support/site";
import { registerVrtScenarios } from "./helpers/vrt";

registerVrtScenarios("site-menu", [
  { route: siteRoutes.world },
  { id: "gm", route: siteRoutes.gm },
]);

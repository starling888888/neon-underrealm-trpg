import { siteRoutes } from "../support/site";
import { registerVrtScenarios } from "./helpers/vrt";

registerVrtScenarios("current-menu-highlight", [{ route: siteRoutes.world }]);

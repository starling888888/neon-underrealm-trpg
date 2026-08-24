import { siteRoutes } from "../support/site";
import { registerVrtScenarios } from "./helpers/vrt";

registerVrtScenarios("ryugi-index", [{ route: siteRoutes.dataRyugi }]);

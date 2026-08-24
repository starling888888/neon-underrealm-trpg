import { siteRoutes } from "../support/site";
import { registerVrtScenarios } from "./helpers/vrt";

registerVrtScenarios("base-layout", [{ route: siteRoutes.mdxTest }]);

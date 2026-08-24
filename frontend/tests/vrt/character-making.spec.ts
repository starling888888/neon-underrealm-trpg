import { siteRoutes } from "../support/site";
import { registerVrtScenarios } from "./helpers/vrt";

registerVrtScenarios("character-making", [
  { route: siteRoutes.characterMaking },
]);

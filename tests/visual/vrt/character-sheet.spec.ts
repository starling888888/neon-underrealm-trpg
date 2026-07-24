import { visualRoutes } from "../config";
import { registerVrtScenarios } from "../helpers/vrt";

registerVrtScenarios("character-sheet", [
  { route: visualRoutes.characterSheet },
]);

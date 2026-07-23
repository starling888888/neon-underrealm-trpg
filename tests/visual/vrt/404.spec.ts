import { visualRoutes } from "../config";
import { registerVrtScenarios } from "../helpers/vrt";

registerVrtScenarios("404", [{ route: visualRoutes.notFound }]);

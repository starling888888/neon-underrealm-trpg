import ikizama from "../../../data/generated/ikizama.json" with {
  type: "json",
};
import { visualRoutes } from "../config";
import { registerVrtScenarios } from "../helpers/vrt";

const representativeIkizamaId = "sumi";

registerVrtScenarios("ikizama-detail", [
  {
    id: representativeIkizamaId,
    route: visualRoutes.dataIkizamaDetail(representativeIkizamaId),
  },
  ...ikizama.data
    .filter(({ id }) => id !== representativeIkizamaId)
    .map(({ id }) => ({
      id,
      route: visualRoutes.dataIkizamaDetail(id),
      viewports: ["desktop"] as const,
    })),
]);

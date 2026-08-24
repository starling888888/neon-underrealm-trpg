import ikizama from "../../data/generated/ikizama.json" with { type: "json" };
import { siteRoutes } from "../support/site";
import { registerVrtScenarios } from "./helpers/vrt";

const representativeIkizamaId = "sumi";

registerVrtScenarios("ikizama-detail", [
  {
    id: representativeIkizamaId,
    route: siteRoutes.dataIkizamaDetail(representativeIkizamaId),
  },
  ...ikizama.data
    .filter(({ id }) => id !== representativeIkizamaId)
    .map(({ id }) => ({
      id,
      route: siteRoutes.dataIkizamaDetail(id),
      viewports: ["desktop"] as const,
    })),
]);

import ryugiList from "../../data/generated/ryugi-list.json" with {
  type: "json",
};
import { siteRoutes } from "../support/site";
import { registerVrtScenarios } from "./helpers/vrt";

const representativeRyugiId = "kenkaya";

registerVrtScenarios("ryugi-detail", [
  {
    id: representativeRyugiId,
    route: siteRoutes.dataRyugiDetail(representativeRyugiId),
  },
  ...ryugiList.data
    .filter(({ id }) => id !== representativeRyugiId)
    .map(({ id }) => ({
      id,
      route: siteRoutes.dataRyugiDetail(id),
      viewports: ["desktop"] as const,
    })),
]);

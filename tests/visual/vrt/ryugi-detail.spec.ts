import ryugiList from "../../../data/generated/ryugi-list.json" with {
  type: "json",
};
import { visualRoutes } from "../config";
import { registerVrtScenarios } from "../helpers/vrt";

const representativeRyugiId = "kenkaya";

registerVrtScenarios("ryugi-detail", [
  {
    id: representativeRyugiId,
    route: visualRoutes.dataRyugiDetail(representativeRyugiId),
  },
  ...ryugiList.data
    .filter(({ id }) => id !== representativeRyugiId)
    .map(({ id }) => ({
      id,
      route: visualRoutes.dataRyugiDetail(id),
      viewports: ["desktop"] as const,
    })),
]);

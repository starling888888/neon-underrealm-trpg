import { getIkizamaById, getIkizamaList } from "../../lib/data/ikizama";
import { getRyugiById, getRyugiList } from "../../lib/data/ryugi-list";
import type { BuildValues } from "../form/values";
import type { BuildSources } from "../logic/build";

export type CharacterSheetSelectOption = {
  id: string;
  name: string;
};

export function getCharacterSheetIkizamaOptions(): CharacterSheetSelectOption[] {
  return getIkizamaList().map(({ id, name }) => ({ id, name }));
}

export function getCharacterSheetRyugiOptions(): CharacterSheetSelectOption[] {
  return getRyugiList().map(({ id, name }) => ({ id, name }));
}

/** Resolves the selected build IDs before the pure derived-value calculation. */
export function getBuildSources(
  build: Pick<BuildValues, "ikizamaId" | "primaryRyugiId">,
): BuildSources {
  return {
    ikizama:
      build.ikizamaId === null
        ? null
        : (getIkizamaById(build.ikizamaId) ?? null),
    primaryRyugi:
      build.primaryRyugiId === null
        ? null
        : (getRyugiById(build.primaryRyugiId) ?? null),
  };
}

import { getIkizamaList } from "../../lib/data/ikizama";
import { getRyugiList } from "../../lib/data/ryugi-list";

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

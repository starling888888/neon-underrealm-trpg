import { getIkizamaById } from "../../lib/data/ikizama";
import {
  type SpecialItemCategoryId,
  specialItemCategoryIds,
} from "../form/values";

export function getIkizamaExclusiveItemCategory(
  ikizamaId: string | null,
): SpecialItemCategoryId | null {
  if (ikizamaId === null) return null;

  const category = getIkizamaById(ikizamaId)?.exclusiveItem.id;
  return specialItemCategoryIds.includes(category as SpecialItemCategoryId)
    ? (category as SpecialItemCategoryId)
    : null;
}

export function getIkizamaName(ikizamaId: string | null): string | null {
  return ikizamaId === null ? null : (getIkizamaById(ikizamaId)?.name ?? null);
}

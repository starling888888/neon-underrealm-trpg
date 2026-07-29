import { getItemsData } from "../../lib/data/items";
import type { Drug } from "../../lib/types/item";

export function getDrugs(): readonly Drug[] {
  return getItemsData().drugs;
}

export function getDrugById(id: string | null): Drug | null {
  if (id === null) return null;
  return getDrugs().find((drug) => drug.id === id) ?? null;
}

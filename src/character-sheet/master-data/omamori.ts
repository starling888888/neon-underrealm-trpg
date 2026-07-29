import { getItemsData } from "../../lib/data/items";
import type { Omamori } from "../../lib/types/item";

export function getOmamori(): readonly Omamori[] {
  return getItemsData().omamori;
}

export function getOmamoriById(id: string | null): Omamori | null {
  if (id === null) return null;
  return getOmamori().find((omamori) => omamori.id === id) ?? null;
}

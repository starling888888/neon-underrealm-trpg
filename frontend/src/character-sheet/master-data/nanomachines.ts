import { getItemsData } from "../../lib/data/items";
import type { Nanomachine } from "../../lib/types/item";

export function getNanomachines(): readonly Nanomachine[] {
  return getItemsData().nanomachines;
}

export function getNanomachineById(id: string | null): Nanomachine | null {
  if (id === null) return null;
  return getNanomachines().find((nanomachine) => nanomachine.id === id) ?? null;
}

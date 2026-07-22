import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import npcJson from "../../../data/generated/npcs.json";
import type { Npc, NpcJson } from "../schemas/npcs";

export interface NpcGroup {
  group: string;
  npcs: Npc[];
}

const generatedNpcJson = npcJson as NpcJson;
const portraitDirectory = fileURLToPath(
  new URL("../../../public/images/npc/", import.meta.url),
);

export function getNpcJson(): NpcJson {
  return generatedNpcJson;
}

export function getNpcList(): Npc[] {
  return getNpcJson().data;
}

export function getNpcById(id: string): Npc | undefined {
  return getNpcList().find((npc) => npc.id === id);
}

export function getNpcGroups(): NpcGroup[] {
  const groups = new Map<string, Npc[]>();
  for (const npc of getNpcList()) {
    const group = groups.get(npc.group);
    if (group) {
      group.push(npc);
    } else {
      groups.set(npc.group, [npc]);
    }
  }
  return Array.from(groups, ([group, npcs]) => ({ group, npcs }));
}

export function getNpcPortraitPath(id: string): string {
  const fileName = existsSync(`${portraitDirectory}${id}.webp`)
    ? `${id}.webp`
    : "no_image.webp";
  return `/images/npc/${fileName}`;
}

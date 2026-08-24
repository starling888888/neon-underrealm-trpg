export const NPC_DATA_NAME = "npcs";

export interface NpcEpithet {
  text: string;
  reading: string;
}

export interface Npc {
  group: string;
  id: string;
  name: string;
  epithet: NpcEpithet | null;
  quote: string;
  description: string;
  sourceOrder: number;
}

export interface NpcJson {
  dataName: typeof NPC_DATA_NAME;
  updatedAt: string;
  data: Npc[];
}

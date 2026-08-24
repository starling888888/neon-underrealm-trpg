import type { CalloutType } from "./callout";

export const RYUGI_LIST_DATA_NAME = "ryugi-list";

export type RyugiNoteType = CalloutType;

export interface RyugiNote {
  type: RyugiNoteType;
  content: string;
}

export interface Ryugi {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  note: RyugiNote | null;
  healthIncrease: number;
  mindIncrease: number;
  baseAttributes: {
    strength: number;
    agility: number;
    perception: number;
    body: number;
    mind: number;
  };
  commonSkillBonuses: {
    level2: string;
    level5: string;
    level9: string;
  };
  sourceOrder: number;
}

export interface RyugiJson {
  dataName: typeof RYUGI_LIST_DATA_NAME;
  updatedAt: string;
  data: Ryugi[];
}

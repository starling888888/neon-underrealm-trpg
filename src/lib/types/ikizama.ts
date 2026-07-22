import type { CalloutType } from "./callout";

export const IKIZAMA_DATA_NAME = "ikizama";

export const IKIZAMA_EXCLUSIVE_ITEM_TYPES = {
  omamori: { name: "お守り", href: "/data/items/omamori" },
  cybernetics: { name: "サイバネ", href: "/data/items/cybernetics" },
  nanomachines: { name: "ナノマシン", href: "/data/items/nanomachines" },
  drugs: { name: "ドラッグ", href: "/data/items/drugs" },
} as const;

export type IkizamaNoteType = CalloutType;
export type IkizamaExclusiveItemType =
  keyof typeof IKIZAMA_EXCLUSIVE_ITEM_TYPES;

export interface IkizamaNote {
  type: IkizamaNoteType;
  content: string;
}

export interface Ikizama {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  exclusiveItem: {
    id: string;
    name: string;
  };
  note: IkizamaNote | null;
  secondaryAttributeCoefficients: {
    level1: { health: number; mind: number };
    level4: { health: number; mind: number };
    level10: { health: number; mind: number };
  };
  attributePoints: [number, number, number, number];
  sourceOrder: number;
}

export interface IkizamaJson {
  dataName: typeof IKIZAMA_DATA_NAME;
  updatedAt: string;
  data: Ikizama[];
}

export const ITEM_DATA_NAME = "items";

export const WEAPON_GROUPS = ["normal", "cybernetics", "nanomachines"] as const;
export const WEAPON_KINDS = ["近接", "射撃", "特殊"] as const;
export const WEAPON_CHECKS = [
  "喧嘩",
  "暗殺",
  "発砲",
  "格闘",
  "干渉",
  "格闘/干渉",
] as const;
export const WEAPON_CHECK_KEYS = [
  "kenka",
  "ansatsu",
  "happou",
  "kakutou",
  "kanshou",
  "kakutou_kanshou",
] as const;
export const CYBERNETIC_PARTS = ["頭", "胴体", "腕", "足", "任意"] as const;
export const CYBERNETIC_PART_KEYS = [
  "head",
  "torso",
  "arm",
  "leg",
  "any",
] as const;
export const DRUG_TIMINGS = ["SU", "INI", "CU", "SP"] as const;

export type WeaponGroup = (typeof WEAPON_GROUPS)[number];
export type WeaponKind = (typeof WEAPON_KINDS)[number];
export type WeaponCheck = (typeof WEAPON_CHECKS)[number];
export type WeaponCheckKey = (typeof WEAPON_CHECK_KEYS)[number];
export type CyberneticPart = (typeof CYBERNETIC_PARTS)[number];
export type CyberneticPartKey = (typeof CYBERNETIC_PART_KEYS)[number];
export type DrugTiming = (typeof DRUG_TIMINGS)[number];

export interface Item {
  id: string;
  name: string;
  credit: number | null;
  sourceOrder: number;
}

export interface Weapon extends Item {
  group: WeaponGroup;
  range: number | "シーン";
  kind: WeaponKind;
  check: WeaponCheck;
  attack: number | "特殊" | null;
  guard: number | "特殊" | null;
  ammo: number | null;
  effect: string | null;
}

export interface Armor extends Item {
  defense: number;
  damageReduction: number | "特殊" | null;
  restriction: string | null;
  effect: string | null;
}

export interface Omamori extends Item {
  effect: string;
}

export interface Cybernetic extends Item {
  part: CyberneticPart;
  implantPoints: number;
  effect: string;
}

export interface Nanomachine extends Item {
  implantPoints: number;
  activationMentalCost: number;
  effect: string;
}

export interface Drug extends Item {
  timing: DrugTiming;
  setQuantity: number;
  badTripIntensity: number;
  effect: string;
}

export type WeaponsByGroup = Partial<
  Record<WeaponGroup, Partial<Record<WeaponCheckKey, Weapon[]>>>
>;
export type CyberneticsByPart = Partial<
  Record<CyberneticPartKey, Cybernetic[]>
>;

export interface ItemsData {
  weapons: WeaponsByGroup;
  armors: Armor[];
  omamori: Omamori[];
  cybernetics: CyberneticsByPart;
  nanomachines: Nanomachine[];
  drugs: Drug[];
}

export interface ItemsJson {
  dataName: typeof ITEM_DATA_NAME;
  updatedAt: string;
  data: ItemsData;
}

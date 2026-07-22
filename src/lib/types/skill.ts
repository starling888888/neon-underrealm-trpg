export const SKILL_CATEGORIES = ["bonus", "basic", "advanced"] as const;
export const SKILL_TIMING_PARTS = [
  "Pv",
  "SU",
  "INI",
  "CU",
  "M",
  "○-○",
  "○-×",
  "○-☆",
  "×-○",
  "×-×",
  "×-☆",
  "☆-○",
  "☆-×",
  "☆-☆",
  "R",
  "Aa",
  "Ra",
  "D",
  "SP",
] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];
export type SkillTimingPart = (typeof SKILL_TIMING_PARTS)[number];
export type SkillTiming = string;

export const SKILL_TIMING_NORMALIZATIONS = {
  Pv: "pv",
  SU: "su",
  INI: "ini",
  CU: "cu",
  M: "m",
  "○-○": "a",
  "○-×": "a",
  "○-☆": "a",
  "×-○": "a",
  "×-×": "a",
  "×-☆": "a",
  "☆-○": "a",
  "☆-×": "a",
  "☆-☆": "a",
  R: "r",
  Aa: "aa",
  Ra: "ra",
  D: "d",
  SP: "sp",
} as const satisfies Record<SkillTimingPart, string>;

export interface Skill {
  id: string;
  category: SkillCategory;
  name: string;
  maxLevel: number;
  timing: SkillTiming;
  cost: string | null;
  proficiency: string | null;
  acquisitionRestriction: string | null;
  target: string | null;
  range: string | null;
  usageRestriction: string | null;
  summary: string;
  effect: string;
  sourceOrder: number;
}

export interface SkillsByCategory {
  bonus: Skill[];
  basic: Skill[];
  advanced: Skill[];
}

export interface SkillsJson {
  dataName: string;
  updatedAt: string;
  data: SkillsByCategory;
}

export interface SkillDataContract {
  idPrefix: string;
}

export interface SkillJsonContract extends SkillDataContract {
  dataName: string;
}

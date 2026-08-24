import type { SkillsByCategory } from "./skill";

export const RYUGI_SKILLS_DATA_NAME = "ryugi-skills";

export interface RyugiSkillsJson {
  dataName: typeof RYUGI_SKILLS_DATA_NAME;
  updatedAt: string;
  data: Record<string, SkillsByCategory>;
}

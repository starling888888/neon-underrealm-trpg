import type { SkillsByCategory } from "./skill";

export const IKIZAMA_SKILLS_DATA_NAME = "ikizama-skills";

export interface IkizamaSkillsJson {
  dataName: typeof IKIZAMA_SKILLS_DATA_NAME;
  updatedAt: string;
  data: Record<string, SkillsByCategory>;
}

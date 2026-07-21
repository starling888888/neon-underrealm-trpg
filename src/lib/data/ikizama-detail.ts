import type { Ikizama } from "../schemas/ikizama";
import type { SkillsByCategory } from "../schemas/skill";
import { getIkizamaById } from "./ikizama";
import { getIkizamaSkillsById } from "./ikizama-skills";

export interface IkizamaDetail {
  ikizama: Ikizama;
  skills: SkillsByCategory;
}

export function getIkizamaDetail(ikizamaId: string): IkizamaDetail | undefined {
  const ikizama = getIkizamaById(ikizamaId);
  const skills = getIkizamaSkillsById(ikizamaId);
  return ikizama && skills ? { ikizama, skills } : undefined;
}

import type { Ikizama } from "../types/ikizama";
import type { SkillsByCategory } from "../types/skill";
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

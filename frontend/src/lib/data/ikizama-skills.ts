import generatedIkizamaSkillsSource from "../../../data/generated/ikizama-skills.json";
import type { IkizamaSkillsJson } from "../types/ikizama-skills";
import type { SkillsByCategory } from "../types/skill";
import { getIkizamaList } from "./ikizama";

const generatedIkizamaSkillsJson =
  generatedIkizamaSkillsSource as IkizamaSkillsJson;

export function getIkizamaSkillsJson(): IkizamaSkillsJson {
  return generatedIkizamaSkillsJson;
}

export function getIkizamaSkillsById(
  ikizamaId: string,
): SkillsByCategory | undefined {
  if (!getIkizamaList().some((ikizama) => ikizama.id === ikizamaId)) {
    return undefined;
  }
  return getIkizamaSkillsJson().data[ikizamaId];
}

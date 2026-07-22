import type { Ryugi } from "../types/ryugi";
import type { SkillsByCategory } from "../types/skill";
import { getRyugiById } from "./ryugi-list";
import { getRyugiSkillsById } from "./ryugi-skills";

export interface RyugiDetail {
  ryugi: Ryugi;
  skills: SkillsByCategory;
}

export function getRyugiDetail(ryugiId: string): RyugiDetail | undefined {
  const ryugi = getRyugiById(ryugiId);
  const skills = getRyugiSkillsById(ryugiId);
  return ryugi && skills ? { ryugi, skills } : undefined;
}

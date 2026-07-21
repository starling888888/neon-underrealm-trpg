import generatedRyugiSkillsSource from "../../../data/generated/ryugi-skills.json";
import type { RyugiSkillsJson } from "../schemas/ryugi-skills";
import type { SkillsByCategory } from "../schemas/skill";
import { getRyugiList } from "./ryugi-list";

const generatedRyugiSkillsJson = generatedRyugiSkillsSource as RyugiSkillsJson;

export function getRyugiSkillsJson(): RyugiSkillsJson {
  return generatedRyugiSkillsJson;
}

export function getRyugiSkillsById(
  ryugiId: string,
): SkillsByCategory | undefined {
  if (!getRyugiList().some((ryugi) => ryugi.id === ryugiId)) return undefined;
  return getRyugiSkillsJson().data[ryugiId];
}

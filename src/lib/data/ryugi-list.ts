import ryugiListJson from "../../../data/generated/ryugi-list.json";
import type { Ryugi, RyugiJson } from "../schemas/ryugi";

const generatedRyugiListJson = ryugiListJson as RyugiJson;

export function getRyugiListJson(): RyugiJson {
  return generatedRyugiListJson;
}

export function getRyugiList(): Ryugi[] {
  return getRyugiListJson().data;
}

export function getRyugiById(id: string): Ryugi | undefined {
  return getRyugiList().find((ryugi) => ryugi.id === id);
}

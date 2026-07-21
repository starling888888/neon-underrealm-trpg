import ikizamaJson from "../../../data/generated/ikizama.json";
import type { Ikizama, IkizamaJson } from "../schemas/ikizama";

const generatedIkizamaJson = ikizamaJson as IkizamaJson;

export function getIkizamaJson(): IkizamaJson {
  return generatedIkizamaJson;
}

export function getIkizamaList(): Ikizama[] {
  return getIkizamaJson().data;
}

export function getIkizamaById(id: string): Ikizama | undefined {
  return getIkizamaList().find((ikizama) => ikizama.id === id);
}

import { getItemsData } from "../../lib/data/items";
import type { Cybernetic, CyberneticPartKey } from "../../lib/types/item";
import type { CyberneticFixedPartKey } from "../form/values";

export const cyberneticPartKeys = [
  "head",
  "torso",
  "arm",
  "leg",
  "any",
] as const;

export type CyberneticCandidateGroup = {
  id: CyberneticPartKey;
  label: Cybernetic["part"];
  candidates: readonly Cybernetic[];
};

const partLabelByKey = {
  any: "任意",
  arm: "腕",
  head: "頭",
  leg: "足",
  torso: "胴体",
} as const satisfies Record<CyberneticPartKey, Cybernetic["part"]>;

const fixedPartLabelByKey = {
  arm: "腕",
  head: "頭",
  leg: "足",
  torso: "胴体",
} as const satisfies Record<CyberneticFixedPartKey, Cybernetic["part"]>;

export function getCybernetics(): readonly Cybernetic[] {
  return cyberneticPartKeys.flatMap(
    (part) => getItemsData().cybernetics[part] ?? [],
  );
}

export function getCyberneticById(id: string | null): Cybernetic | null {
  if (id === null) return null;
  return getCybernetics().find((candidate) => candidate.id === id) ?? null;
}

/** True when a fixed slot accepts its matching part or an any-part cybernetic. */
export function isCyberneticCompatibleWithFixedPart(
  part: CyberneticFixedPartKey,
  id: string | null,
): boolean {
  const cybernetic = getCyberneticById(id);

  return (
    cybernetic === null ||
    cybernetic.part === "任意" ||
    cybernetic.part === fixedPartLabelByKey[part]
  );
}

export function getCyberneticCandidateGroups(
  part: CyberneticPartKey | "other",
): readonly CyberneticCandidateGroup[] {
  const keys = part === "other" ? cyberneticPartKeys : ([part, "any"] as const);

  return keys.flatMap((key) => {
    const candidates = getItemsData().cybernetics[key] ?? [];
    return candidates.length === 0
      ? []
      : [{ candidates, id: key, label: partLabelByKey[key] }];
  });
}

import type {
  AttributeName,
  ChecksValues,
  ReactionCheckName,
} from "../form-values";

export const defaultAttributeByAttackSkill = {
  assassination: "agility",
  brawl: "strength",
  combat: "body",
  interference: "mind",
  shooting: "perception",
} as const satisfies Record<
  ChecksValues["attacks"][number]["skill"],
  AttributeName
>;

export const defaultAttributeByReaction = {
  defense: "strength",
  endurance: "body",
  evasion: "strength",
  resistance: "mind",
} as const satisfies Record<ReactionCheckName, AttributeName>;

export type CheckAttributeValues = Record<
  AttributeName,
  { permanent: number | null; temporary: number | null }
>;

export type DerivedCheckRow = {
  attribute: AttributeName;
  modifier: number;
  permanentAttribute: number | null;
  permanentCheck: number | null;
  temporaryAttribute: number | null;
  temporaryCheck: number | null;
};

export type ChecksDerivedValues = {
  attacks: Array<ChecksValues["attacks"][number] & DerivedCheckRow>;
  reactions: Array<ChecksValues["reactions"][number] & DerivedCheckRow>;
};

function calculateCheckRow(
  row: ChecksValues["attacks"][number] | ChecksValues["reactions"][number],
  attributes: CheckAttributeValues,
): DerivedCheckRow {
  const selectedAttribute = attributes[row.attribute];
  const permanentAttribute = selectedAttribute.permanent;
  const temporaryAttribute = selectedAttribute.temporary;

  return {
    attribute: row.attribute,
    modifier: row.modifier,
    permanentAttribute,
    permanentCheck:
      permanentAttribute === null ? null : permanentAttribute + row.modifier,
    temporaryAttribute,
    temporaryCheck:
      temporaryAttribute === null ? null : temporaryAttribute + row.modifier,
  };
}

/** Derives attack and reaction check counts from already-derived attributes. */
export function calculateChecks(
  checks: ChecksValues,
  attributes: CheckAttributeValues,
): ChecksDerivedValues {
  return {
    attacks: checks.attacks.map((row) => ({
      ...row,
      ...calculateCheckRow(row, attributes),
    })),
    reactions: checks.reactions.map((row) => ({
      ...row,
      ...calculateCheckRow(row, attributes),
    })),
  };
}

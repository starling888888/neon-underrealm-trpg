import type { BondsValues, ResolveEffectName } from "../form-values";

export type ResolveEffectDefinition = {
  baseValues: readonly [string, string];
  id: ResolveEffectName;
  modifierApplication: "dice-count" | "value";
};

export type ResolveEffectDisplay = ResolveEffectDefinition & {
  modifier: number;
  finalValues: readonly [string, string];
};

export const resolveEffectDefinitions: readonly ResolveEffectDefinition[] = [
  {
    baseValues: ["10d6", "15d6"],
    id: "recovery",
    modifierApplication: "dice-count",
  },
  { baseValues: ["1", "1d6"], id: "morale", modifierApplication: "value" },
  {
    baseValues: ["2d", "3d"],
    id: "activeCheck",
    modifierApplication: "dice-count",
  },
  {
    baseValues: ["4d", "6d"],
    id: "passiveCheck",
    modifierApplication: "dice-count",
  },
];

export type BondsDerivedValues = {
  effectiveLimit: number;
  effects: ResolveEffectDisplay[];
  isOverLimit: boolean;
  occupiedCount: number;
  requiredRowCount: number;
};

function isOccupied({
  isResolved,
  relation,
  target,
}: BondsValues["rows"][number]) {
  return isResolved || relation !== "" || target !== "";
}

function formatSignedModifier(modifier: number): string {
  return modifier < 0 ? String(modifier) : `+${modifier}`;
}

function formatFinalValue(
  baseValue: string,
  modifier: number,
  modifierApplication: ResolveEffectDefinition["modifierApplication"],
): string {
  if (modifierApplication === "value") {
    if (/^\d+$/.test(baseValue)) {
      return String(Number(baseValue) + modifier);
    }

    return `${baseValue}${formatSignedModifier(modifier)}`;
  }

  const dice = /^(\d+)(d\d*)$/.exec(baseValue);

  if (dice === null) {
    return baseValue;
  }

  return `${Number(dice[1]) + modifier}${dice[2]}`;
}

export function calculateBonds(
  bonds: BondsValues,
  bondLimit: number | null,
): BondsDerivedValues {
  const effectiveLimit = Math.max(0, bondLimit ?? 0);
  const occupiedCount = bonds.rows.filter(isOccupied).length;

  return {
    effectiveLimit,
    effects: resolveEffectDefinitions.map((definition) => {
      const modifier = bonds.resolveEffectModifiers[definition.id];

      return {
        ...definition,
        finalValues: [
          formatFinalValue(
            definition.baseValues[0],
            modifier,
            definition.modifierApplication,
          ),
          formatFinalValue(
            definition.baseValues[1],
            modifier,
            definition.modifierApplication,
          ),
        ],
        modifier,
      };
    }),
    isOverLimit: occupiedCount > effectiveLimit,
    occupiedCount,
    requiredRowCount: Math.max(4, effectiveLimit),
  };
}

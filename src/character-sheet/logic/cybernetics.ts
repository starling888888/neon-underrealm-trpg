import type { Cybernetic } from "../../lib/types/item";

export type CyberneticsDerivedValues = {
  hasImplantLimitError: boolean;
  implantLimit: number | null;
  implantPoints: number;
  implantPointTotal: number;
  noncombatModifier: 0 | -2 | -4;
};

export function getNoncombatModifierForImplantPoints(
  implantPointTotal: number,
): 0 | -2 | -4 {
  if (implantPointTotal <= 5) return 0;
  return implantPointTotal <= 10 ? -2 : -4;
}

export function calculateCybernetics(
  cybernetics: readonly (Cybernetic | null)[],
  implantTotalModifier: number,
  permanentMind: number | null,
  implantLimitModifier: number,
): CyberneticsDerivedValues {
  const implantPoints = cybernetics.reduce(
    (total, cybernetic) => total + (cybernetic?.implantPoints ?? 0),
    0,
  );
  const implantPointTotal = implantPoints + implantTotalModifier;
  const implantLimit =
    permanentMind === null ? null : permanentMind + implantLimitModifier;

  return {
    hasImplantLimitError:
      implantLimit !== null && implantPointTotal > implantLimit,
    implantLimit,
    implantPoints,
    implantPointTotal,
    noncombatModifier: getNoncombatModifierForImplantPoints(implantPointTotal),
  };
}

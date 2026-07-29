import type { Nanomachine } from "../../lib/types/item";

export type NanomachinesDerivedValues = {
  hasImplantLimitError: boolean;
  implantLimit: number | null;
  implantPoints: number;
  implantPointTotal: number;
};

export function calculateNanomachines(
  nanomachines: readonly (Nanomachine | null)[],
  implantTotalModifier: number,
  permanentBody: number | null,
  implantLimitModifier: number,
): NanomachinesDerivedValues {
  const implantPoints = nanomachines.reduce(
    (total, nanomachine) => total + (nanomachine?.implantPoints ?? 0),
    0,
  );
  const implantPointTotal = implantPoints + implantTotalModifier;
  const implantLimit =
    permanentBody === null ? null : permanentBody + implantLimitModifier;

  return {
    hasImplantLimitError:
      implantLimit !== null && implantPointTotal > implantLimit,
    implantLimit,
    implantPoints,
    implantPointTotal,
  };
}

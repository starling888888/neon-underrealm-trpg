export type CcfoliaStatus = {
  label: string;
  value: number;
  max: number;
};

export type CcfoliaCharacterClipboardData = {
  kind: "character";
  data: {
    name: string;
    initiative: number;
    status: CcfoliaStatus[];
  };
};

type CcfoliaBondInput = {
  isResolved: boolean;
  relation: string;
  target: string;
};

export type CreateCcfoliaCharacterInput = {
  actionValue: number | null | undefined;
  bonds: readonly CcfoliaBondInput[];
  bondLimit: number | null | undefined;
  health: number | null | undefined;
  mental: number | null | undefined;
  pcName: string;
};

function toFiniteNumber(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function isEnteredBond(bond: CcfoliaBondInput): boolean {
  return bond.target.trim().length > 0 || bond.relation.trim().length > 0;
}

/** Creates the minimal CCFOLIA Clipboard API character payload. */
export function createCcfoliaCharacterClipboardData(
  input: CreateCcfoliaCharacterInput,
): CcfoliaCharacterClipboardData {
  const bondLimit = toFiniteNumber(input.bondLimit);
  const enteredBonds = input.bonds.filter(isEnteredBond);

  return {
    kind: "character",
    data: {
      name: input.pcName,
      initiative: toFiniteNumber(input.actionValue),
      status: [
        {
          label: "体力",
          max: toFiniteNumber(input.health),
          value: toFiniteNumber(input.health),
        },
        {
          label: "精神力",
          max: toFiniteNumber(input.mental),
          value: toFiniteNumber(input.mental),
        },
        { label: "気合", max: 0, value: 0 },
        { label: "縁", max: bondLimit, value: enteredBonds.length },
        {
          label: "覚悟にした縁",
          max: bondLimit,
          value: enteredBonds.filter((bond) => bond.isResolved).length,
        },
        { label: "出血", max: 0, value: 0 },
        { label: "毒", max: 0, value: 0 },
        { label: "BT", max: 0, value: 0 },
      ],
    },
  };
}

export function serializeCcfoliaCharacterClipboardData(
  input: CreateCcfoliaCharacterInput,
): string {
  return JSON.stringify(createCcfoliaCharacterClipboardData(input));
}

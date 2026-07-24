export type CreditInputs = {
  acquiredCredit: number;
  creditProvided: number;
  creditReceived: number;
  changeAdjustment: number;
  spentCredit: number;
};

export type CreditSummary = {
  totalCredit: number;
  change: number;
};

/**
 * Converts an HTML number control value into the integer stored by RHF.
 * Empty and malformed controls become zero; standard credit inputs also
 * clamp negative values to zero.
 */
export function normalizeCreditInput(
  value: number | string,
  allowNegative: boolean,
): number {
  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  const integerValue = Math.trunc(numericValue);
  return allowNegative ? integerValue : Math.max(0, integerValue);
}

export function calculateCredit({
  acquiredCredit,
  creditProvided,
  creditReceived,
  changeAdjustment,
  spentCredit,
}: CreditInputs): CreditSummary {
  const totalCredit = acquiredCredit + creditReceived - creditProvided;

  return {
    totalCredit,
    change: totalCredit - spentCredit + changeAdjustment,
  };
}

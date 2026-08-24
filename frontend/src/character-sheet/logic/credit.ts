export type CreditInputs = {
  acquiredCredit: number;
  creditProvided: number;
  creditReceived: number;
  changeAdjustment: number;
  spentCredit: number;
};

export type CreditSummary = {
  hasCreditError: boolean;
  totalCredit: number;
  change: number;
};

export function calculateCredit({
  acquiredCredit,
  creditProvided,
  creditReceived,
  changeAdjustment,
  spentCredit,
}: CreditInputs): CreditSummary {
  const totalCredit = acquiredCredit + creditReceived - creditProvided;

  return {
    hasCreditError: spentCredit > totalCredit,
    totalCredit,
    change: totalCredit - spentCredit + changeAdjustment,
  };
}

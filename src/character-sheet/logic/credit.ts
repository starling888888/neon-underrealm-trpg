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

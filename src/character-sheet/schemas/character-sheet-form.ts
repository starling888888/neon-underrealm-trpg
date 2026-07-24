import { z } from "zod";

import type { CreditFieldName } from "../form-values";

const nonNegativeIntegerSchema = z.number().int().nonnegative();
const signedIntegerSchema = z.number().int();

/** Validates the values kept in React Hook Form. */
export const characterSheetFormSchema = z.object({
  credit: z.object({
    acquired: nonNegativeIntegerSchema,
    changeAdjustment: signedIntegerSchema,
    provided: nonNegativeIntegerSchema,
    received: nonNegativeIntegerSchema,
  }),
  profile: z.object({
    age: z.string(),
    gender: z.string(),
    nickname: z.string(),
    pcName: z.string(),
    playerName: z.string(),
    setting: z.string(),
  }),
});

function normalizeIntegerInput(value: number | string): number {
  if (value === "") {
    return 0;
  }

  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.trunc(numericValue);
}

const nonNegativeCreditInputSchema = z
  .union([z.number(), z.string()])
  .transform((value) => Math.max(0, normalizeIntegerInput(value)))
  .pipe(nonNegativeIntegerSchema);

const signedCreditInputSchema = z
  .union([z.number(), z.string()])
  .transform(normalizeIntegerInput)
  .pipe(signedIntegerSchema);

const creditInputSchemas = {
  acquired: nonNegativeCreditInputSchema,
  changeAdjustment: signedCreditInputSchema,
  provided: nonNegativeCreditInputSchema,
  received: nonNegativeCreditInputSchema,
} as const satisfies Record<CreditFieldName, z.ZodType<number>>;

/**
 * Converts a browser number-control value to the valid number kept by RHF.
 *
 * The field-specific Zod schema owns empty-value fallback, integer conversion,
 * and the nonnegative constraint; Components never decide those rules.
 */
export function normalizeCreditInput(
  field: CreditFieldName,
  value: number | string,
): number {
  return creditInputSchemas[field].parse(value);
}

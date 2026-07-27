import { z } from "zod";

import type { CreditFieldName, ResolveEffectName } from "../form-values";

const nonNegativeIntegerSchema = z.number().int().nonnegative();
const signedIntegerSchema = z.number().int();

/** Validates the values kept in React Hook Form. */
export const characterSheetFormSchema = z.object({
  bonds: z.object({
    resolveEffectModifiers: z.object({
      activeCheck: z.number().int(),
      morale: z.number().int(),
      passiveCheck: z.number().int(),
      recovery: z.number().int(),
    }),
    rows: z.array(
      z.object({
        isResolved: z.boolean(),
        relation: z.string(),
        rowId: z.string(),
        target: z.string(),
      }),
    ),
  }),
  build: z.object({
    acquiredExperience: z.number().int(),
    attributes: z.object({
      agility: z.object({
        growth: z.number().int(),
        permanentModifier: z.number().int(),
        points: z.number().int(),
        temporaryModifier: z.number().int(),
      }),
      body: z.object({
        growth: z.number().int(),
        permanentModifier: z.number().int(),
        points: z.number().int(),
        temporaryModifier: z.number().int(),
      }),
      mind: z.object({
        growth: z.number().int(),
        permanentModifier: z.number().int(),
        points: z.number().int(),
        temporaryModifier: z.number().int(),
      }),
      perception: z.object({
        growth: z.number().int(),
        permanentModifier: z.number().int(),
        points: z.number().int(),
        temporaryModifier: z.number().int(),
      }),
      strength: z.object({
        growth: z.number().int(),
        permanentModifier: z.number().int(),
        points: z.number().int(),
        temporaryModifier: z.number().int(),
      }),
    }),
    ikizamaId: z.string().nullable(),
    ikizamaLevel: z.number().int(),
    otherRyugi: z.array(
      z.object({
        level: z.number().int(),
        rowId: z.string(),
        ryugiId: z.string().nullable(),
      }),
    ),
    primaryRyugiId: z.string().nullable(),
    primaryRyugiLevel: z.number().int(),
  }),
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
  secondaryAttributes: z.object({
    actionCountModifier: z.number().int(),
    actionModifier: z.number().int(),
    applyTemporaryAction: z.boolean(),
    applyTemporaryMovement: z.boolean(),
    bondLimitModifier: z.number().int(),
    healthModifier: z.number().int(),
    mentalModifier: z.number().int(),
    movementModifier: z.number().int(),
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

/** Normalizes a G7 numeric browser input without enforcing game constraints. */
export function normalizeBuildInput(value: number | string): number {
  return normalizeIntegerInput(value);
}

export function normalizeResolveEffectInput(
  _field: ResolveEffectName,
  value: number | string,
): number {
  return normalizeIntegerInput(value);
}

import { z } from "zod";

import type { CreditFieldName, ResolveEffectName } from "../form-values";

const nonNegativeIntegerSchema = z.number().int().nonnegative();
const signedIntegerSchema = z.number().int();
const stableRowIdSchema = z.string().min(1);
const reactionNames = [
  "defense",
  "evasion",
  "endurance",
  "resistance",
] as const;

/** Validates the values kept in React Hook Form. */
export const characterSheetFormSchema = z
  .object({
    armor: z.object({
      armorId: z.string().nullable(),
      damageReductionModifier: z.number().int().nullable(),
      defenseModifier: z.number().int().nullable(),
    }),
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
          rowId: stableRowIdSchema,
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
          rowId: stableRowIdSchema,
          ryugiId: z.string().nullable(),
        }),
      ),
      primaryRyugiId: z.string().nullable(),
      primaryRyugiLevel: z.number().int(),
    }),
    checks: z.object({
      attacks: z
        .array(
          z.object({
            attribute: z.enum([
              "strength",
              "agility",
              "perception",
              "body",
              "mind",
            ]),
            modifier: z.number().int(),
            rowId: stableRowIdSchema,
            skill: z.enum([
              "brawl",
              "assassination",
              "shooting",
              "combat",
              "interference",
            ]),
          }),
        )
        .min(1)
        .max(5),
      reactions: z
        .array(
          z.object({
            attribute: z.enum([
              "strength",
              "agility",
              "perception",
              "body",
              "mind",
            ]),
            modifier: z.number().int(),
            name: z.enum(reactionNames),
            rowId: stableRowIdSchema,
          }),
        )
        .length(4),
      noncombat: z.object({
        acrobatics: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
        analysis: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
        cheating: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
        dangerSense: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
        driving: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
        gambling: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
        hacking: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
        intimidation: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
        jingi: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
        negotiation: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
        reconnaissance: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
        sleightOfHand: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
        strengthContest: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
        survival: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
        willpower: z.object({
          isFavorite: z.boolean(),
          modifier: z.number().int(),
        }),
      }),
    }),
    commonSkills: z.object({
      rows: z
        .array(
          z.object({
            level: z.number().int(),
            rowId: stableRowIdSchema,
            skillId: z.string().nullable(),
          }),
        )
        .min(1),
    }),
    credit: z.object({
      acquired: nonNegativeIntegerSchema,
      changeAdjustment: signedIntegerSchema,
      provided: nonNegativeIntegerSchema,
      received: nonNegativeIntegerSchema,
    }),
    ikizamaSkills: z.object({
      bonusLevel: z.number().int(),
      rows: z.array(
        z.object({
          level: z.number().int(),
          rowId: stableRowIdSchema,
          skillId: z.string().nullable(),
        }),
      ),
    }),
    omamori: z.object({
      rows: z.array(
        z.object({
          omamoriId: z.string().nullable(),
          rowId: stableRowIdSchema,
        }),
      ),
    }),
    otherRyugiSkills: z.object({
      rows: z.array(
        z.object({
          level: z.number().int(),
          rowId: stableRowIdSchema,
          ryugiRowId: stableRowIdSchema,
          skillId: z.string().nullable(),
        }),
      ),
    }),
    primarySkills: z.object({
      rows: z
        .array(
          z.object({
            level: z.number().int(),
            rowId: stableRowIdSchema,
            skillId: z.string().nullable(),
          }),
        )
        .min(1),
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
    weapons: z.object({
      rows: z
        .array(
          z.object({
            attackModifier: z.number().int().nullable(),
            guardModifier: z.number().int().nullable(),
            rowId: stableRowIdSchema,
            weaponId: z.string().nullable(),
          }),
        )
        .min(1),
    }),
  })
  .superRefine((values, context) => {
    const fieldArrays = [
      { path: ["bonds", "rows"], rows: values.bonds.rows },
      { path: ["build", "otherRyugi"], rows: values.build.otherRyugi },
      { path: ["checks", "attacks"], rows: values.checks.attacks },
      { path: ["checks", "reactions"], rows: values.checks.reactions },
      { path: ["commonSkills", "rows"], rows: values.commonSkills.rows },
      { path: ["ikizamaSkills", "rows"], rows: values.ikizamaSkills.rows },
      { path: ["omamori", "rows"], rows: values.omamori.rows },
      {
        path: ["otherRyugiSkills", "rows"],
        rows: values.otherRyugiSkills.rows,
      },
      { path: ["primarySkills", "rows"], rows: values.primarySkills.rows },
      { path: ["weapons", "rows"], rows: values.weapons.rows },
    ] as const;

    for (const fieldArray of fieldArrays) {
      const knownRowIds = new Set<string>();

      fieldArray.rows.forEach((row, index) => {
        if (knownRowIds.has(row.rowId)) {
          context.addIssue({
            code: "custom",
            message: "rowId must be unique within its field array.",
            path: [...fieldArray.path, index, "rowId"],
          });
        }
        knownRowIds.add(row.rowId);
      });
    }

    const seenReactionNames = new Set<string>();
    values.checks.reactions.forEach((reaction, index) => {
      if (seenReactionNames.has(reaction.name)) {
        context.addIssue({
          code: "custom",
          message: "Each reaction name must occur exactly once.",
          path: ["checks", "reactions", index, "name"],
        });
      }
      seenReactionNames.add(reaction.name);

      if (reaction.rowId !== `reaction-${reaction.name}`) {
        context.addIssue({
          code: "custom",
          message: "Reaction rowId must match its reaction name.",
          path: ["checks", "reactions", index, "rowId"],
        });
      }
    });
  });

/**
 * Converts a browser numeric value into the integer stored by RHF without
 * applying field-specific game constraints.
 */
export function normalizeIntegerInput(value: number | string): number {
  if (value === "") {
    return 0;
  }

  const numericValue = typeof value === "number" ? value : Number(value);

  if (!Number.isFinite(numericValue)) {
    return 0;
  }

  return Math.trunc(numericValue);
}

/** Preserves an empty modifier so special item values have no derived result. */
export function normalizeOptionalIntegerInput(
  value: number | string,
): number | null {
  if (value === "") return null;

  return normalizeIntegerInput(value);
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

export function normalizeResolveEffectInput(
  _field: ResolveEffectName,
  value: number | string,
): number {
  return normalizeIntegerInput(value);
}

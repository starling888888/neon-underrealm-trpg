import { z } from "zod";

export const SkillCategorySchema = z.enum(["bonus", "basic", "advanced"]);
export const SkillTimingSchema = z.enum([
  "Pv",
  "SU",
  "INI",
  "CU",
  "M",
  "○-○",
  "○-×",
  "○-☆",
  "×-○",
  "×-×",
  "×-☆",
  "☆-○",
  "☆-×",
  "☆-☆",
  "R",
  "Aa",
  "Ra",
  "D",
  "SP",
]);

export const SKILL_CATEGORIES = [
  "bonus",
  "basic",
  "advanced",
] as const satisfies readonly SkillCategory[];

export const SKILL_TIMING_NORMALIZATIONS = {
  Pv: "pv",
  SU: "su",
  INI: "ini",
  CU: "cu",
  M: "m",
  "○-○": "a",
  "○-×": "a",
  "○-☆": "a",
  "×-○": "a",
  "×-×": "a",
  "×-☆": "a",
  "☆-○": "a",
  "☆-×": "a",
  "☆-☆": "a",
  R: "r",
  Aa: "aa",
  Ra: "ra",
  D: "d",
  SP: "sp",
} as const satisfies Record<SkillTiming, string>;

const requiredOneLine = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !hasLineBreak(value), "Value must be one line.");
const optionalOneLine = requiredOneLine.nullable();
const requiredLf = z
  .string()
  .trim()
  .min(1)
  .refine((value) => !value.includes("\r"), "Line breaks must use LF.");

export const SkillSchema = z
  .object({
    id: requiredOneLine,
    category: SkillCategorySchema,
    name: requiredOneLine,
    maxLevel: z.number().int().positive(),
    timing: SkillTimingSchema,
    cost: optionalOneLine,
    proficiency: optionalOneLine,
    acquisitionRestriction: optionalOneLine,
    target: requiredOneLine,
    range: optionalOneLine,
    usageRestriction: optionalOneLine,
    summary: requiredLf,
    effect: requiredLf,
    sourceOrder: z.number().int().positive(),
  })
  .strict();

export const SkillsByCategorySchema = z
  .object({
    bonus: z.array(SkillSchema),
    basic: z.array(SkillSchema),
    advanced: z.array(SkillSchema),
  })
  .strict();

export const SkillsJsonSchema = z
  .object({
    dataName: requiredOneLine,
    updatedAt: z.iso
      .datetime({
        error: "updatedAt must be an ISO 8601 datetime.",
        offset: true,
      })
      .refine(
        (value) => value.endsWith("+09:00"),
        "updatedAt must use the JST +09:00 offset.",
      ),
    data: SkillsByCategorySchema,
  })
  .strict();

export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type SkillTiming = z.infer<typeof SkillTimingSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type SkillsByCategory = z.infer<typeof SkillsByCategorySchema>;
export type SkillsJson = z.infer<typeof SkillsJsonSchema>;

export interface SkillJsonContract {
  dataName: string;
  idPrefix: string;
}

export function assertSkillsJson(
  value: unknown,
  contract: SkillJsonContract,
): asserts value is SkillsJson {
  const result = SkillsJsonSchema.safeParse(value);
  if (!result.success) {
    throw new Error(formatIssues(result.error.issues));
  }

  assertContract(result.data, contract);
}

export function parseSkillsJson(
  value: unknown,
  contract: SkillJsonContract,
): SkillsJson {
  assertSkillsJson(value, contract);
  return value;
}

function assertContract(json: SkillsJson, contract: SkillJsonContract): void {
  if (json.dataName !== contract.dataName) {
    throw new Error(`dataName must be "${contract.dataName}".`);
  }

  const ids = new Set<string>();
  const sourceOrders: number[] = [];
  for (const category of SKILL_CATEGORIES) {
    let previousSourceOrder = 0;
    for (const skill of json.data[category]) {
      const normalizedTiming = SKILL_TIMING_NORMALIZATIONS[skill.timing];
      const expectedPrefix = `${contract.idPrefix}-${category}-${normalizedTiming}-`;
      if (!skill.id.startsWith(expectedPrefix)) {
        throw new Error(`Skill id "${skill.id}" does not match its contract.`);
      }
      if (ids.has(skill.id)) {
        throw new Error(`Duplicate skill id "${skill.id}".`);
      }
      if (skill.sourceOrder <= previousSourceOrder) {
        throw new Error(
          `Skills in "${category}" must be sorted by sourceOrder.`,
        );
      }
      ids.add(skill.id);
      sourceOrders.push(skill.sourceOrder);
      previousSourceOrder = skill.sourceOrder;
    }
  }

  sourceOrders.sort((left, right) => left - right);
  sourceOrders.forEach((sourceOrder, index) => {
    if (sourceOrder !== index + 1) {
      throw new Error("Skill sourceOrder values must be consecutive.");
    }
  });
}

function hasLineBreak(value: string): boolean {
  return value.includes("\n") || value.includes("\r");
}

function formatIssues(issues: z.core.$ZodIssue[]): string {
  return issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

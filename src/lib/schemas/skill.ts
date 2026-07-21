import { z } from "zod";

export const SkillCategorySchema = z.enum(["bonus", "basic", "advanced"]);
export const SkillTimingPartSchema = z.enum([
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
export const SKILL_TIMING_PARTS = SkillTimingPartSchema.options;
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
} as const satisfies Record<SkillTimingPart, string>;

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
const optionalLf = z
  .string()
  .refine((value) => !value.includes("\r"), "Line breaks must use LF.");

export const SkillTimingSchema = z
  .string()
  .refine(isSkillTiming, "Timing must use permitted timing notation.");

export const SkillSchema = z
  .object({
    id: requiredOneLine,
    category: SkillCategorySchema,
    name: requiredLf,
    maxLevel: z.number().int().positive(),
    timing: SkillTimingSchema,
    cost: optionalOneLine,
    proficiency: optionalOneLine,
    acquisitionRestriction: optionalOneLine,
    target: optionalOneLine,
    range: optionalOneLine,
    usageRestriction: optionalOneLine,
    summary: optionalLf,
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
export type SkillTimingPart = z.infer<typeof SkillTimingPartSchema>;
export type SkillTiming = z.infer<typeof SkillTimingSchema>;
export type Skill = z.infer<typeof SkillSchema>;
export type SkillsByCategory = z.infer<typeof SkillsByCategorySchema>;
export type SkillsJson = z.infer<typeof SkillsJsonSchema>;

export interface SkillDataContract {
  idPrefix: string;
}

export interface SkillJsonContract extends SkillDataContract {
  dataName: string;
}

export function assertSkillsJson(
  value: unknown,
  contract: SkillJsonContract,
): asserts value is SkillsJson {
  const result = SkillsJsonSchema.safeParse(value);
  if (!result.success) {
    throw new Error(formatIssues(result.error.issues));
  }
  if (result.data.dataName !== contract.dataName) {
    throw new Error(`dataName must be "${contract.dataName}".`);
  }

  assertSkillsData(result.data.data, contract);
}

export function assertSkillsData(
  data: SkillsByCategory,
  contract: SkillDataContract,
): void {
  const ids = new Set<string>();
  const nextIndexes = new Map<string, number>();
  const sourceOrders: number[] = [];
  for (const category of SKILL_CATEGORIES) {
    let previousSourceOrder = 0;
    for (const skill of data[category]) {
      if (skill.category !== category) {
        throw new Error(
          `Skill "${skill.id}" must belong to category "${category}".`,
        );
      }
      const normalizedTiming = normalizeSkillTiming(skill.timing);
      const expectedPrefix = `${contract.idPrefix}-${category}-${normalizedTiming}-`;
      const index = parseSkillIndex(skill.id, expectedPrefix);
      if (index === undefined) {
        throw new Error(`Skill id "${skill.id}" does not match its contract.`);
      }
      if (ids.has(skill.id)) {
        throw new Error(`Duplicate skill id "${skill.id}".`);
      }
      const groupKey = `${category}:${normalizedTiming}`;
      const expectedIndex = (nextIndexes.get(groupKey) ?? 0) + 1;
      if (index !== expectedIndex) {
        throw new Error(
          `Skill id "${skill.id}" must use index ${formatSkillIndex(expectedIndex)}.`,
        );
      }
      if (skill.sourceOrder <= previousSourceOrder) {
        throw new Error(
          `Skills in "${category}" must be sorted by sourceOrder.`,
        );
      }
      ids.add(skill.id);
      nextIndexes.set(groupKey, index);
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

export function parseSkillsJson(
  value: unknown,
  contract: SkillJsonContract,
): SkillsJson {
  assertSkillsJson(value, contract);
  return value;
}

export function getSkillTimingParts(timing: SkillTiming): SkillTimingPart[] {
  return timing.split("/") as SkillTimingPart[];
}

export function normalizeSkillTiming(timing: SkillTiming): string {
  return [...getSkillTimingParts(timing)]
    .sort(
      (left, right) =>
        SKILL_TIMING_PARTS.indexOf(left) - SKILL_TIMING_PARTS.indexOf(right),
    )
    .map((part) => SKILL_TIMING_NORMALIZATIONS[part])
    .join("_");
}

function isSkillTiming(value: string): boolean {
  const parts = value.split("/");
  if (
    parts.length === 0 ||
    parts.some((part) => !SkillTimingPartSchema.safeParse(part).success)
  ) {
    return false;
  }
  return new Set(parts).size === parts.length;
}

function parseSkillIndex(id: string, prefix: string): number | undefined {
  const suffix = id.slice(prefix.length);
  if (!id.startsWith(prefix) || !/^\d{3,}$/.test(suffix)) return undefined;
  const index = Number(suffix);
  return Number.isSafeInteger(index) && index > 0 ? index : undefined;
}

function formatSkillIndex(index: number): string {
  return index.toString().padStart(3, "0");
}

function hasLineBreak(value: string): boolean {
  return value.includes("\n") || value.includes("\r");
}

function formatIssues(issues: z.core.$ZodIssue[]): string {
  return issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

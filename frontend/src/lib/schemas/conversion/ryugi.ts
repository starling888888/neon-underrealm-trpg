import { z } from "zod";
import { CALLOUT_TYPES } from "../../types/callout";
import { RYUGI_LIST_DATA_NAME, type RyugiJson } from "../../types/ryugi";

export const RyugiNoteTypeSchema = z.enum(CALLOUT_TYPES);

const requiredText = z
  .string()
  .min(1)
  .refine((value) => value === value.trim(), "Value must be trimmed.");
const requiredOneLine = requiredText.refine(
  (value) => !hasLineBreak(value),
  "Value must be one line.",
);
const requiredLf = requiredText.refine(
  (value) => !value.includes("\r"),
  "Line breaks must use LF.",
);
const positiveInteger = z.number().int().positive();

export const RyugiNoteSchema = z
  .object({
    type: RyugiNoteTypeSchema,
    content: requiredLf,
  })
  .strict();

export const RyugiSchema = z
  .object({
    id: requiredOneLine.regex(/^[a-z][a-z0-9-]*$/),
    name: requiredOneLine,
    shortDescription: requiredOneLine,
    description: requiredLf,
    note: RyugiNoteSchema.nullable(),
    healthIncrease: positiveInteger,
    mindIncrease: positiveInteger,
    baseAttributes: z
      .object({
        strength: positiveInteger,
        agility: positiveInteger,
        perception: positiveInteger,
        body: positiveInteger,
        mind: positiveInteger,
      })
      .strict(),
    commonSkillBonuses: z
      .object({
        level2: requiredLf,
        level5: requiredLf,
        level9: requiredLf,
      })
      .strict(),
    sourceOrder: positiveInteger,
  })
  .strict();

export const RyugiJsonSchema = z
  .object({
    dataName: z.literal(RYUGI_LIST_DATA_NAME),
    updatedAt: z.iso
      .datetime({
        error: "updatedAt must be an ISO 8601 datetime.",
        offset: true,
      })
      .refine(
        (value) => value.endsWith("+09:00"),
        "updatedAt must use the JST +09:00 offset.",
      ),
    data: z.array(RyugiSchema).min(1),
  })
  .strict();

export function assertRyugiJson(value: unknown): asserts value is RyugiJson {
  const result = RyugiJsonSchema.safeParse(value);
  if (!result.success) throw new Error(formatIssues(result.error.issues));

  const ids = new Set<string>();
  const names = new Set<string>();
  result.data.data.forEach((ryugi, index) => {
    if (ids.has(ryugi.id)) throw new Error(`Duplicate ryugi id "${ryugi.id}".`);
    if (names.has(ryugi.name)) {
      throw new Error(`Duplicate ryugi name "${ryugi.name}".`);
    }
    if (ryugi.sourceOrder !== index + 1) {
      throw new Error("Ryugi sourceOrder values must match input order.");
    }
    ids.add(ryugi.id);
    names.add(ryugi.name);
  });
}

export function parseRyugiJson(value: unknown): RyugiJson {
  assertRyugiJson(value);
  return value;
}

function hasLineBreak(value: string): boolean {
  return value.includes("\n") || value.includes("\r");
}

function formatIssues(issues: z.core.$ZodIssue[]): string {
  return issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

import { z } from "zod";
import { CALLOUT_TYPES, type CalloutType } from "../types/callout";

export const IKIZAMA_DATA_NAME = "ikizama";

export const IKIZAMA_EXCLUSIVE_ITEM_TYPES = {
  omamori: { name: "お守り", href: "/data/items/omamori" },
  cybernetics: { name: "サイバネ", href: "/data/items/cybernetics" },
  nanomachines: { name: "ナノマシン", href: "/data/items/nanomachines" },
  drugs: { name: "ドラッグ", href: "/data/items/drugs" },
} as const;

export const IkizamaNoteTypeSchema = z.enum(CALLOUT_TYPES);

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

export const IkizamaNoteSchema = z
  .object({
    type: IkizamaNoteTypeSchema,
    content: requiredLf,
  })
  .strict();

const IkizamaExclusiveItemShapeSchema = z
  .object({
    id: requiredOneLine,
    name: requiredOneLine,
  })
  .strict();

const IkizamaShapeSchema = z
  .object({
    id: requiredOneLine.regex(/^[a-z][a-z0-9-]*$/),
    name: requiredOneLine,
    shortDescription: requiredOneLine,
    description: requiredLf,
    exclusiveItem: IkizamaExclusiveItemShapeSchema,
    note: IkizamaNoteSchema.nullable(),
    secondaryAttributeCoefficients: z
      .object({
        level1: coefficientSchema(),
        level4: coefficientSchema(),
        level10: coefficientSchema(),
      })
      .strict(),
    attributePoints: z.tuple([
      positiveInteger,
      positiveInteger,
      positiveInteger,
      positiveInteger,
    ]),
    sourceOrder: positiveInteger,
  })
  .strict();

export const IkizamaSchema = IkizamaShapeSchema.superRefine(
  (ikizama, context) => {
    const expected =
      IKIZAMA_EXCLUSIVE_ITEM_TYPES[
        ikizama.exclusiveItem.id as IkizamaExclusiveItemType
      ];
    if (!expected) {
      context.addIssue({
        code: "custom",
        path: ["exclusiveItem", "id"],
        message: `Unsupported exclusive item type "${ikizama.exclusiveItem.id}".`,
      });
      return;
    }
    if (ikizama.exclusiveItem.name !== expected.name) {
      context.addIssue({
        code: "custom",
        path: ["exclusiveItem", "name"],
        message: `Exclusive item type "${ikizama.exclusiveItem.id}" must use name "${expected.name}".`,
      });
    }
  },
);

export const IkizamaJsonShapeSchema = z
  .object({
    dataName: z.literal(IKIZAMA_DATA_NAME),
    updatedAt: z.iso
      .datetime({
        error: "updatedAt must be an ISO 8601 datetime.",
        offset: true,
      })
      .refine(
        (value) => value.endsWith("+09:00"),
        "updatedAt must use the JST +09:00 offset.",
      ),
    data: z.array(IkizamaShapeSchema).min(1),
  })
  .strict();

export const IkizamaJsonSchema = z
  .object({
    dataName: z.literal(IKIZAMA_DATA_NAME),
    updatedAt: z.iso
      .datetime({
        error: "updatedAt must be an ISO 8601 datetime.",
        offset: true,
      })
      .refine(
        (value) => value.endsWith("+09:00"),
        "updatedAt must use the JST +09:00 offset.",
      ),
    data: z.array(IkizamaSchema).min(1),
  })
  .strict();

export type IkizamaNoteType = CalloutType;
export type IkizamaNote = z.infer<typeof IkizamaNoteSchema>;
export type Ikizama = z.infer<typeof IkizamaSchema>;
export type IkizamaJson = z.infer<typeof IkizamaJsonSchema>;
export type IkizamaExclusiveItemType =
  keyof typeof IKIZAMA_EXCLUSIVE_ITEM_TYPES;

export function assertIkizamaJson(
  value: unknown,
): asserts value is IkizamaJson {
  const result = IkizamaJsonSchema.safeParse(value);
  if (!result.success) throw new Error(formatIssues(result.error.issues));

  const ids = new Set<string>();
  const names = new Set<string>();
  result.data.data.forEach((ikizama, index) => {
    if (ids.has(ikizama.id)) {
      throw new Error(`Duplicate ikizama id "${ikizama.id}".`);
    }
    if (names.has(ikizama.name)) {
      throw new Error(`Duplicate ikizama name "${ikizama.name}".`);
    }
    if (ikizama.sourceOrder !== index + 1) {
      throw new Error("Ikizama sourceOrder values must match input order.");
    }
    ids.add(ikizama.id);
    names.add(ikizama.name);
  });
}

export function assertIkizamaJsonShape(
  value: unknown,
): asserts value is IkizamaJson {
  const result = IkizamaJsonShapeSchema.safeParse(value);
  if (!result.success) throw new Error(formatIssues(result.error.issues));
}

export function assertIkizamaExclusiveItem(id: string, name: string): void {
  const expected = IKIZAMA_EXCLUSIVE_ITEM_TYPES[id as IkizamaExclusiveItemType];
  if (!expected) {
    throw new Error(`Unsupported exclusive item type "${id}".`);
  }
  if (name !== expected.name) {
    throw new Error(
      `Exclusive item type "${id}" must use name "${expected.name}".`,
    );
  }
}

export function parseIkizamaJson(value: unknown): IkizamaJson {
  assertIkizamaJson(value);
  return value;
}

function coefficientSchema() {
  return z
    .object({
      health: positiveInteger,
      mind: positiveInteger,
    })
    .strict();
}

function hasLineBreak(value: string): boolean {
  return value.includes("\n") || value.includes("\r");
}

function formatIssues(issues: z.core.$ZodIssue[]): string {
  return issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

import { z } from "zod";

export const NPC_DATA_NAME = "npcs";

const requiredText = z
  .string()
  .min(1)
  .refine((value) => value === value.trim(), "Value must be trimmed.");
const requiredOneLine = requiredText.refine(
  (value) => !hasLineBreak(value),
  "Value must be one line.",
);
const optionalOneLine = z
  .string()
  .refine((value) => value === value.trim(), "Value must be trimmed.")
  .refine((value) => !hasLineBreak(value), "Value must be one line.");
const requiredLf = requiredText.refine(
  (value) => !value.includes("\r"),
  "Line breaks must use LF.",
);

export const NpcEpithetSchema = z
  .object({
    text: requiredOneLine,
    reading: requiredOneLine,
  })
  .strict();

export const NpcSchema = z
  .object({
    group: optionalOneLine,
    id: requiredOneLine.regex(/^[a-z][a-z0-9_]*$/),
    name: requiredOneLine,
    epithet: NpcEpithetSchema.nullable(),
    quote: requiredOneLine,
    description: requiredLf,
    sourceOrder: z.number().int().positive(),
  })
  .strict();

export const NpcJsonSchema = z
  .object({
    dataName: z.literal(NPC_DATA_NAME),
    updatedAt: z.iso
      .datetime({
        error: "updatedAt must be an ISO 8601 datetime.",
        offset: true,
      })
      .refine(
        (value) => value.endsWith("+09:00"),
        "updatedAt must use the JST +09:00 offset.",
      ),
    data: z.array(NpcSchema).min(1),
  })
  .strict();

export type Npc = z.infer<typeof NpcSchema>;
export type NpcJson = z.infer<typeof NpcJsonSchema>;

export function assertNpcJson(value: unknown): asserts value is NpcJson {
  const result = NpcJsonSchema.safeParse(value);
  if (!result.success) throw new Error(formatIssues(result.error.issues));

  const ids = new Set<string>();
  const names = new Set<string>();
  result.data.data.forEach((npc, index) => {
    if (ids.has(npc.id)) throw new Error(`Duplicate NPC id "${npc.id}".`);
    if (names.has(npc.name))
      throw new Error(`Duplicate NPC name "${npc.name}".`);
    if (npc.sourceOrder !== index + 1) {
      throw new Error("NPC sourceOrder values must match input order.");
    }
    ids.add(npc.id);
    names.add(npc.name);
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

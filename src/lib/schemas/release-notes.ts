import { z } from "zod";

const DATA_NAME = "release-notes";
const ID_PATTERN = /^\d{4}-\d{2}-\d{2}-\d{3}$/;

export const ReleaseNotesDataNameSchema = z.literal(DATA_NAME);

export const ReleaseNoteSchema = z
  .object({
    id: z.string().regex(ID_PATTERN, "Release note id must be YYYY-MM-DD-NNN."),
    date: z.iso.date("Release note date must be YYYY-MM-DD."),
    summary: z
      .string()
      .trim()
      .min(1, "Release note summary must not be empty.")
      .refine(
        (value) => !hasLineBreak(value),
        "Release note summary must be one line.",
      ),
    body: z
      .string()
      .refine(
        (value) => !value.includes("\r"),
        "Release note body line breaks must be normalized to LF.",
      )
      .nullable(),
    sourceOrder: z
      .number()
      .int("Release note sourceOrder must be an integer.")
      .positive("Release note sourceOrder must be positive."),
  })
  .strict()
  .superRefine((note, context) => {
    if (!note.id.startsWith(`${note.date}-`)) {
      context.addIssue({
        code: "custom",
        message: "Release note id must start with its date.",
        path: ["id"],
      });
    }
  });

export const ReleaseNotesJsonSchema = z
  .object({
    dataName: ReleaseNotesDataNameSchema,
    updatedAt: z.iso.datetime({
      error: "Release notes updatedAt must be ISO 8601 datetime.",
      offset: true,
    }),
    data: z.array(ReleaseNoteSchema),
  })
  .strict()
  .superRefine((json, context) => {
    const ids = new Set<string>();
    let previous: ReleaseNote | undefined;

    json.data.forEach((note, index) => {
      if (ids.has(note.id)) {
        context.addIssue({
          code: "custom",
          message: `Duplicate release note id "${note.id}".`,
          path: ["data", index, "id"],
        });
      }
      ids.add(note.id);

      if (previous && compareReleaseNotesForSort(previous, note) > 0) {
        context.addIssue({
          code: "custom",
          message:
            "Release notes data must be sorted by date desc and sourceOrder desc.",
          path: ["data", index],
        });
      }

      previous = note;
    });
  });

export type ReleaseNotesDataName = z.infer<typeof ReleaseNotesDataNameSchema>;
export type ReleaseNote = z.infer<typeof ReleaseNoteSchema>;
export type ReleaseNotesJson = z.infer<typeof ReleaseNotesJsonSchema>;

export function assertReleaseNotesJson(
  value: unknown,
): asserts value is ReleaseNotesJson {
  const result = ReleaseNotesJsonSchema.safeParse(value);

  if (!result.success) {
    throw new Error(formatZodIssues(result.error.issues));
  }
}

export function parseReleaseNotesJson(value: unknown): ReleaseNotesJson {
  return ReleaseNotesJsonSchema.parse(value);
}

function compareReleaseNotesForSort(
  left: ReleaseNote,
  right: ReleaseNote,
): number {
  if (left.date < right.date) {
    return 1;
  }

  if (left.date > right.date) {
    return -1;
  }

  return right.sourceOrder - left.sourceOrder;
}

function hasLineBreak(value: string): boolean {
  return value.includes("\n") || value.includes("\r");
}

function formatZodIssues(issues: z.core.$ZodIssue[]): string {
  return issues
    .map((issue) => {
      const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
      return `${path}${issue.message}`;
    })
    .join("\n");
}

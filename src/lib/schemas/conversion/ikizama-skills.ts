import { z } from "zod";
import {
  IKIZAMA_SKILLS_DATA_NAME,
  type IkizamaSkillsJson,
} from "../../types/ikizama-skills";
import type { Skill, SkillsByCategory } from "../../types/skill";
import { assertSkillsData, SkillsByCategorySchema } from "./skill";

export const IkizamaSkillsJsonSchema = z
  .object({
    dataName: z.literal(IKIZAMA_SKILLS_DATA_NAME),
    updatedAt: z.iso
      .datetime({
        error: "updatedAt must be an ISO 8601 datetime.",
        offset: true,
      })
      .refine(
        (value) => value.endsWith("+09:00"),
        "updatedAt must use the JST +09:00 offset.",
      ),
    data: z.record(z.string(), SkillsByCategorySchema),
  })
  .strict();

export function assertIkizamaSkillsJsonShape(
  value: unknown,
): asserts value is IkizamaSkillsJson {
  const result = IkizamaSkillsJsonSchema.safeParse(value);
  if (!result.success) throw new Error(formatIssues(result.error.issues));
}

export function assertIkizamaSkillsJson(
  value: unknown,
  ikizamaIds: readonly string[],
): asserts value is IkizamaSkillsJson {
  assertIkizamaSkillsJsonShape(value);

  const expectedIds = new Set(ikizamaIds);
  const actualIds = Object.keys(value.data);
  for (const ikizamaId of ikizamaIds) {
    if (!(ikizamaId in value.data)) {
      throw new Error(`Missing ikizama skills for "${ikizamaId}".`);
    }
  }
  for (const ikizamaId of actualIds) {
    if (!expectedIds.has(ikizamaId)) {
      throw new Error(`Unexpected ikizama skills for "${ikizamaId}".`);
    }
  }

  const skillIds = new Set<string>();
  for (const ikizamaId of ikizamaIds) {
    const skills = value.data[ikizamaId];
    if (!skills) throw new Error(`Missing ikizama skills for "${ikizamaId}".`);
    assertSkillsData(skills, { idPrefix: `skill-ikizama-${ikizamaId}` });
    for (const skill of flattenSkills(skills)) {
      if (skillIds.has(skill.id)) {
        throw new Error(`Duplicate skill id "${skill.id}".`);
      }
      skillIds.add(skill.id);
    }
  }
}

export function parseIkizamaSkillsJson(
  value: unknown,
  ikizamaIds: readonly string[],
): IkizamaSkillsJson {
  assertIkizamaSkillsJson(value, ikizamaIds);
  return value;
}

function flattenSkills(data: SkillsByCategory): Skill[] {
  return [...data.bonus, ...data.basic, ...data.advanced];
}

function formatIssues(issues: z.core.$ZodIssue[]): string {
  return issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

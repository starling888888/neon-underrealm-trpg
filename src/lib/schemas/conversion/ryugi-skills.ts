import { z } from "zod";
import {
  RYUGI_SKILLS_DATA_NAME,
  type RyugiSkillsJson,
} from "../../types/ryugi-skills";
import type { Skill, SkillsByCategory } from "../../types/skill";
import { assertSkillsData, SkillsByCategorySchema } from "./skill";

export const RyugiSkillsJsonSchema = z
  .object({
    dataName: z.literal(RYUGI_SKILLS_DATA_NAME),
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

export function assertRyugiSkillsJsonShape(
  value: unknown,
): asserts value is RyugiSkillsJson {
  const result = RyugiSkillsJsonSchema.safeParse(value);
  if (!result.success) throw new Error(formatIssues(result.error.issues));
}

export function assertRyugiSkillsJson(
  value: unknown,
  ryugiIds: readonly string[],
): asserts value is RyugiSkillsJson {
  assertRyugiSkillsJsonShape(value);

  const expectedIds = new Set(ryugiIds);
  const actualIds = Object.keys(value.data);
  for (const ryugiId of ryugiIds) {
    if (!(ryugiId in value.data)) {
      throw new Error(`Missing ryugi skills for "${ryugiId}".`);
    }
  }
  for (const ryugiId of actualIds) {
    if (!expectedIds.has(ryugiId)) {
      throw new Error(`Unexpected ryugi skills for "${ryugiId}".`);
    }
  }

  const skillIds = new Set<string>();
  for (const ryugiId of ryugiIds) {
    const skills = value.data[ryugiId];
    if (!skills) throw new Error(`Missing ryugi skills for "${ryugiId}".`);
    assertSkillsData(skills, { idPrefix: `skill-ryugi-${ryugiId}` });
    for (const skill of flattenSkills(skills)) {
      if (skillIds.has(skill.id)) {
        throw new Error(`Duplicate skill id "${skill.id}".`);
      }
      skillIds.add(skill.id);
    }
  }
}

export function parseRyugiSkillsJson(
  value: unknown,
  ryugiIds: readonly string[],
): RyugiSkillsJson {
  assertRyugiSkillsJson(value, ryugiIds);
  return value;
}

export function flattenSkills(data: SkillsByCategory): Skill[] {
  return [...data.bonus, ...data.basic, ...data.advanced];
}

function formatIssues(issues: z.core.$ZodIssue[]): string {
  return issues
    .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
}

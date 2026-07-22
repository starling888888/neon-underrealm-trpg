import test from "node:test";
import type { z } from "zod";
import type { IkizamaJsonSchema } from "../../src/lib/schemas/conversion/ikizama";
import type { IkizamaSkillsJsonSchema } from "../../src/lib/schemas/conversion/ikizama-skills";
import type { ItemsJsonSchema } from "../../src/lib/schemas/conversion/item";
import type { NpcJsonSchema } from "../../src/lib/schemas/conversion/npcs";
import type { ReleaseNotesJsonSchema } from "../../src/lib/schemas/conversion/release-notes";
import type { RyugiJsonSchema } from "../../src/lib/schemas/conversion/ryugi";
import type { RyugiSkillsJsonSchema } from "../../src/lib/schemas/conversion/ryugi-skills";
import type { SkillsJsonSchema } from "../../src/lib/schemas/conversion/skill";
import type { IkizamaJson } from "../../src/lib/types/ikizama";
import type { IkizamaSkillsJson } from "../../src/lib/types/ikizama-skills";
import type { ItemsJson } from "../../src/lib/types/item";
import type { NpcJson } from "../../src/lib/types/npc";
import type { ReleaseNotesJson } from "../../src/lib/types/release-notes";
import type { RyugiJson } from "../../src/lib/types/ryugi";
import type { RyugiSkillsJson } from "../../src/lib/types/ryugi-skills";
import type { SkillsJson } from "../../src/lib/types/skill";

type IsAssignable<Actual, Expected> = [Actual] extends [Expected]
  ? true
  : false;

function expectType<_Condition extends true>(): void {}

test("keeps conversion schema outputs and public JSON types equivalent at compile time", () => {
  expectType<IsAssignable<z.output<typeof ItemsJsonSchema>, ItemsJson>>();
  expectType<IsAssignable<ItemsJson, z.output<typeof ItemsJsonSchema>>>();
  expectType<IsAssignable<z.output<typeof SkillsJsonSchema>, SkillsJson>>();
  expectType<IsAssignable<SkillsJson, z.output<typeof SkillsJsonSchema>>>();
  expectType<IsAssignable<z.output<typeof RyugiJsonSchema>, RyugiJson>>();
  expectType<IsAssignable<RyugiJson, z.output<typeof RyugiJsonSchema>>>();
  expectType<IsAssignable<z.output<typeof IkizamaJsonSchema>, IkizamaJson>>();
  expectType<IsAssignable<IkizamaJson, z.output<typeof IkizamaJsonSchema>>>();
  expectType<IsAssignable<z.output<typeof NpcJsonSchema>, NpcJson>>();
  expectType<IsAssignable<NpcJson, z.output<typeof NpcJsonSchema>>>();
  expectType<
    IsAssignable<z.output<typeof ReleaseNotesJsonSchema>, ReleaseNotesJson>
  >();
  expectType<
    IsAssignable<ReleaseNotesJson, z.output<typeof ReleaseNotesJsonSchema>>
  >();
  expectType<
    IsAssignable<z.output<typeof RyugiSkillsJsonSchema>, RyugiSkillsJson>
  >();
  expectType<
    IsAssignable<RyugiSkillsJson, z.output<typeof RyugiSkillsJsonSchema>>
  >();
  expectType<
    IsAssignable<z.output<typeof IkizamaSkillsJsonSchema>, IkizamaSkillsJson>
  >();
  expectType<
    IsAssignable<IkizamaSkillsJson, z.output<typeof IkizamaSkillsJsonSchema>>
  >();
});

import { useMemo } from "react";

import {
  type CharacterSheetErrorFact,
  type CharacterSheetErrorSummary,
  getCharacterSheetErrorSummary,
} from "../logic/error-summary";
import type useBondsSectionProps from "./useBondsSectionProps";
import type { BuildSectionPresenterState } from "./useBuildSectionProps";
import type { CommonSkillsSectionPresenterState } from "./useCommonSkillsSectionProps";
import type useCyberneticsSectionProps from "./useCyberneticsSectionProps";
import type useDrugsSectionProps from "./useDrugsSectionProps";
import type { IkizamaSkillsSectionPresenterState } from "./useIkizamaSkillsSectionProps";
import type useNanomachinesSectionProps from "./useNanomachinesSectionProps";
import type { OtherRyugiSkillsSectionPresenterState } from "./useOtherRyugiSkillsSectionProps";
import type { PrimarySkillsSectionPresenterState } from "./usePrimarySkillsSectionProps";
import type useProfileSectionProps from "./useProfileSectionProps";

type NamedSkillRow = {
  level: number;
  rowId: string;
  skill: { name: string } | null;
};

type ErrorSummarySources = {
  bondsSection: ReturnType<typeof useBondsSectionProps>;
  build: BuildSectionPresenterState;
  commonSkills: CommonSkillsSectionPresenterState;
  cybernetics: ReturnType<typeof useCyberneticsSectionProps>;
  drugs: ReturnType<typeof useDrugsSectionProps>;
  ikizamaSkills: IkizamaSkillsSectionPresenterState;
  nanomachines: ReturnType<typeof useNanomachinesSectionProps>;
  otherRyugiSkills: OtherRyugiSkillsSectionPresenterState;
  primarySkills: PrimarySkillsSectionPresenterState;
  profileSection: ReturnType<typeof useProfileSectionProps>;
};

function addSkillRowFacts(
  facts: CharacterSheetErrorFact[],
  code: Extract<
    CharacterSheetErrorFact["code"],
    | "common-skill-duplicate"
    | "common-skill-advanced"
    | "common-skill-maximum-level"
    | "ikizama-skill-advanced"
    | "ikizama-skill-duplicate"
    | "ikizama-skill-maximum-level"
    | "other-ryugi-skill-advanced"
    | "other-ryugi-skill-duplicate"
    | "other-ryugi-skill-maximum-level"
    | "primary-skill-advanced"
    | "primary-skill-duplicate"
    | "primary-skill-maximum-level"
  >,
  invalidRowIds: readonly string[],
  rows: readonly NamedSkillRow[],
  sectionName: string,
): void {
  const invalidRowIdSet = new Set(invalidRowIds);

  for (const row of rows) {
    if (!invalidRowIdSet.has(row.rowId) || row.skill === null) continue;
    facts.push({
      code,
      level: row.level,
      rowId: row.rowId,
      subject: `${sectionName}「${row.skill.name}」`,
    });
  }
}

function addAdvancedSkillRowFacts(
  facts: CharacterSheetErrorFact[],
  code: Extract<
    CharacterSheetErrorFact["code"],
    | "ikizama-skill-advanced"
    | "common-skill-advanced"
    | "other-ryugi-skill-advanced"
    | "primary-skill-advanced"
  >,
  invalidRowIds: readonly string[],
  rows: readonly NamedSkillRow[],
  sectionName: string,
  condition: string,
): void {
  const invalidRowIdSet = new Set(invalidRowIds);

  for (const row of rows) {
    if (!invalidRowIdSet.has(row.rowId) || row.skill === null) continue;
    facts.push({
      code,
      condition,
      rowId: row.rowId,
      subject: `${sectionName}「${row.skill.name}」`,
    });
  }
}

function createCharacterSheetErrorSummary({
  bondsSection,
  build,
  commonSkills,
  cybernetics,
  drugs,
  ikizamaSkills,
  nanomachines,
  otherRyugiSkills,
  primarySkills,
  profileSection,
}: ErrorSummarySources): CharacterSheetErrorSummary {
  const errorFacts: CharacterSheetErrorFact[] = [];
  const primaryRyugiName = primarySkills.sectionProps.primaryRyugiName;
  const ikizamaName = ikizamaSkills.sectionProps.ikizamaName;

  if (build.derivedBuild.hasExperienceError) {
    errorFacts.push({ code: "experience" });
  }
  if (profileSection.creditSummary.hasCreditError) {
    errorFacts.push({ code: "credit" });
  }
  if (build.derivedBuild.primaryRyugiLevelInvalid) {
    errorFacts.push({
      code: "primary-ryugi-level",
      level: build.sectionProps.build.primaryRyugiLevel,
      subject: primaryRyugiName ?? "プライマリ流儀",
    });
  }
  if (build.derivedBuild.ikizamaLevelInvalid) {
    errorFacts.push({
      code: "ikizama-level",
      level: build.sectionProps.build.ikizamaLevel,
      subject: ikizamaName ?? "生き様",
    });
  }

  const otherRyugiByRowId = new Map(
    otherRyugiSkills.sectionProps.sections.map((section) => [
      section.ryugiRowId,
      section,
    ]),
  );
  for (const rowId of build.derivedBuild.otherRyugiDuplicateRowIds) {
    const otherRyugi = otherRyugiByRowId.get(rowId);
    const otherRyugiName = otherRyugi?.ryugiName ?? "その他流儀";
    const isPrimaryConflict =
      build.sectionProps.build.primaryRyugiId !== null &&
      build.sectionProps.build.otherRyugi.find((row) => row.rowId === rowId)
        ?.ryugiId === build.sectionProps.build.primaryRyugiId;

    errorFacts.push({
      code: "ryugi-duplicate",
      rowId,
      subject: isPrimaryConflict
        ? `プライマリ流儀「${primaryRyugiName ?? "未選択"}」とその他流儀「${otherRyugiName}」`
        : `その他流儀「${otherRyugiName}」`,
    });
  }
  for (const rowId of build.derivedBuild.otherRyugiLevelInvalidRowIds) {
    const otherRyugi = otherRyugiByRowId.get(rowId);
    const level = build.sectionProps.build.otherRyugi.find(
      (row) => row.rowId === rowId,
    )?.level;
    errorFacts.push({
      code: "other-ryugi-level",
      level,
      rowId,
      subject: otherRyugi?.ryugiName ?? "その他流儀",
    });
  }
  if (build.derivedBuild.hasPointAllocationError) {
    errorFacts.push({ code: "attribute-points" });
  }
  if (build.derivedBuild.hasGrowthError) {
    errorFacts.push({ code: "attribute-growth" });
  }
  for (const rowId of bondsSection.derived.overflowRowIds) {
    const bond = bondsSection.bonds.find((row) => row.rowId === rowId);
    const index = bondsSection.bonds.findIndex((row) => row.rowId === rowId);
    errorFacts.push({
      code: "bonds-over-limit",
      rowId,
      subject: `縁${index + 1}${bond?.target ? `「${bond.target}」` : ""}`,
    });
  }

  if (primarySkills.sectionProps.hasPrimarySkillLevelTotalError) {
    errorFacts.push({ code: "primary-skill-level" });
  }
  addSkillRowFacts(
    errorFacts,
    "primary-skill-maximum-level",
    primarySkills.sectionProps.invalidMaximumLevelRowIds,
    primarySkills.sectionProps.rows,
    "プライマリ流儀スキル",
  );
  addSkillRowFacts(
    errorFacts,
    "primary-skill-duplicate",
    primarySkills.sectionProps.invalidDuplicateSkillRowIds,
    primarySkills.sectionProps.rows,
    "プライマリ流儀スキル",
  );
  addAdvancedSkillRowFacts(
    errorFacts,
    "primary-skill-advanced",
    primarySkills.sectionProps.invalidAdvancedSkillRowIds,
    primarySkills.sectionProps.rows,
    "プライマリ流儀スキル",
    `流儀Lv 6以上が必要です（現在Lv ${build.sectionProps.build.primaryRyugiLevel}）。`,
  );

  if (ikizamaSkills.sectionProps.hasIkizamaSkillLevelTotalError) {
    errorFacts.push({ code: "ikizama-skill-level" });
  }
  addSkillRowFacts(
    errorFacts,
    "ikizama-skill-maximum-level",
    ikizamaSkills.sectionProps.invalidMaximumLevelRowIds,
    [
      ...ikizamaSkills.sectionProps.rows,
      ...(ikizamaSkills.sectionProps.bonusSkill === null
        ? []
        : [
            {
              level: ikizamaSkills.sectionProps.bonusLevel,
              rowId: `ikizama-bonus-${ikizamaSkills.sectionProps.bonusSkill.id}`,
              skill: ikizamaSkills.sectionProps.bonusSkill,
            },
          ]),
    ],
    "生き様スキル",
  );
  addSkillRowFacts(
    errorFacts,
    "ikizama-skill-duplicate",
    ikizamaSkills.sectionProps.invalidDuplicateSkillRowIds,
    ikizamaSkills.sectionProps.rows,
    "生き様スキル",
  );
  addAdvancedSkillRowFacts(
    errorFacts,
    "ikizama-skill-advanced",
    ikizamaSkills.sectionProps.invalidAdvancedSkillRowIds,
    ikizamaSkills.sectionProps.rows,
    "生き様スキル",
    `生き様Lv 4以上が必要です（現在Lv ${build.sectionProps.build.ikizamaLevel}）。`,
  );

  if (commonSkills.sectionProps.hasCommonSkillLevelError) {
    errorFacts.push({ code: "common-skill-level" });
  }
  addSkillRowFacts(
    errorFacts,
    "common-skill-maximum-level",
    commonSkills.sectionProps.invalidMaximumLevelRowIds,
    commonSkills.sectionProps.rows,
    "共通スキル",
  );
  addSkillRowFacts(
    errorFacts,
    "common-skill-duplicate",
    commonSkills.sectionProps.invalidDuplicateSkillRowIds,
    commonSkills.sectionProps.rows,
    "共通スキル",
  );
  addAdvancedSkillRowFacts(
    errorFacts,
    "common-skill-advanced",
    commonSkills.sectionProps.invalidAdvancedSkillRowIds,
    commonSkills.sectionProps.rows,
    "共通スキル",
    `共通スキル上限 6以上が必要です（現在上限 ${commonSkills.sectionProps.levelLimit}）。`,
  );

  for (const section of otherRyugiSkills.sectionProps.sections) {
    if (section.hasSkillLevelTotalError) {
      errorFacts.push({
        code: "other-ryugi-skill-level",
        rowId: section.ryugiRowId,
        subject: section.ryugiName ?? "その他流儀スキル",
      });
    }
    addSkillRowFacts(
      errorFacts,
      "other-ryugi-skill-maximum-level",
      section.invalidMaximumLevelRowIds,
      section.rows,
      `その他流儀「${section.ryugiName ?? "未選択"}」のスキル`,
    );
    addSkillRowFacts(
      errorFacts,
      "other-ryugi-skill-duplicate",
      section.invalidDuplicateSkillRowIds,
      section.rows,
      `その他流儀「${section.ryugiName ?? "未選択"}」のスキル`,
    );
    const otherRyugiLevel = build.sectionProps.build.otherRyugi.find(
      (row) => row.rowId === section.ryugiRowId,
    )?.level;
    addAdvancedSkillRowFacts(
      errorFacts,
      "other-ryugi-skill-advanced",
      section.invalidAdvancedSkillRowIds,
      section.rows,
      `その他流儀「${section.ryugiName ?? "未選択"}」のスキル`,
      `流儀Lv 6以上が必要です（現在Lv ${otherRyugiLevel ?? 0}）。`,
    );
  }

  const cyberneticPartLabels = {
    arm: "腕部",
    head: "頭部",
    leg: "脚部",
    torso: "胴体",
  } as const;
  for (const row of cybernetics.fixedRows) {
    if (!row.hasPartError) continue;
    errorFacts.push({
      code: "cybernetics-part",
      rowId: row.rowId,
      subject: `${cyberneticPartLabels[row.part]}「${row.cybernetic?.name ?? "未選択"}」`,
    });
  }
  if (cybernetics.derived.hasImplantLimitError) {
    errorFacts.push({ code: "cybernetics-implant-limit" });
  }
  if (nanomachines.derived.hasImplantLimitError) {
    errorFacts.push({ code: "nanomachines-implant-limit" });
  }
  for (const row of drugs.rows) {
    if (!row.hasDuplicateSelection) continue;
    errorFacts.push({
      code: "drugs-duplicate",
      rowId: row.rowId,
      subject: `ドラッグ「${row.drug?.name ?? "未選択"}」`,
    });
  }

  return getCharacterSheetErrorSummary({ facts: errorFacts });
}

/** Derives the root error-summary ViewModel from existing section state. */
export default function useCharacterSheetErrorSummary({
  bondsSection,
  build,
  commonSkills,
  cybernetics,
  drugs,
  ikizamaSkills,
  nanomachines,
  otherRyugiSkills,
  primarySkills,
  profileSection,
}: ErrorSummarySources): CharacterSheetErrorSummary {
  return useMemo(
    () =>
      createCharacterSheetErrorSummary({
        bondsSection,
        build,
        commonSkills,
        cybernetics,
        drugs,
        ikizamaSkills,
        nanomachines,
        otherRyugiSkills,
        primarySkills,
        profileSection,
      }),
    [
      bondsSection,
      build,
      commonSkills,
      cybernetics,
      drugs,
      ikizamaSkills,
      nanomachines,
      otherRyugiSkills,
      primarySkills,
      profileSection,
    ],
  );
}

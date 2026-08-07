import type { Ikizama } from "../../lib/types/ikizama";
import type { Ryugi } from "../../lib/types/ryugi";
import {
  type AttributeName,
  attributeNames,
  type BuildValues,
} from "../form/values";

export type BuildSources = {
  ikizama: Ikizama | null;
  primaryRyugi: Ryugi | null;
};

export type AttributeDerivedValues = {
  base: number | null;
  permanent: number | null;
  temporary: number | null;
};

export type BuildReferenceValues = {
  commonSkillBonuses: Ryugi["commonSkillBonuses"] | null;
  ikizamaHealthCoefficient: number | null;
  ikizamaMindCoefficient: number | null;
  primaryHealthIncrease: number | null;
  primaryMindIncrease: number | null;
};

export type BuildDerivedValues = {
  attributes: Record<AttributeName, AttributeDerivedValues>;
  growthPoints: number;
  hasAttributeError: boolean;
  hasBuildError: boolean;
  hasExperienceError: boolean;
  hasGrowthError: boolean;
  hasPointAllocationError: boolean;
  hasRyugiError: boolean;
  ikizamaAttributePoints: readonly number[] | null;
  ikizamaLevelInvalid: boolean;
  otherRyugiDuplicateRowIds: readonly string[];
  otherRyugiLevelInvalidRowIds: readonly string[];
  primaryRyugiDuplicate: boolean;
  primaryRyugiLevelInvalid: boolean;
  primaryRyugiLevel: number;
  rank: number;
  reference: BuildReferenceValues;
  remainingExperience: number;
  spentExperience: number;
};

function isSamePointAllocation(build: BuildValues, ikizama: Ikizama): boolean {
  const actual = attributeNames
    .map((attribute) => build.attributes[attribute].points)
    .sort((left, right) => left - right);
  const expected = [...ikizama.attributePoints, 0].sort(
    (left, right) => left - right,
  );

  return actual.every((value, index) => value === expected[index]);
}

function getIkizamaCoefficients(ikizama: Ikizama, level: number) {
  if (level < 1) {
    return { health: 0, mind: 0 };
  }

  if (level < 4) {
    return ikizama.secondaryAttributeCoefficients.level1;
  }

  if (level < 10) {
    return ikizama.secondaryAttributeCoefficients.level4;
  }

  return ikizama.secondaryAttributeCoefficients.level10;
}

/** Derives build values from form values and already-resolved master data. */
export function calculateBuild(
  build: BuildValues,
  { ikizama, primaryRyugi }: BuildSources,
  commonSkillLevelTotal = 0,
): BuildDerivedValues {
  const primaryLevelInvalid = build.primaryRyugiLevel < 1;
  const ikizamaLevelInvalid = build.ikizamaLevel < 1;
  const otherRyugiIds = build.otherRyugi.flatMap((otherRyugi) =>
    otherRyugi.ryugiId === null ? [] : [otherRyugi.ryugiId],
  );
  const otherRyugiIdCounts = new Map<string, number>();

  for (const ryugiId of otherRyugiIds) {
    otherRyugiIdCounts.set(ryugiId, (otherRyugiIdCounts.get(ryugiId) ?? 0) + 1);
  }

  const hasPrimaryDuplicate =
    build.primaryRyugiId !== null &&
    otherRyugiIds.includes(build.primaryRyugiId);
  const otherRyugiDuplicateRowIds = build.otherRyugi.flatMap((otherRyugi) => {
    if (otherRyugi.ryugiId === null) {
      return [];
    }

    return (otherRyugiIdCounts.get(otherRyugi.ryugiId) ?? 0) > 1 ||
      otherRyugi.ryugiId === build.primaryRyugiId
      ? [otherRyugi.rowId]
      : [];
  });
  const otherRyugiLevelInvalidRowIds = build.otherRyugi.flatMap((otherRyugi) =>
    otherRyugi.ryugiId !== null && otherRyugi.level < 0
      ? [otherRyugi.rowId]
      : [],
  );
  const hasRyugiError =
    primaryLevelInvalid ||
    ikizamaLevelInvalid ||
    hasPrimaryDuplicate ||
    otherRyugiDuplicateRowIds.length > 0 ||
    otherRyugiLevelInvalidRowIds.length > 0;
  const hasInvalidAcquiredExperience = build.acquiredExperience < 0;
  const rank = build.primaryRyugiLevel + build.ikizamaLevel;
  const growthOpportunities = Math.max(0, Math.floor(rank / 15));
  const growthPoints = (growthOpportunities * (growthOpportunities + 1)) / 2;
  const usedGrowthPoints = attributeNames.reduce(
    (total, attribute) => total + build.attributes[attribute].growth,
    0,
  );
  const hasPointAllocationError =
    ikizama !== null &&
    (!isSamePointAllocation(build, ikizama) ||
      attributeNames.some(
        (attribute) => build.attributes[attribute].points < 0,
      ));
  const hasGrowthError =
    usedGrowthPoints > growthPoints ||
    attributeNames.some(
      (attribute) =>
        build.attributes[attribute].growth < 0 ||
        build.attributes[attribute].growth > growthOpportunities,
    );
  const hasAttributeError = hasPointAllocationError || hasGrowthError;
  const spentExperience =
    (primaryRyugi === null
      ? 0
      : Math.max(0, build.primaryRyugiLevel - 1) * 10) +
    (ikizama === null ? 0 : Math.max(0, build.ikizamaLevel - 1) * 10) +
    build.otherRyugi.reduce(
      (total, otherRyugi) =>
        total +
        (otherRyugi.ryugiId === null ? 0 : Math.max(0, otherRyugi.level) * 10),
      0,
    ) +
    commonSkillLevelTotal * 5;
  const remainingExperience = build.acquiredExperience - spentExperience;
  const hasExperienceError =
    hasInvalidAcquiredExperience || remainingExperience < 0;
  const attributes = Object.fromEntries(
    attributeNames.map((attribute) => {
      const values = build.attributes[attribute];
      const base = primaryRyugi?.baseAttributes[attribute] ?? null;
      const permanent =
        base === null || ikizama === null
          ? null
          : base + values.points + values.growth + values.permanentModifier;

      return [
        attribute,
        {
          base,
          permanent,
          temporary:
            permanent === null ? null : permanent + values.temporaryModifier,
        },
      ];
    }),
  ) as Record<AttributeName, AttributeDerivedValues>;
  const ikizamaCoefficients =
    ikizama === null
      ? null
      : getIkizamaCoefficients(ikizama, build.ikizamaLevel);

  return {
    attributes,
    growthPoints,
    hasAttributeError,
    hasBuildError: hasRyugiError || hasAttributeError || hasExperienceError,
    hasExperienceError,
    hasGrowthError,
    hasPointAllocationError,
    hasRyugiError,
    ikizamaAttributePoints:
      ikizama === null ? null : [...ikizama.attributePoints],
    ikizamaLevelInvalid,
    otherRyugiDuplicateRowIds,
    otherRyugiLevelInvalidRowIds,
    primaryRyugiDuplicate: hasPrimaryDuplicate,
    primaryRyugiLevel: build.primaryRyugiLevel,
    primaryRyugiLevelInvalid: primaryLevelInvalid,
    rank,
    reference: {
      commonSkillBonuses: primaryRyugi?.commonSkillBonuses ?? null,
      ikizamaHealthCoefficient: ikizamaCoefficients?.health ?? null,
      ikizamaMindCoefficient: ikizamaCoefficients?.mind ?? null,
      primaryHealthIncrease: primaryRyugi?.healthIncrease ?? null,
      primaryMindIncrease: primaryRyugi?.mindIncrease ?? null,
    },
    remainingExperience,
    spentExperience,
  };
}

import { getIkizamaById } from "../../lib/data/ikizama";
import { getRyugiById } from "../../lib/data/ryugi-list";
import type { Ikizama } from "../../lib/types/ikizama";
import type { Ryugi } from "../../lib/types/ryugi";
import {
  type AttributeName,
  attributeNames,
  type BuildValues,
} from "../form-values";

type BuildSources = {
  ikizama: Ikizama | undefined;
  primaryRyugi: Ryugi | undefined;
};

export type AttributeDerivedValues = {
  base: number | null;
  permanent: number | null;
  temporary: number | null;
};

export type BuildReferenceValues = {
  commonSkillBonuses: Ryugi["commonSkillBonuses"] | null;
  commonSkillLevel: number;
  commonSkillLevelLimit: number | null;
  ikizamaHealthCoefficient: number | null;
  ikizamaMindCoefficient: number | null;
  primaryHealthIncrease: number | null;
  primaryMindIncrease: number | null;
};

export type BuildDerivedValues = {
  attributes: Record<AttributeName, AttributeDerivedValues>;
  growthPoints: number | null;
  hasAttributeError: boolean;
  hasBuildError: boolean;
  hasExperienceError: boolean;
  hasGrowthError: boolean;
  hasPointAllocationError: boolean;
  hasRyugiError: boolean;
  ikizamaAttributePoints: readonly number[];
  ikizamaLevelInvalid: boolean;
  otherRyugiDuplicateRowIds: readonly string[];
  otherRyugiLevelInvalidRowIds: readonly string[];
  primaryRyugiDuplicate: boolean;
  primaryRyugiLevelInvalid: boolean;
  rank: number | null;
  reference: BuildReferenceValues;
  remainingExperience: number | null;
  spentExperience: number | null;
};

const emptyAttributeValues: AttributeDerivedValues = {
  base: null,
  permanent: null,
  temporary: null,
};

function getSources(build: BuildValues): BuildSources {
  return {
    ikizama:
      build.ikizamaId === null ? undefined : getIkizamaById(build.ikizamaId),
    primaryRyugi:
      build.primaryRyugiId === null
        ? undefined
        : getRyugiById(build.primaryRyugiId),
  };
}

const emptyReferenceValues: BuildReferenceValues = {
  commonSkillBonuses: null,
  commonSkillLevel: 0,
  commonSkillLevelLimit: null,
  ikizamaHealthCoefficient: null,
  ikizamaMindCoefficient: null,
  primaryHealthIncrease: null,
  primaryMindIncrease: null,
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

function createEmptyAttributes(): Record<
  AttributeName,
  AttributeDerivedValues
> {
  return Object.fromEntries(
    attributeNames.map((attribute) => [attribute, emptyAttributeValues]),
  ) as Record<AttributeName, AttributeDerivedValues>;
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

/** Derives G7-only build values without depending on React or form state. */
export function calculateBuild(build: BuildValues): BuildDerivedValues {
  const { ikizama, primaryRyugi } = getSources(build);
  const hasSelectedBuild = ikizama !== undefined && primaryRyugi !== undefined;
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

  if (!hasSelectedBuild) {
    return {
      attributes: createEmptyAttributes(),
      growthPoints: null,
      hasAttributeError: false,
      hasBuildError: hasRyugiError || hasInvalidAcquiredExperience,
      hasExperienceError: hasInvalidAcquiredExperience,
      hasGrowthError: false,
      hasPointAllocationError: false,
      hasRyugiError,
      ikizamaAttributePoints: [0, 0, 0, 0],
      ikizamaLevelInvalid,
      otherRyugiDuplicateRowIds,
      otherRyugiLevelInvalidRowIds,
      primaryRyugiDuplicate: hasPrimaryDuplicate,
      primaryRyugiLevelInvalid: primaryLevelInvalid,
      rank: null,
      reference: emptyReferenceValues,
      remainingExperience: null,
      spentExperience: null,
    };
  }

  const rank = build.primaryRyugiLevel + build.ikizamaLevel;
  const growthPoints = Math.max(0, Math.floor(rank / 15));
  const usedGrowthPoints = attributeNames.reduce(
    (total, attribute) => total + build.attributes[attribute].growth,
    0,
  );
  const hasPointAllocationError =
    !isSamePointAllocation(build, ikizama) ||
    attributeNames.some((attribute) => build.attributes[attribute].points < 0);
  const hasGrowthError =
    usedGrowthPoints > growthPoints ||
    attributeNames.some((attribute) => build.attributes[attribute].growth < 0);
  const hasAttributeError = hasPointAllocationError || hasGrowthError;
  const spentExperience =
    Math.max(0, build.primaryRyugiLevel - 1) * 10 +
    Math.max(0, build.ikizamaLevel - 1) * 10 +
    build.otherRyugi.reduce(
      (total, otherRyugi) =>
        total +
        (otherRyugi.ryugiId === null ? 0 : Math.max(0, otherRyugi.level) * 10),
      0,
    );
  const remainingExperience = build.acquiredExperience - spentExperience;
  const hasExperienceError =
    hasInvalidAcquiredExperience || remainingExperience < 0;
  const attributes = Object.fromEntries(
    attributeNames.map((attribute) => {
      const values = build.attributes[attribute];
      const base = primaryRyugi.baseAttributes[attribute];
      const permanent =
        base + values.points + values.growth + values.permanentModifier;

      return [
        attribute,
        {
          base,
          permanent,
          temporary: permanent + values.temporaryModifier,
        },
      ];
    }),
  ) as Record<AttributeName, AttributeDerivedValues>;
  const ikizamaCoefficients = getIkizamaCoefficients(
    ikizama,
    build.ikizamaLevel,
  );

  return {
    attributes,
    growthPoints,
    hasAttributeError,
    hasBuildError: hasRyugiError || hasAttributeError || hasExperienceError,
    hasExperienceError,
    hasGrowthError,
    hasPointAllocationError,
    hasRyugiError,
    ikizamaAttributePoints: [...ikizama.attributePoints],
    ikizamaLevelInvalid,
    otherRyugiDuplicateRowIds,
    otherRyugiLevelInvalidRowIds,
    primaryRyugiDuplicate: hasPrimaryDuplicate,
    primaryRyugiLevelInvalid: primaryLevelInvalid,
    rank,
    reference: {
      commonSkillBonuses: primaryRyugi.commonSkillBonuses,
      commonSkillLevel: 0,
      commonSkillLevelLimit: Math.ceil(rank / 2),
      ikizamaHealthCoefficient: ikizamaCoefficients.health,
      ikizamaMindCoefficient: ikizamaCoefficients.mind,
      primaryHealthIncrease: primaryRyugi.healthIncrease,
      primaryMindIncrease: primaryRyugi.mindIncrease,
    },
    remainingExperience,
    spentExperience,
  };
}

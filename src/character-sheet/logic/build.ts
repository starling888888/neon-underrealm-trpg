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

export type BuildDerivedValues = {
  attributes: Record<AttributeName, AttributeDerivedValues>;
  growthPoints: number | null;
  hasAttributeError: boolean;
  hasBuildError: boolean;
  hasExperienceError: boolean;
  hasRyugiError: boolean;
  ikizamaAttributePoints: readonly number[];
  ikizamaLevelInvalid: boolean;
  ikizamaName: string | null;
  otherRyugiDuplicateRowIds: readonly string[];
  otherRyugiLevelInvalidRowIds: readonly string[];
  primaryRyugiDuplicate: boolean;
  primaryRyugiLevelInvalid: boolean;
  rank: number | null;
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
      hasRyugiError,
      ikizamaAttributePoints: [0, 0, 0, 0],
      ikizamaLevelInvalid,
      ikizamaName: null,
      otherRyugiDuplicateRowIds,
      otherRyugiLevelInvalidRowIds,
      primaryRyugiDuplicate: hasPrimaryDuplicate,
      primaryRyugiLevelInvalid: primaryLevelInvalid,
      rank: null,
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
  const hasNegativeAttributeValue = attributeNames.some((attribute) => {
    const values = build.attributes[attribute];
    return values.points < 0 || values.growth < 0;
  });
  const hasAttributeError =
    !isSamePointAllocation(build, ikizama) ||
    usedGrowthPoints > growthPoints ||
    hasNegativeAttributeValue;
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

  return {
    attributes,
    growthPoints,
    hasAttributeError,
    hasBuildError: hasRyugiError || hasAttributeError || hasExperienceError,
    hasExperienceError,
    hasRyugiError,
    ikizamaAttributePoints: [...ikizama.attributePoints],
    ikizamaLevelInvalid,
    ikizamaName: ikizama.name,
    otherRyugiDuplicateRowIds,
    otherRyugiLevelInvalidRowIds,
    primaryRyugiDuplicate: hasPrimaryDuplicate,
    primaryRyugiLevelInvalid: primaryLevelInvalid,
    rank,
    remainingExperience,
    spentExperience,
  };
}

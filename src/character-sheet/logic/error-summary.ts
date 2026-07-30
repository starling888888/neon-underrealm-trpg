import type { BuildDerivedValues } from "./build";
import type { CreditSummary } from "./credit";

export type CharacterSheetErrorCode =
  | "attribute-growth"
  | "attribute-points"
  | "bonds-over-limit"
  | "common-skill-duplicate"
  | "common-skill-level"
  | "common-skill-maximum-level"
  | "credit"
  | "cybernetics-implant-limit"
  | "cybernetics-part"
  | "drugs-duplicate"
  | "experience"
  | "ikizama-level"
  | "ikizama-skill-advanced"
  | "ikizama-skill-duplicate"
  | "ikizama-skill-level"
  | "ikizama-skill-maximum-level"
  | "nanomachines-implant-limit"
  | "other-ryugi-duplicate"
  | "other-ryugi-level"
  | "other-ryugi-skill-advanced"
  | "other-ryugi-skill-duplicate"
  | "other-ryugi-skill-level"
  | "other-ryugi-skill-maximum-level"
  | "primary-ryugi-duplicate"
  | "primary-ryugi-level"
  | "primary-skill-advanced"
  | "primary-skill-duplicate"
  | "primary-skill-level"
  | "primary-skill-maximum-level";

export type CharacterSheetErrorSummary = {
  errors: readonly CharacterSheetError[];
  hasErrors: boolean;
};

export type CharacterSheetError = {
  code: CharacterSheetErrorCode;
  message: string;
};

export type CharacterSheetErrorSummaryInput = {
  bonds: { hasOverLimitError: boolean };
  build: Pick<
    BuildDerivedValues,
    | "hasExperienceError"
    | "hasGrowthError"
    | "hasPointAllocationError"
    | "ikizamaLevelInvalid"
    | "otherRyugiDuplicateRowIds"
    | "otherRyugiLevelInvalidRowIds"
    | "primaryRyugiDuplicate"
    | "primaryRyugiLevelInvalid"
  >;
  commonSkills: {
    hasLevelError: boolean;
    hasMaximumLevelError: boolean;
    hasDuplicateError: boolean;
  };
  credit: Pick<CreditSummary, "hasCreditError">;
  cybernetics: {
    hasImplantLimitError: boolean;
    hasPartError: boolean;
  };
  drugs: { hasDuplicateError: boolean };
  ikizamaSkills: {
    hasAdvancedError: boolean;
    hasDuplicateError: boolean;
    hasLevelError: boolean;
    hasMaximumLevelError: boolean;
  };
  nanomachines: { hasImplantLimitError: boolean };
  otherRyugiSkills: {
    hasAdvancedError: boolean;
    hasDuplicateError: boolean;
    hasLevelError: boolean;
    hasMaximumLevelError: boolean;
  };
  primarySkills: {
    hasAdvancedError: boolean;
    hasDuplicateError: boolean;
    hasLevelError: boolean;
    hasMaximumLevelError: boolean;
  };
};

const errorMessages = {
  "attribute-growth": "能力値の成長点が使用可能点を超えているか、負の値です。",
  "attribute-points":
    "能力値ポイントの割り振りが生き様の指定と一致していません。",
  "bonds-over-limit": "入力済みの縁が結べる縁の上限を超えています。",
  "common-skill-duplicate": "共通スキルに重複した選択があります。",
  "common-skill-level": "共通スキルの取得合計レベルが上限を超えています。",
  "common-skill-maximum-level": "共通スキルに取得可能レベル外の値があります。",
  credit: "消費信用が合計信用を超えています。",
  "cybernetics-implant-limit":
    "サイバネの埋め込み点数合計が上限を超えています。",
  "cybernetics-part": "サイバネの固定部位と選択した部位が一致していません。",
  "drugs-duplicate": "ドラッグに重複した選択があります。",
  experience: "消費経験点が取得経験点を超えているか、取得経験点が不正です。",
  "ikizama-level": "生き様のレベルは1以上にしてください。",
  "ikizama-skill-advanced":
    "生き様スキルに現在のレベルでは取得できない上級スキルがあります。",
  "ikizama-skill-duplicate": "生き様スキルに重複した選択があります。",
  "ikizama-skill-level":
    "生き様スキルの取得合計レベルが生き様レベルを超えています。",
  "ikizama-skill-maximum-level":
    "生き様スキルに取得可能レベル外の値があります。",
  "nanomachines-implant-limit":
    "ナノマシンの埋め込み点数合計が上限を超えています。",
  "other-ryugi-duplicate":
    "その他流儀にプライマリ流儀との重複、または同じ流儀の重複があります。",
  "other-ryugi-level": "その他流儀のレベルに負の値があります。",
  "other-ryugi-skill-advanced":
    "その他流儀スキルに現在のレベルでは取得できない上級スキルがあります。",
  "other-ryugi-skill-duplicate": "その他流儀スキルに重複した選択があります。",
  "other-ryugi-skill-level":
    "その他流儀スキルの取得合計レベルが流儀レベルを超えています。",
  "other-ryugi-skill-maximum-level":
    "その他流儀スキルに取得可能レベル外の値があります。",
  "primary-ryugi-duplicate": "プライマリ流儀がその他流儀と重複しています。",
  "primary-ryugi-level": "プライマリ流儀のレベルは1以上にしてください。",
  "primary-skill-advanced":
    "プライマリ流儀スキルに現在のレベルでは取得できない上級スキルがあります。",
  "primary-skill-duplicate": "プライマリ流儀スキルに重複した選択があります。",
  "primary-skill-level":
    "プライマリ流儀スキルの取得合計レベルが流儀レベルを超えています。",
  "primary-skill-maximum-level":
    "プライマリ流儀スキルに取得可能レベル外の値があります。",
} as const satisfies Record<CharacterSheetErrorCode, string>;

/** Translates stable game-rule error identifiers for the summary UI. */
export function translateCharacterSheetError(
  code: CharacterSheetErrorCode,
): string {
  return errorMessages[code];
}

function hasAny(values: readonly unknown[]): boolean {
  return values.length > 0;
}

/** Collects existing local game-rule violations in a stable display order. */
export function getCharacterSheetErrorSummary({
  bonds,
  build,
  commonSkills,
  credit,
  cybernetics,
  drugs,
  ikizamaSkills,
  nanomachines,
  otherRyugiSkills,
  primarySkills,
}: CharacterSheetErrorSummaryInput): CharacterSheetErrorSummary {
  const codes: CharacterSheetErrorCode[] = [
    ...(build.hasExperienceError ? ["experience" as const] : []),
    ...(credit.hasCreditError ? ["credit" as const] : []),
    ...(build.primaryRyugiLevelInvalid ? ["primary-ryugi-level" as const] : []),
    ...(build.ikizamaLevelInvalid ? ["ikizama-level" as const] : []),
    ...(build.primaryRyugiDuplicate
      ? ["primary-ryugi-duplicate" as const]
      : []),
    ...(hasAny(build.otherRyugiDuplicateRowIds)
      ? ["other-ryugi-duplicate" as const]
      : []),
    ...(hasAny(build.otherRyugiLevelInvalidRowIds)
      ? ["other-ryugi-level" as const]
      : []),
    ...(build.hasPointAllocationError ? ["attribute-points" as const] : []),
    ...(build.hasGrowthError ? ["attribute-growth" as const] : []),
    ...(bonds.hasOverLimitError ? ["bonds-over-limit" as const] : []),
    ...(primarySkills.hasLevelError ? ["primary-skill-level" as const] : []),
    ...(primarySkills.hasMaximumLevelError
      ? ["primary-skill-maximum-level" as const]
      : []),
    ...(primarySkills.hasDuplicateError
      ? ["primary-skill-duplicate" as const]
      : []),
    ...(primarySkills.hasAdvancedError
      ? ["primary-skill-advanced" as const]
      : []),
    ...(ikizamaSkills.hasLevelError ? ["ikizama-skill-level" as const] : []),
    ...(ikizamaSkills.hasMaximumLevelError
      ? ["ikizama-skill-maximum-level" as const]
      : []),
    ...(ikizamaSkills.hasDuplicateError
      ? ["ikizama-skill-duplicate" as const]
      : []),
    ...(ikizamaSkills.hasAdvancedError
      ? ["ikizama-skill-advanced" as const]
      : []),
    ...(commonSkills.hasLevelError ? ["common-skill-level" as const] : []),
    ...(commonSkills.hasMaximumLevelError
      ? ["common-skill-maximum-level" as const]
      : []),
    ...(commonSkills.hasDuplicateError
      ? ["common-skill-duplicate" as const]
      : []),
    ...(otherRyugiSkills.hasLevelError
      ? ["other-ryugi-skill-level" as const]
      : []),
    ...(otherRyugiSkills.hasMaximumLevelError
      ? ["other-ryugi-skill-maximum-level" as const]
      : []),
    ...(otherRyugiSkills.hasDuplicateError
      ? ["other-ryugi-skill-duplicate" as const]
      : []),
    ...(otherRyugiSkills.hasAdvancedError
      ? ["other-ryugi-skill-advanced" as const]
      : []),
    ...(cybernetics.hasPartError ? ["cybernetics-part" as const] : []),
    ...(cybernetics.hasImplantLimitError
      ? ["cybernetics-implant-limit" as const]
      : []),
    ...(nanomachines.hasImplantLimitError
      ? ["nanomachines-implant-limit" as const]
      : []),
    ...(drugs.hasDuplicateError ? ["drugs-duplicate" as const] : []),
  ];
  const errors = codes.map((code) => ({
    code,
    message: translateCharacterSheetError(code),
  }));

  return { errors, hasErrors: errors.length > 0 };
}

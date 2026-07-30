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
  | "other-ryugi-level"
  | "other-ryugi-skill-advanced"
  | "other-ryugi-skill-duplicate"
  | "other-ryugi-skill-level"
  | "other-ryugi-skill-maximum-level"
  | "primary-ryugi-level"
  | "primary-skill-advanced"
  | "primary-skill-duplicate"
  | "primary-skill-level"
  | "primary-skill-maximum-level"
  | "ryugi-duplicate";

export type CharacterSheetErrorFact = {
  code: CharacterSheetErrorCode;
  level?: number;
  rowId?: string;
  subject?: string;
};

export type CharacterSheetErrorSummary = {
  errors: readonly CharacterSheetError[];
  hasErrors: boolean;
};

export type CharacterSheetError = CharacterSheetErrorFact & {
  message: string;
};

export type CharacterSheetErrorSummaryInput = {
  facts: readonly CharacterSheetErrorFact[];
};

const errorMessages = {
  "attribute-growth": "能力値の成長点が使用可能点を超えているか、負の値です。",
  "attribute-points":
    "能力値ポイントの割り振りが生き様の指定と一致していません。",
  "bonds-over-limit": "結べる縁の上限を超えています。",
  "common-skill-duplicate": "共通スキルに重複した選択があります。",
  "common-skill-level": "共通スキルの取得合計レベルが上限を超えています。",
  "common-skill-maximum-level": "取得可能レベル外の値があります。",
  credit: "消費信用が合計信用を超えています。",
  "cybernetics-implant-limit":
    "サイバネの埋め込み点数合計が上限を超えています。",
  "cybernetics-part": "固定部位と選択した部位が一致していません。",
  "drugs-duplicate": "重複した選択があります。",
  experience: "消費経験点が取得経験点を超えているか、取得経験点が不正です。",
  "ikizama-level": "生き様のレベルは1以上にしてください。",
  "ikizama-skill-advanced":
    "現在のレベルでは取得できない上級スキルがあります。",
  "ikizama-skill-duplicate": "重複した選択があります。",
  "ikizama-skill-level": "取得合計レベルが生き様レベルを超えています。",
  "ikizama-skill-maximum-level": "取得可能レベル外の値があります。",
  "nanomachines-implant-limit":
    "ナノマシンの埋め込み点数合計が上限を超えています。",
  "other-ryugi-level": "レベルに負の値があります。",
  "other-ryugi-skill-advanced":
    "現在のレベルでは取得できない上級スキルがあります。",
  "other-ryugi-skill-duplicate": "重複した選択があります。",
  "other-ryugi-skill-level": "取得合計レベルが流儀レベルを超えています。",
  "other-ryugi-skill-maximum-level": "取得可能レベル外の値があります。",
  "primary-ryugi-level": "プライマリ流儀のレベルは1以上にしてください。",
  "primary-skill-advanced":
    "現在のレベルでは取得できない上級スキルがあります。",
  "primary-skill-duplicate": "重複した選択があります。",
  "primary-skill-level": "取得合計レベルが流儀レベルを超えています。",
  "primary-skill-maximum-level": "取得可能レベル外の値があります。",
  "ryugi-duplicate": "流儀が重複しています。",
} as const satisfies Record<CharacterSheetErrorCode, string>;

const errorCodeOrder: readonly CharacterSheetErrorCode[] = [
  "experience",
  "credit",
  "primary-ryugi-level",
  "ikizama-level",
  "ryugi-duplicate",
  "other-ryugi-level",
  "attribute-points",
  "attribute-growth",
  "bonds-over-limit",
  "primary-skill-level",
  "primary-skill-maximum-level",
  "primary-skill-duplicate",
  "primary-skill-advanced",
  "ikizama-skill-level",
  "ikizama-skill-maximum-level",
  "ikizama-skill-duplicate",
  "ikizama-skill-advanced",
  "common-skill-level",
  "common-skill-maximum-level",
  "common-skill-duplicate",
  "other-ryugi-skill-level",
  "other-ryugi-skill-maximum-level",
  "other-ryugi-skill-duplicate",
  "other-ryugi-skill-advanced",
  "cybernetics-part",
  "cybernetics-implant-limit",
  "nanomachines-implant-limit",
  "drugs-duplicate",
];

const errorCodeRank = new Map(
  errorCodeOrder.map((code, index) => [code, index]),
);

/** Translates a stable game-rule error fact for the summary UI. */
export function translateCharacterSheetError({
  code,
  level,
  subject,
}: CharacterSheetErrorFact): string {
  const target = subject ?? "";
  const currentLevel = level === undefined ? "" : `（Lv ${level}）`;

  return `${target}${currentLevel}${target || currentLevel ? "：" : ""}${errorMessages[code]}`;
}

/** Collects existing local game-rule violations in a stable display order. */
export function getCharacterSheetErrorSummary({
  facts,
}: CharacterSheetErrorSummaryInput): CharacterSheetErrorSummary {
  const errors = facts
    .map((fact, index) => ({ fact, index }))
    .sort(
      (left, right) =>
        (errorCodeRank.get(left.fact.code) ?? Number.MAX_SAFE_INTEGER) -
          (errorCodeRank.get(right.fact.code) ?? Number.MAX_SAFE_INTEGER) ||
        left.index - right.index,
    )
    .map(({ fact }) => ({
      ...fact,
      message: translateCharacterSheetError(fact),
    }));

  return { errors, hasErrors: errors.length > 0 };
}

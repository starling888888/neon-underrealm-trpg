export const characterSheetSectionNavigationItems = [
  { id: "profile", label: "基本情報" },
  { id: "build", label: "流儀・生き様 / 能力値" },
  { id: "secondary-attributes", label: "副能力値" },
  { id: "bonds", label: "縁" },
  { id: "checks", label: "判定" },
  { id: "skills", label: "スキル" },
  { id: "weapons-and-armor", label: "武器・防具" },
  { id: "special-items", label: "生き様専用アイテム" },
] as const;

export type CharacterSheetSectionId =
  (typeof characterSheetSectionNavigationItems)[number]["id"];

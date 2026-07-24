/**
 * Values owned by react-hook-form for the character sheet.
 *
 * Every field remains serializable and non-null so later Gates can extend this
 * form without introducing a second edit-state store.
 */
export type CharacterSheetFormValues = {
  characterSetting: string;
  nickname: string;
  pcName: string;
  playerName: string;
  age: string;
  gender: string;
  acquiredCredit: number;
  creditProvided: number;
  creditReceived: number;
  changeAdjustment: number;
};

export const characterSheetDefaultValues: CharacterSheetFormValues = {
  characterSetting: "",
  nickname: "",
  pcName: "",
  playerName: "",
  age: "",
  gender: "",
  acquiredCredit: 10,
  creditProvided: 0,
  creditReceived: 0,
  changeAdjustment: 0,
};

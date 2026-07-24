/**
 * Values owned by react-hook-form for the character sheet.
 *
 * Every field remains serializable and non-null so later Gates can extend this
 * form without introducing a second edit-state store.
 */
export type CharacterSheetFormValues = {
  credit: {
    acquired: number;
    changeAdjustment: number;
    provided: number;
    received: number;
  };
  profile: {
    age: string;
    gender: string;
    nickname: string;
    pcName: string;
    playerName: string;
    setting: string;
  };
};

export const characterSheetDefaultValues: CharacterSheetFormValues = {
  credit: {
    acquired: 10,
    changeAdjustment: 0,
    provided: 0,
    received: 0,
  },
  profile: {
    age: "",
    gender: "",
    nickname: "",
    pcName: "",
    playerName: "",
    setting: "",
  },
};

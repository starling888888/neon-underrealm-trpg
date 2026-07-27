/**
 * Values owned by react-hook-form for the character sheet.
 *
 * Every field remains serializable and non-null so later Gates can extend this
 * form without introducing a second edit-state store.
 */
export type CreditValues = {
  acquired: number;
  changeAdjustment: number;
  provided: number;
  received: number;
};

export type CreditFieldName = keyof CreditValues;

export type ProfileValues = {
  age: string;
  gender: string;
  nickname: string;
  pcName: string;
  playerName: string;
  setting: string;
};

export type ProfileFieldName = keyof ProfileValues;

export const attributeNames = [
  "strength",
  "agility",
  "perception",
  "body",
  "mind",
] as const;

export type AttributeName = (typeof attributeNames)[number];

export type AttributeValues = {
  growth: number;
  permanentModifier: number;
  points: number;
  temporaryModifier: number;
};

export type OtherRyugiValues = {
  level: number;
  rowId: string;
  ryugiId: string | null;
};

export type BuildValues = {
  attributes: Record<AttributeName, AttributeValues>;
  ikizamaId: string | null;
  ikizamaLevel: number;
  otherRyugi: OtherRyugiValues[];
  primaryRyugiId: string | null;
  primaryRyugiLevel: number;
  acquiredExperience: number;
};

export type SecondaryAttributeValues = {
  actionCountModifier: number;
  actionModifier: number;
  applyTemporaryAction: boolean;
  applyTemporaryMovement: boolean;
  bondLimitModifier: number;
  healthModifier: number;
  mentalModifier: number;
  movementModifier: number;
};

export type SecondaryAttributeFieldName = keyof SecondaryAttributeValues;

export type CharacterSheetFormValues = {
  build: BuildValues;
  credit: CreditValues;
  profile: ProfileValues;
  secondaryAttributes: SecondaryAttributeValues;
};

export const characterSheetDefaultValues: CharacterSheetFormValues = {
  build: {
    acquiredExperience: 50,
    attributes: {
      strength: {
        growth: 0,
        permanentModifier: 0,
        points: 0,
        temporaryModifier: 0,
      },
      agility: {
        growth: 0,
        permanentModifier: 0,
        points: 0,
        temporaryModifier: 0,
      },
      perception: {
        growth: 0,
        permanentModifier: 0,
        points: 0,
        temporaryModifier: 0,
      },
      body: {
        growth: 0,
        permanentModifier: 0,
        points: 0,
        temporaryModifier: 0,
      },
      mind: {
        growth: 0,
        permanentModifier: 0,
        points: 0,
        temporaryModifier: 0,
      },
    },
    ikizamaId: null,
    ikizamaLevel: 1,
    otherRyugi: [],
    primaryRyugiId: null,
    primaryRyugiLevel: 1,
  },
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
  secondaryAttributes: {
    actionCountModifier: 0,
    actionModifier: 0,
    applyTemporaryAction: false,
    applyTemporaryMovement: false,
    bondLimitModifier: 0,
    healthModifier: 0,
    mentalModifier: 0,
    movementModifier: 0,
  },
};

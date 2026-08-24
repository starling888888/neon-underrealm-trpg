import {
  type NoncombatSkillName,
  noncombatSkills,
} from "../master-data/noncombat-skills";

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

export type OtherRyugiEditableFieldName = "level" | "ryugiId";

export type BuildValues = {
  attributes: Record<AttributeName, AttributeValues>;
  ikizamaId: string | null;
  ikizamaLevel: number;
  otherRyugi: OtherRyugiValues[];
  primaryRyugiId: string | null;
  primaryRyugiLevel: number;
  acquiredExperience: number;
};

export type SkillSelectionRowValues = {
  level: number;
  rowId: string;
  skillId: string | null;
};

export type PrimarySkillsValues = {
  rows: SkillSelectionRowValues[];
};

export type IkizamaSkillsValues = {
  bonusLevel: number;
  rows: SkillSelectionRowValues[];
};

export type CommonSkillsValues = {
  rows: SkillSelectionRowValues[];
};

export type OtherRyugiSkillValues = SkillSelectionRowValues & {
  ryugiRowId: string;
};

export type OtherRyugiSkillsValues = {
  rows: OtherRyugiSkillValues[];
};

export const attackSkillNames = [
  "brawl",
  "assassination",
  "shooting",
  "combat",
  "interference",
] as const;

export type AttackSkillName = (typeof attackSkillNames)[number];

export const reactionCheckNames = [
  "defense",
  "evasion",
  "endurance",
  "resistance",
] as const;

export type ReactionCheckName = (typeof reactionCheckNames)[number];

export type AttackCheckValues = {
  attribute: AttributeName;
  modifier: number;
  rowId: string;
  skill: AttackSkillName;
};

export type ReactionCheckValues = {
  attribute: AttributeName;
  modifier: number;
  name: ReactionCheckName;
  rowId: string;
};

export type NoncombatCheckValues = Record<
  NoncombatSkillName,
  { isFavorite: boolean; modifier: number }
>;

export type ChecksValues = {
  attacks: AttackCheckValues[];
  noncombat: NoncombatCheckValues;
  reactions: ReactionCheckValues[];
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

export type BondValues = {
  isResolved: boolean;
  relation: string;
  rowId: string;
  target: string;
};

export type BondEditableFieldName = Exclude<keyof BondValues, "rowId">;

export const resolveEffectNames = [
  "recovery",
  "morale",
  "activeCheck",
  "passiveCheck",
] as const;

export type ResolveEffectName = (typeof resolveEffectNames)[number];

export type BondsValues = {
  resolveEffectModifiers: Record<ResolveEffectName, number>;
  rows: BondValues[];
};

/** A weapon may be selected more than once, so each row has stable identity. */
export type WeaponValues = {
  attackModifier: number | null;
  guardModifier: number | null;
  rowId: string;
  weaponId: string | null;
};

export type WeaponsValues = {
  rows: WeaponValues[];
};

export type ArmorValues = {
  armorId: string | null;
  damageReductionModifier: number | null;
  defenseModifier: number | null;
};

export type OmamoriRowValues = {
  omamoriId: string | null;
  rowId: string;
};

export type OmamoriValues = {
  rows: OmamoriRowValues[];
};

export const cyberneticFixedPartKeys = ["head", "torso", "arm", "leg"] as const;

export type CyberneticFixedPartKey = (typeof cyberneticFixedPartKeys)[number];

export type CyberneticOtherRowValues = {
  cyberneticId: string | null;
  rowId: string;
};

export type CyberneticsValues = {
  armId: string | null;
  headId: string | null;
  implantLimitModifier: number;
  implantTotalModifier: number;
  legId: string | null;
  otherRows: CyberneticOtherRowValues[];
  torsoId: string | null;
};

export const nanomachineFixedPartKeys = [
  "head",
  "torso",
  "arm",
  "leg",
] as const;

export type NanomachineFixedPartKey = (typeof nanomachineFixedPartKeys)[number];

export type NanomachinesValues = {
  armId: string | null;
  headId: string | null;
  implantLimitModifier: number;
  implantTotalModifier: number;
  legId: string | null;
  torsoId: string | null;
};

export type DrugRowValues = {
  drugId: string | null;
  quantity: number;
  rowId: string;
};

export type DrugsValues = {
  rows: DrugRowValues[];
};

export const specialItemCategoryIds = [
  "omamori",
  "cybernetics",
  "nanomachines",
  "drugs",
] as const;

export type SpecialItemCategoryId = (typeof specialItemCategoryIds)[number];

/** User-controlled visible category order. The ikizama category is derived. */
export type SpecialItemsValues = {
  categories: SpecialItemCategoryId[];
};

function createInitialBondRows(): BondValues[] {
  return Array.from({ length: 4 }, (_, index) => ({
    isResolved: false,
    relation: "",
    rowId: `bond-${index + 1}`,
    target: "",
  }));
}

function createInitialNoncombatChecks(): NoncombatCheckValues {
  return Object.fromEntries(
    noncombatSkills.map((skill) => [
      skill.id,
      { isFavorite: false, modifier: 0 },
    ]),
  ) as NoncombatCheckValues;
}

function createInitialPrimarySkillRows(): SkillSelectionRowValues[] {
  return Array.from({ length: 4 }, (_, index) => ({
    level: 1,
    rowId: `primary-skill-${index + 1}`,
    skillId: null,
  }));
}

function createInitialIkizamaSkillRows(): SkillSelectionRowValues[] {
  return Array.from({ length: 2 }, (_, index) => ({
    level: 1,
    rowId: `ikizama-skill-${index + 1}`,
    skillId: null,
  }));
}

function createInitialCommonSkillRows(): SkillSelectionRowValues[] {
  return Array.from({ length: 2 }, (_, index) => ({
    level: 1,
    rowId: `common-skill-${index + 1}`,
    skillId: null,
  }));
}

function createInitialWeaponRows(): WeaponValues[] {
  return [
    {
      attackModifier: null,
      guardModifier: null,
      rowId: "weapon-1",
      weaponId: null,
    },
  ];
}

function createInitialCyberneticOtherRows(): CyberneticOtherRowValues[] {
  return [{ cyberneticId: null, rowId: "cybernetic-other-1" }];
}

function createInitialDrugRows(): DrugRowValues[] {
  return Array.from({ length: 3 }, (_, index) => ({
    drugId: null,
    quantity: 1,
    rowId: `drug-${index + 1}`,
  }));
}

export type CharacterSheetFormValues = {
  armor: ArmorValues;
  bonds: BondsValues;
  build: BuildValues;
  checks: ChecksValues;
  commonSkills: CommonSkillsValues;
  credit: CreditValues;
  cybernetics: CyberneticsValues;
  drugs: DrugsValues;
  ikizamaSkills: IkizamaSkillsValues;
  nanomachines: NanomachinesValues;
  omamori: OmamoriValues;
  otherRyugiSkills: OtherRyugiSkillsValues;
  primarySkills: PrimarySkillsValues;
  profile: ProfileValues;
  secondaryAttributes: SecondaryAttributeValues;
  specialItems: SpecialItemsValues;
  weapons: WeaponsValues;
};

export const characterSheetDefaultValues: CharacterSheetFormValues = {
  armor: {
    armorId: null,
    damageReductionModifier: null,
    defenseModifier: null,
  },
  bonds: {
    resolveEffectModifiers: {
      activeCheck: 0,
      morale: 0,
      passiveCheck: 0,
      recovery: 0,
    },
    rows: createInitialBondRows(),
  },
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
  checks: {
    attacks: [
      {
        attribute: "strength",
        modifier: 0,
        rowId: "attack-1",
        skill: "brawl",
      },
    ],
    reactions: [
      {
        attribute: "strength",
        modifier: 0,
        name: "defense",
        rowId: "reaction-defense",
      },
      {
        attribute: "strength",
        modifier: 0,
        name: "evasion",
        rowId: "reaction-evasion",
      },
      {
        attribute: "body",
        modifier: 0,
        name: "endurance",
        rowId: "reaction-endurance",
      },
      {
        attribute: "body",
        modifier: 0,
        name: "resistance",
        rowId: "reaction-resistance",
      },
    ],
    noncombat: createInitialNoncombatChecks(),
  },
  commonSkills: {
    rows: createInitialCommonSkillRows(),
  },
  cybernetics: {
    armId: null,
    headId: null,
    implantLimitModifier: 0,
    implantTotalModifier: 0,
    legId: null,
    otherRows: createInitialCyberneticOtherRows(),
    torsoId: null,
  },
  drugs: {
    rows: createInitialDrugRows(),
  },
  nanomachines: {
    armId: null,
    headId: null,
    implantLimitModifier: 0,
    implantTotalModifier: 0,
    legId: null,
    torsoId: null,
  },
  credit: {
    acquired: 10,
    changeAdjustment: 0,
    provided: 0,
    received: 0,
  },
  ikizamaSkills: {
    bonusLevel: 1,
    rows: createInitialIkizamaSkillRows(),
  },
  omamori: {
    rows: [],
  },
  otherRyugiSkills: {
    rows: [],
  },
  primarySkills: {
    rows: createInitialPrimarySkillRows(),
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
  specialItems: {
    categories: [],
  },
  weapons: {
    rows: createInitialWeaponRows(),
  },
};

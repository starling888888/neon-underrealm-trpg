import type { BuildSources } from "../../../../src/character-sheet/logic/build";

export const emptyBuildSources: BuildSources = {
  ikizama: null,
  primaryRyugi: null,
};

export const buildSourcesFixture: BuildSources = {
  ikizama: {
    attributePoints: [5, 4, 3, 2],
    description: "",
    exclusiveItem: { id: "fixture-exclusive", name: "fixture" },
    id: "fixture-ikizama",
    name: "Fixture Ikizama",
    note: null,
    secondaryAttributeCoefficients: {
      level1: { health: 11, mind: 7 },
      level4: { health: 12, mind: 9 },
      level10: { health: 14, mind: 10 },
    },
    shortDescription: "",
    sourceOrder: 0,
  },
  primaryRyugi: {
    baseAttributes: {
      agility: 5,
      body: 3,
      mind: 2,
      perception: 1,
      strength: 5,
    },
    commonSkillBonuses: {
      level2: "攻撃判定数+1\n攻撃力+3",
      level5: "行動回数+1",
      level9: "攻撃判定数+1\nリアクション判定数+1",
    },
    description: "",
    healthIncrease: 5,
    id: "fixture-primary-ryugi",
    mindIncrease: 2,
    name: "Fixture Ryugi",
    note: null,
    shortDescription: "",
    sourceOrder: 0,
  },
};

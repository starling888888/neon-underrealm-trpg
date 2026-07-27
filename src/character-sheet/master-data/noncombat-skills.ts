import type { AttributeName } from "../form-values";

export const noncombatSkills = [
  { attribute: "strength", id: "intimidation", name: "脅迫" },
  { attribute: "strength", id: "strengthContest", name: "力比べ" },
  { attribute: "strength", id: "willpower", name: "根性" },
  { attribute: "agility", id: "reconnaissance", name: "偵察" },
  { attribute: "agility", id: "acrobatics", name: "軽業" },
  { attribute: "agility", id: "sleightOfHand", name: "手業" },
  { attribute: "perception", id: "cheating", name: "イカサマ" },
  { attribute: "perception", id: "dangerSense", name: "危険察知" },
  { attribute: "perception", id: "analysis", name: "分析" },
  { attribute: "body", id: "driving", name: "運転" },
  { attribute: "body", id: "survival", name: "生存" },
  { attribute: "body", id: "jingi", name: "仁義" },
  { attribute: "mind", id: "gambling", name: "賭博" },
  { attribute: "mind", id: "negotiation", name: "交渉" },
  { attribute: "mind", id: "hacking", name: "ハッキング" },
] as const satisfies readonly {
  attribute: AttributeName;
  id: string;
  name: string;
}[];

export type NoncombatSkillName = (typeof noncombatSkills)[number]["id"];

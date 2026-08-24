import type { AttributeName } from "../form/values";

export const noncombatSkills = [
  { attribute: "strength", id: "intimidation" },
  { attribute: "strength", id: "strengthContest" },
  { attribute: "strength", id: "willpower" },
  { attribute: "agility", id: "reconnaissance" },
  { attribute: "agility", id: "acrobatics" },
  { attribute: "agility", id: "sleightOfHand" },
  { attribute: "perception", id: "cheating" },
  { attribute: "perception", id: "dangerSense" },
  { attribute: "perception", id: "analysis" },
  { attribute: "body", id: "driving" },
  { attribute: "body", id: "survival" },
  { attribute: "body", id: "jingi" },
  { attribute: "mind", id: "gambling" },
  { attribute: "mind", id: "negotiation" },
  { attribute: "mind", id: "hacking" },
] as const satisfies readonly {
  attribute: AttributeName;
  id: string;
}[];

export type NoncombatSkillName = (typeof noncombatSkills)[number]["id"];

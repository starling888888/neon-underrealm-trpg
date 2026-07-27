import type { SecondaryAttributeValues } from "../form-values";
import type { AttributeDerivedValues, BuildReferenceValues } from "./build";

export type SecondaryAttributeDerivedValues = {
  actionCount: number;
  actionValue: number | null;
  baseActionCount: number;
  baseActionValue: number | null;
  baseBondLimit: number;
  baseHealth: number | null;
  baseMental: number | null;
  baseMovement: number | null;
  bondLimit: number;
  health: number | null;
  mental: number | null;
  movement: number | null;
};

export type SecondaryAttributeBuildSource = {
  attributes: Record<
    "agility" | "body" | "mind" | "perception",
    AttributeDerivedValues
  >;
  primaryRyugiLevel: number;
  reference: Pick<
    BuildReferenceValues,
    | "ikizamaHealthCoefficient"
    | "ikizamaMindCoefficient"
    | "primaryHealthIncrease"
    | "primaryMindIncrease"
  >;
};

function addModifier(value: number | null, modifier: number): number | null {
  return value === null ? null : value + modifier;
}

/**
 * Derives G8 secondary attributes from G7's selected build and manual modifiers.
 *
 * A future Gate may pass the selected Sumi nanomachine bonus through the third
 * parameter. G8 deliberately uses zero because it does not own that choice.
 */
export function calculateSecondaryAttributes(
  build: SecondaryAttributeBuildSource,
  secondaryAttributes: SecondaryAttributeValues,
  maximumHealthBonus = 0,
): SecondaryAttributeDerivedValues {
  const healthCoefficient = build.reference.ikizamaHealthCoefficient;
  const healthIncrease = build.reference.primaryHealthIncrease;
  const mindCoefficient = build.reference.ikizamaMindCoefficient;
  const mindIncrease = build.reference.primaryMindIncrease;
  const primaryRyugiLevel = build.primaryRyugiLevel;
  const permanentBody = build.attributes.body.permanent;
  const permanentMind = build.attributes.mind.permanent;
  const movementAgility = secondaryAttributes.applyTemporaryMovement
    ? build.attributes.agility.temporary
    : build.attributes.agility.permanent;
  const actionAgility = secondaryAttributes.applyTemporaryAction
    ? build.attributes.agility.temporary
    : build.attributes.agility.permanent;
  const actionPerception = secondaryAttributes.applyTemporaryAction
    ? build.attributes.perception.temporary
    : build.attributes.perception.permanent;
  const baseHealth =
    healthIncrease === null ||
    healthCoefficient === null ||
    permanentBody === null
      ? null
      : healthIncrease * primaryRyugiLevel + healthCoefficient * permanentBody;
  const baseMental =
    mindIncrease === null || mindCoefficient === null || permanentMind === null
      ? null
      : mindIncrease * primaryRyugiLevel + mindCoefficient * permanentMind;
  const baseMovement =
    movementAgility === null ? null : 4 + Math.ceil(movementAgility / 5);
  const baseActionValue =
    actionAgility === null || actionPerception === null
      ? null
      : actionAgility + actionPerception * 2;

  return {
    actionCount: 2 + secondaryAttributes.actionCountModifier,
    actionValue: addModifier(
      baseActionValue,
      secondaryAttributes.actionModifier,
    ),
    baseActionCount: 2,
    baseActionValue,
    baseBondLimit: 4,
    baseHealth,
    baseMental,
    baseMovement,
    bondLimit: 4 + secondaryAttributes.bondLimitModifier,
    health:
      baseHealth === null
        ? null
        : baseHealth + secondaryAttributes.healthModifier + maximumHealthBonus,
    mental: addModifier(baseMental, secondaryAttributes.mentalModifier),
    movement: addModifier(baseMovement, secondaryAttributes.movementModifier),
  };
}

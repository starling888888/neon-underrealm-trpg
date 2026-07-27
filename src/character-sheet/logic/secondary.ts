import type { SecondaryValues } from "../form-values";
import type { BuildDerivedValues } from "./build";

export type SecondaryDerivedValues = {
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

function addModifier(value: number | null, modifier: number): number | null {
  return value === null ? null : value + modifier;
}

/**
 * Derives G8 secondary values from G7's selected build and manual modifiers.
 *
 * A future Gate may pass the selected Sumi nanomachine bonus through the third
 * parameter. G8 deliberately uses zero because it does not own that choice.
 */
export function calculateSecondary(
  build: BuildDerivedValues,
  secondary: SecondaryValues,
  maximumHealthBonus = 0,
): SecondaryDerivedValues {
  const healthCoefficient = build.reference.ikizamaHealthCoefficient;
  const healthIncrease = build.reference.primaryHealthIncrease;
  const mindCoefficient = build.reference.ikizamaMindCoefficient;
  const mindIncrease = build.reference.primaryMindIncrease;
  const primaryRyugiLevel = build.primaryRyugiLevel;
  const permanentBody = build.attributes.body.permanent;
  const permanentMind = build.attributes.mind.permanent;
  const movementAgility = secondary.applyTemporaryMovement
    ? build.attributes.agility.temporary
    : build.attributes.agility.permanent;
  const actionAgility = secondary.applyTemporaryAction
    ? build.attributes.agility.temporary
    : build.attributes.agility.permanent;
  const actionPerception = secondary.applyTemporaryAction
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
    actionCount: 2 + secondary.actionCountModifier,
    actionValue: addModifier(baseActionValue, secondary.actionModifier),
    baseActionCount: 2,
    baseActionValue,
    baseBondLimit: 4,
    baseHealth,
    baseMental,
    baseMovement,
    bondLimit: 4 + secondary.bondLimitModifier,
    health:
      baseHealth === null
        ? null
        : baseHealth + secondary.healthModifier + maximumHealthBonus,
    mental: addModifier(baseMental, secondary.mentalModifier),
    movement: addModifier(baseMovement, secondary.movementModifier),
  };
}

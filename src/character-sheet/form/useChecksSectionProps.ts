import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";

import type { ChecksSectionProps } from "../components/ChecksSection";
import type {
  AttackCheckValues,
  CharacterSheetFormValues,
} from "../form-values";
import type { BuildDerivedValues } from "../logic/build";
import {
  calculateChecks,
  defaultAttributeByAttackSkill,
} from "../logic/checks";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";

export default function useChecksSectionProps(
  { control, getValues, setValue }: UseFormReturn<CharacterSheetFormValues>,
  derivedBuild: BuildDerivedValues,
): ChecksSectionProps {
  const {
    append: appendAttack,
    remove: removeAttack,
    update: updateAttack,
  } = useFieldArray({
    control,
    keyName: "fieldKey",
    name: "checks.attacks",
  });
  const { update: updateReaction } = useFieldArray({
    control,
    keyName: "fieldKey",
    name: "checks.reactions",
  });
  const checks = useWatch({ control, name: "checks" });
  const derived = calculateChecks(checks, derivedBuild.attributes);

  function setAttackRow(
    rowId: string,
    update: (row: AttackCheckValues) => AttackCheckValues,
  ): void {
    const rows = getValues("checks.attacks");
    const index = rows.findIndex((row) => row.rowId === rowId);
    const row = rows[index];
    if (row !== undefined) updateAttack(index, update(row));
  }

  return {
    attacks: derived.attacks,
    onAttackAdd: () => {
      if (getValues("checks.attacks").length >= 5) {
        return;
      }

      const attackNumber = getValues("checks.attacks").length + 1;

      appendAttack({
        attribute: defaultAttributeByAttackSkill.brawl,
        modifier: 0,
        rowId: `attack-${attackNumber}-${crypto.randomUUID()}`,
        skill: "brawl",
      });
    },
    onAttackAttributeChange: (rowId, attribute) => {
      setAttackRow(rowId, (row) => ({ ...row, attribute }));
    },
    onAttackModifierChange: (rowId, value) => {
      const normalizedValue = normalizeIntegerInput(value);

      setAttackRow(rowId, (row) => ({ ...row, modifier: normalizedValue }));
      return normalizedValue;
    },
    onAttackRemove: (rowId) => {
      const attacks = getValues("checks.attacks");

      if (attacks.length <= 1) {
        return;
      }

      const index = attacks.findIndex((row) => row.rowId === rowId);
      if (index >= 0) removeAttack(index);
    },
    onAttackSkillChange: (rowId, skill) => {
      setAttackRow(rowId, (row) => ({
        ...row,
        attribute: defaultAttributeByAttackSkill[skill],
        skill,
      }));
    },
    onReactionAttributeChange: (rowId, attribute) => {
      const rows = getValues("checks.reactions");
      const index = rows.findIndex((row) => row.rowId === rowId);
      const row = rows[index];
      if (row !== undefined) updateReaction(index, { ...row, attribute });
    },
    onReactionModifierChange: (rowId, value) => {
      const normalizedValue = normalizeIntegerInput(value);

      const rows = getValues("checks.reactions");
      const index = rows.findIndex((row) => row.rowId === rowId);
      const row = rows[index];
      if (row !== undefined) {
        updateReaction(index, { ...row, modifier: normalizedValue });
      }
      return normalizedValue;
    },
    onNoncombatFavoriteChange: (name, isFavorite) => {
      setValue(`checks.noncombat.${name}.isFavorite`, isFavorite, {
        shouldValidate: true,
      });
    },
    onNoncombatModifierChange: (name, value) => {
      const normalizedValue = normalizeIntegerInput(value);

      setValue(`checks.noncombat.${name}.modifier`, normalizedValue, {
        shouldValidate: true,
      });
      return normalizedValue;
    },
    noncombat: derived.noncombat,
    reactions: derived.reactions,
  };
}

import { useCallback, useMemo } from "react";
import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";

import type { ChecksSectionProps } from "../components/sections/ChecksSection";
import type { BuildDerivedValues } from "../logic/build";
import {
  calculateChecks,
  defaultAttributeByAttackSkill,
} from "../logic/checks";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";
import type { AttackCheckValues, CharacterSheetFormValues } from "./values";

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
  const derived = useMemo(
    () => calculateChecks(checks, derivedBuild.attributes),
    [checks, derivedBuild.attributes],
  );

  const setAttackRow = useCallback(
    function setAttackRow(
      rowId: string,
      update: (row: AttackCheckValues) => AttackCheckValues,
    ): void {
      const rows = getValues("checks.attacks");
      const index = rows.findIndex((row) => row.rowId === rowId);
      const row = rows[index];
      if (row !== undefined) updateAttack(index, update(row));
    },
    [getValues, updateAttack],
  );
  const onAttackAdd = useCallback(() => {
    if (getValues("checks.attacks").length >= 5) return;
    const attackNumber = getValues("checks.attacks").length + 1;
    appendAttack({
      attribute: defaultAttributeByAttackSkill.brawl,
      modifier: 0,
      rowId: `attack-${attackNumber}-${crypto.randomUUID()}`,
      skill: "brawl",
    });
  }, [appendAttack, getValues]);
  const onAttackAttributeChange = useCallback(
    (rowId: string, attribute: AttackCheckValues["attribute"]) =>
      setAttackRow(rowId, (row) => ({ ...row, attribute })),
    [setAttackRow],
  );
  const onAttackModifierChange = useCallback(
    (rowId: string, value: string) => {
      const normalizedValue = normalizeIntegerInput(value);
      setAttackRow(rowId, (row) => ({ ...row, modifier: normalizedValue }));
      return normalizedValue;
    },
    [setAttackRow],
  );
  const onAttackRemove = useCallback(
    (rowId: string) => {
      const attacks = getValues("checks.attacks");
      if (attacks.length <= 1) return;
      const index = attacks.findIndex((row) => row.rowId === rowId);
      if (index >= 0) removeAttack(index);
    },
    [getValues, removeAttack],
  );
  const onAttackSkillChange = useCallback(
    (rowId: string, skill: AttackCheckValues["skill"]) => {
      setAttackRow(rowId, (row) => ({
        ...row,
        attribute: defaultAttributeByAttackSkill[skill],
        skill,
      }));
    },
    [setAttackRow],
  );
  const onReactionAttributeChange = useCallback(
    (rowId: string, attribute: AttackCheckValues["attribute"]) => {
      const rows = getValues("checks.reactions");
      const index = rows.findIndex((row) => row.rowId === rowId);
      const row = rows[index];
      if (row !== undefined) updateReaction(index, { ...row, attribute });
    },
    [getValues, updateReaction],
  );
  const onReactionModifierChange = useCallback(
    (rowId: string, value: string) => {
      const normalizedValue = normalizeIntegerInput(value);
      const rows = getValues("checks.reactions");
      const index = rows.findIndex((row) => row.rowId === rowId);
      const row = rows[index];
      if (row !== undefined)
        updateReaction(index, { ...row, modifier: normalizedValue });
      return normalizedValue;
    },
    [getValues, updateReaction],
  );
  const onNoncombatFavoriteChange = useCallback(
    (
      name: keyof CharacterSheetFormValues["checks"]["noncombat"],
      isFavorite: boolean,
    ) => {
      setValue(`checks.noncombat.${name}.isFavorite`, isFavorite, {
        shouldValidate: true,
      });
    },
    [setValue],
  );
  const onNoncombatModifierChange = useCallback(
    (
      name: keyof CharacterSheetFormValues["checks"]["noncombat"],
      value: string,
    ) => {
      const normalizedValue = normalizeIntegerInput(value);
      setValue(`checks.noncombat.${name}.modifier`, normalizedValue, {
        shouldValidate: true,
      });
      return normalizedValue;
    },
    [setValue],
  );

  const sectionProps = useMemo(
    () => ({
      attacks: derived.attacks,
      onAttackAdd,
      onAttackAttributeChange,
      onAttackModifierChange,
      onAttackRemove,
      onAttackSkillChange,
      onNoncombatFavoriteChange,
      onNoncombatModifierChange,
      onReactionAttributeChange,
      onReactionModifierChange,
      noncombat: derived.noncombat,
      reactions: derived.reactions,
    }),
    [
      derived,
      onAttackAdd,
      onAttackAttributeChange,
      onAttackModifierChange,
      onAttackRemove,
      onAttackSkillChange,
      onNoncombatFavoriteChange,
      onNoncombatModifierChange,
      onReactionAttributeChange,
      onReactionModifierChange,
    ],
  );

  return sectionProps;
}

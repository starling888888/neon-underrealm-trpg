import { type UseFormReturn, useWatch } from "react-hook-form";

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
  const checks = useWatch({ control, name: "checks" });
  const derived = calculateChecks(checks, derivedBuild.attributes);

  function setAttackRow(
    rowId: string,
    update: (row: AttackCheckValues) => AttackCheckValues,
  ): void {
    setValue(
      "checks.attacks",
      getValues("checks.attacks").map((row) =>
        row.rowId === rowId ? update(row) : row,
      ),
      { shouldValidate: true },
    );
  }

  return {
    attacks: derived.attacks,
    onAttackAdd: () => {
      const attackNumber = getValues("checks.attacks").length + 1;

      setValue(
        "checks.attacks",
        [
          ...getValues("checks.attacks"),
          {
            attribute: defaultAttributeByAttackSkill.brawl,
            modifier: 0,
            rowId: `attack-${attackNumber}-${crypto.randomUUID()}`,
            skill: "brawl",
          },
        ],
        { shouldValidate: true },
      );
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

      setValue(
        "checks.attacks",
        attacks.filter((row) => row.rowId !== rowId),
        { shouldValidate: true },
      );
    },
    onAttackSkillChange: (rowId, skill) => {
      setAttackRow(rowId, (row) => ({
        ...row,
        attribute: defaultAttributeByAttackSkill[skill],
        skill,
      }));
    },
    onReactionAttributeChange: (name, attribute) => {
      setValue(
        "checks.reactions",
        getValues("checks.reactions").map((row) =>
          row.name === name ? { ...row, attribute } : row,
        ) as CharacterSheetFormValues["checks"]["reactions"],
        { shouldValidate: true },
      );
    },
    onReactionModifierChange: (name, value) => {
      const normalizedValue = normalizeIntegerInput(value);

      setValue(
        "checks.reactions",
        getValues("checks.reactions").map((row) =>
          row.name === name ? { ...row, modifier: normalizedValue } : row,
        ) as CharacterSheetFormValues["checks"]["reactions"],
        { shouldValidate: true },
      );
      return normalizedValue;
    },
    reactions: derived.reactions,
  };
}

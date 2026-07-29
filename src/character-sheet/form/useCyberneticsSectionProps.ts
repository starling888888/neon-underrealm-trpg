import { useEffect, useRef } from "react";
import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";

import type {
  CyberneticsPickerTarget,
  CyberneticsSectionProps,
} from "../components/CyberneticsSection";
import type {
  CharacterSheetFormValues,
  CyberneticFixedPartKey,
} from "../form-values";
import type { BuildDerivedValues } from "../logic/build";
import { calculateCybernetics } from "../logic/cybernetics";
import { getCyberneticById } from "../master-data/cybernetics";
import { noncombatSkills } from "../master-data/noncombat-skills";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";

type Options = {
  onPickerRequest: (
    target: CyberneticsPickerTarget,
    trigger: HTMLButtonElement,
  ) => void;
};

const fixedPartKeys = ["head", "torso", "arm", "leg"] as const;

function getFixedField(part: CyberneticFixedPartKey) {
  return `${part}Id` as const;
}

/** Owns cybernetic RHF values and derives item totals without UI dependencies. */
export default function useCyberneticsSectionProps(
  { control, getValues, setValue }: UseFormReturn<CharacterSheetFormValues>,
  derivedBuild: BuildDerivedValues,
  options: Options,
): CyberneticsSectionProps {
  const { append, remove, update } = useFieldArray({
    control,
    keyName: "fieldKey",
    name: "cybernetics.otherRows",
  });
  const values = useWatch({ control, name: "cybernetics" });
  const selectedCybernetics = [
    ...fixedPartKeys.map((part) =>
      getCyberneticById(values[getFixedField(part)]),
    ),
    ...values.otherRows.map((row) => getCyberneticById(row.cyberneticId)),
  ];
  const derived = calculateCybernetics(
    selectedCybernetics,
    values.implantTotalModifier,
    derivedBuild.attributes.mind.permanent,
    values.implantLimitModifier,
  );
  const previousNoncombatModifier = useRef(derived.noncombatModifier);

  useEffect(() => {
    if (previousNoncombatModifier.current === derived.noncombatModifier) {
      return;
    }

    previousNoncombatModifier.current = derived.noncombatModifier;
    for (const skill of noncombatSkills) {
      setValue(
        `checks.noncombat.${skill.id}.modifier`,
        derived.noncombatModifier,
        { shouldValidate: true },
      );
    }
  }, [derived.noncombatModifier, setValue]);

  function setFixedSelection(
    part: CyberneticFixedPartKey,
    cyberneticId: string | null,
  ): void {
    setValue(`cybernetics.${getFixedField(part)}`, cyberneticId, {
      shouldValidate: true,
    });
  }

  function setOtherSelection(rowId: string, cyberneticId: string | null): void {
    const rows = getValues("cybernetics.otherRows");
    const index = rows.findIndex((row) => row.rowId === rowId);
    const row = rows[index];
    if (row !== undefined) update(index, { ...row, cyberneticId });
  }

  return {
    derived,
    fixedRows: fixedPartKeys.map((part) => ({
      cybernetic: getCyberneticById(values[getFixedField(part)]),
      part,
      rowId: `cybernetic-${part}`,
    })),
    onAddOther: () => {
      const rows = getValues("cybernetics.otherRows");
      if (rows.length >= 4) return;
      append({
        cyberneticId: null,
        rowId: `cybernetic-other-${crypto.randomUUID()}`,
      });
    },
    onClearFixed: (part) => setFixedSelection(part, null),
    onClearOther: (rowId) => setOtherSelection(rowId, null),
    onModifierChange: (field, value) => {
      const normalizedValue = normalizeIntegerInput(value);
      setValue(`cybernetics.${field}`, normalizedValue, {
        shouldValidate: true,
      });
      return normalizedValue;
    },
    onPickerRequest: options.onPickerRequest,
    onRemoveOther: (rowId) => {
      const rows = getValues("cybernetics.otherRows");
      if (rows.length <= 1) return;
      const index = rows.findIndex((row) => row.rowId === rowId);
      if (index >= 0) remove(index);
    },
    onSelect: (target, cyberneticId) => {
      if (target.kind === "fixed") {
        setFixedSelection(target.part, cyberneticId);
      } else {
        setOtherSelection(target.rowId, cyberneticId);
      }
    },
    implantLimitModifier: values.implantLimitModifier,
    implantTotalModifier: values.implantTotalModifier,
    otherRows: values.otherRows.map((row) => ({
      cybernetic: getCyberneticById(row.cyberneticId),
      rowId: row.rowId,
    })),
  };
}

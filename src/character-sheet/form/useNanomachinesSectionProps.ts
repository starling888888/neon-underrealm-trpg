import { type UseFormReturn, useWatch } from "react-hook-form";

import type {
  NanomachinesPickerTarget,
  NanomachinesSectionProps,
} from "../components/NanomachinesSection";
import type {
  CharacterSheetFormValues,
  NanomachineFixedPartKey,
} from "../form-values";
import type { BuildDerivedValues } from "../logic/build";
import { calculateNanomachines } from "../logic/nanomachines";
import { getNanomachineById } from "../master-data/nanomachines";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";

type Options = {
  onPickerRequest: (
    target: NanomachinesPickerTarget,
    trigger: HTMLButtonElement,
  ) => void;
};

const fixedPartKeys = ["head", "torso", "arm", "leg"] as const;

function getFixedField(part: NanomachineFixedPartKey) {
  return `${part}Id` as const;
}

/** Owns nanomachine RHF values and derives item totals without UI dependencies. */
export default function useNanomachinesSectionProps(
  { control, setValue }: UseFormReturn<CharacterSheetFormValues>,
  derivedBuild: BuildDerivedValues,
  options: Options,
): NanomachinesSectionProps {
  const values = useWatch({ control, name: "nanomachines" });
  const derived = calculateNanomachines(
    fixedPartKeys.map((part) =>
      getNanomachineById(values[getFixedField(part)]),
    ),
    values.implantTotalModifier,
    derivedBuild.attributes.body.permanent,
    values.implantLimitModifier,
  );

  function setFixedSelection(
    part: NanomachineFixedPartKey,
    nanomachineId: string | null,
  ): void {
    setValue(`nanomachines.${getFixedField(part)}`, nanomachineId, {
      shouldValidate: true,
    });
  }

  return {
    derived,
    fixedRows: fixedPartKeys.map((part) => ({
      nanomachine: getNanomachineById(values[getFixedField(part)]),
      part,
      rowId: `nanomachine-${part}`,
    })),
    implantLimitModifier: values.implantLimitModifier,
    implantTotalModifier: values.implantTotalModifier,
    onClear: (part) => setFixedSelection(part, null),
    onModifierChange: (field, value) => {
      const normalizedValue = normalizeIntegerInput(value);
      setValue(`nanomachines.${field}`, normalizedValue, {
        shouldValidate: true,
      });
      return normalizedValue;
    },
    onPickerRequest: options.onPickerRequest,
    onSelect: (part, nanomachineId) => setFixedSelection(part, nanomachineId),
  };
}

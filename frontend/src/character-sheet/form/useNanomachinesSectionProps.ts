import { useCallback, useMemo } from "react";
import { type UseFormReturn, useWatch } from "react-hook-form";

import type {
  NanomachinesPickerTarget,
  NanomachinesSectionProps,
} from "../components/sections/NanomachinesSection";
import type { BuildDerivedValues } from "../logic/build";
import { calculateNanomachines } from "../logic/nanomachines";
import { getNanomachineById } from "../master-data/nanomachines";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";
import type {
  CharacterSheetFormValues,
  NanomachineFixedPartKey,
} from "./values";

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
  const derived = useMemo(
    () =>
      calculateNanomachines(
        fixedPartKeys.map((part) =>
          getNanomachineById(values[getFixedField(part)]),
        ),
        values.implantTotalModifier,
        derivedBuild.attributes.body.permanent,
        values.implantLimitModifier,
      ),
    [
      derivedBuild.attributes.body.permanent,
      values.implantLimitModifier,
      values.implantTotalModifier,
      values,
    ],
  );

  const setFixedSelection = useCallback(
    function setFixedSelection(
      part: NanomachineFixedPartKey,
      nanomachineId: string | null,
    ): void {
      setValue(`nanomachines.${getFixedField(part)}`, nanomachineId, {
        shouldValidate: true,
      });
    },
    [setValue],
  );
  const fixedRows = useMemo(
    () =>
      fixedPartKeys.map((part) => ({
        nanomachine: getNanomachineById(values[getFixedField(part)]),
        part,
        rowId: `nanomachine-${part}`,
      })),
    [values],
  );
  const onClear = useCallback(
    (part: NanomachineFixedPartKey) => setFixedSelection(part, null),
    [setFixedSelection],
  );
  const onModifierChange = useCallback(
    (field: "implantLimitModifier" | "implantTotalModifier", value: string) => {
      const normalizedValue = normalizeIntegerInput(value);
      setValue(`nanomachines.${field}`, normalizedValue, {
        shouldValidate: true,
      });
      return normalizedValue;
    },
    [setValue],
  );
  const onSelect = useCallback(
    (part: NanomachineFixedPartKey, nanomachineId: string | null) =>
      setFixedSelection(part, nanomachineId),
    [setFixedSelection],
  );
  const sectionProps = useMemo(
    () => ({
      derived,
      fixedRows,
      implantLimitModifier: values.implantLimitModifier,
      implantTotalModifier: values.implantTotalModifier,
      onClear,
      onModifierChange,
      onPickerRequest: options.onPickerRequest,
      onSelect,
    }),
    [
      derived,
      fixedRows,
      onClear,
      onModifierChange,
      onSelect,
      options.onPickerRequest,
      values.implantLimitModifier,
      values.implantTotalModifier,
    ],
  );

  return sectionProps;
}

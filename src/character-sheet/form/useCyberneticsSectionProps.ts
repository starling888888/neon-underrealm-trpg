import { type RefObject, useCallback, useEffect, useMemo, useRef } from "react";
import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";

import type {
  CyberneticsPickerTarget,
  CyberneticsSectionProps,
} from "../components/sections/CyberneticsSection";
import type { BuildDerivedValues } from "../logic/build";
import { calculateCybernetics } from "../logic/cybernetics";
import {
  getCyberneticById,
  isCyberneticCompatibleWithFixedPart,
} from "../master-data/cybernetics";
import { noncombatSkills } from "../master-data/noncombat-skills";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";
import type {
  CharacterSheetFormValues,
  CyberneticFixedPartKey,
} from "./values";

type Options = {
  onPickerRequest: (
    target: CyberneticsPickerTarget,
    trigger: HTMLButtonElement,
  ) => void;
  shouldSynchronizeCyberneticsRef?: RefObject<boolean>;
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
  const selectedCybernetics = useMemo(
    () => [
      ...fixedPartKeys.map((part) =>
        getCyberneticById(values[getFixedField(part)]),
      ),
      ...values.otherRows.map((row) => getCyberneticById(row.cyberneticId)),
    ],
    [values],
  );
  const derived = useMemo(
    () =>
      calculateCybernetics(
        selectedCybernetics,
        values.implantTotalModifier,
        derivedBuild.attributes.mind.permanent,
        values.implantLimitModifier,
      ),
    [
      derivedBuild.attributes.mind.permanent,
      selectedCybernetics,
      values.implantLimitModifier,
      values.implantTotalModifier,
    ],
  );
  const previousNoncombatModifier = useRef(derived.noncombatModifier);
  const previousCyberneticsValues = useRef(values);
  const localSynchronizeNoncombatModifierRef = useRef(false);
  const shouldSynchronizeNoncombatModifierRef =
    options.shouldSynchronizeCyberneticsRef ??
    localSynchronizeNoncombatModifierRef;

  useEffect(() => {
    const previousModifier = previousNoncombatModifier.current;
    previousNoncombatModifier.current = derived.noncombatModifier;
    if (!shouldSynchronizeNoncombatModifierRef.current) return;

    shouldSynchronizeNoncombatModifierRef.current = false;
    if (previousModifier === derived.noncombatModifier) return;
    for (const skill of noncombatSkills) {
      setValue(
        `checks.noncombat.${skill.id}.modifier`,
        derived.noncombatModifier,
        { shouldValidate: true },
      );
    }
  }, [
    derived.noncombatModifier,
    setValue,
    shouldSynchronizeNoncombatModifierRef,
  ]);

  useEffect(() => {
    const changed = previousCyberneticsValues.current !== values;
    previousCyberneticsValues.current = values;
    if (!changed) return;
    if (shouldSynchronizeNoncombatModifierRef.current) {
      shouldSynchronizeNoncombatModifierRef.current = false;
    }
  }, [shouldSynchronizeNoncombatModifierRef, values]);

  const synchronizeNoncombatModifierAfterUserChange = useCallback(() => {
    shouldSynchronizeNoncombatModifierRef.current = true;
  }, [shouldSynchronizeNoncombatModifierRef]);
  const setFixedSelection = useCallback(
    (part: CyberneticFixedPartKey, cyberneticId: string | null): void => {
      if (getValues(`cybernetics.${getFixedField(part)}`) === cyberneticId) {
        return;
      }
      synchronizeNoncombatModifierAfterUserChange();
      setValue(`cybernetics.${getFixedField(part)}`, cyberneticId, {
        shouldValidate: true,
      });
    },
    [getValues, setValue, synchronizeNoncombatModifierAfterUserChange],
  );

  const setOtherSelection = useCallback(
    (rowId: string, cyberneticId: string | null): void => {
      const rows = getValues("cybernetics.otherRows");
      const index = rows.findIndex((row) => row.rowId === rowId);
      const row = rows[index];
      if (row !== undefined && row.cyberneticId !== cyberneticId) {
        synchronizeNoncombatModifierAfterUserChange();
        update(index, { ...row, cyberneticId });
      }
    },
    [getValues, synchronizeNoncombatModifierAfterUserChange, update],
  );

  const fixedRows = useMemo(
    () =>
      fixedPartKeys.map((part) => ({
        cybernetic: getCyberneticById(values[getFixedField(part)]),
        hasPartError: !isCyberneticCompatibleWithFixedPart(
          part,
          values[getFixedField(part)],
        ),
        part,
        rowId: `cybernetic-${part}`,
      })),
    [values],
  );
  const otherRows = useMemo(
    () =>
      values.otherRows.map((row) => ({
        cybernetic: getCyberneticById(row.cyberneticId),
        rowId: row.rowId,
      })),
    [values.otherRows],
  );
  const onAddOther = useCallback(() => {
    const rows = getValues("cybernetics.otherRows");
    if (rows.length >= 4) return;
    append({
      cyberneticId: null,
      rowId: `cybernetic-other-${crypto.randomUUID()}`,
    });
  }, [append, getValues]);
  const onModifierChange = useCallback(
    (field: "implantLimitModifier" | "implantTotalModifier", value: string) => {
      const normalizedValue = normalizeIntegerInput(value);
      if (
        field === "implantTotalModifier" &&
        getValues(`cybernetics.${field}`) !== normalizedValue
      ) {
        synchronizeNoncombatModifierAfterUserChange();
      }
      setValue(`cybernetics.${field}`, normalizedValue, {
        shouldValidate: true,
      });
      return normalizedValue;
    },
    [getValues, setValue, synchronizeNoncombatModifierAfterUserChange],
  );
  const onRemoveOther = useCallback(
    (rowId: string) => {
      const rows = getValues("cybernetics.otherRows");
      if (rows.length <= 1) return;
      const index = rows.findIndex((row) => row.rowId === rowId);
      if (index >= 0) {
        synchronizeNoncombatModifierAfterUserChange();
        remove(index);
      }
    },
    [getValues, remove, synchronizeNoncombatModifierAfterUserChange],
  );
  const onSelect = useCallback(
    (target: CyberneticsPickerTarget, cyberneticId: string | null) => {
      if (target.kind === "fixed") {
        setFixedSelection(target.part, cyberneticId);
      } else {
        setOtherSelection(target.rowId, cyberneticId);
      }
    },
    [setFixedSelection, setOtherSelection],
  );

  return useMemo(
    () => ({
      derived,
      fixedRows,
      onAddOther,
      onClearFixed: (part: CyberneticFixedPartKey) =>
        setFixedSelection(part, null),
      onClearOther: (rowId: string) => setOtherSelection(rowId, null),
      onModifierChange,
      onPickerRequest: options.onPickerRequest,
      onRemoveOther,
      onSelect,
      implantLimitModifier: values.implantLimitModifier,
      implantTotalModifier: values.implantTotalModifier,
      otherRows,
    }),
    [
      derived,
      fixedRows,
      onAddOther,
      onModifierChange,
      onRemoveOther,
      onSelect,
      options.onPickerRequest,
      otherRows,
      setFixedSelection,
      setOtherSelection,
      values.implantLimitModifier,
      values.implantTotalModifier,
    ],
  );
}

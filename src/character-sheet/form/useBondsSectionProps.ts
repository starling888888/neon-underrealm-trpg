import { useEffect } from "react";
import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";

import type { BondsSectionProps } from "../components/BondsSection";
import {
  type BondEditableFieldName,
  type BondValues,
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
  type ResolveEffectName,
} from "../form-values";
import { calculateBonds, retainBondRows } from "../logic/bonds";
import type { SecondaryAttributeDerivedValues } from "../logic/secondary-attributes";
import { normalizeResolveEffectInput } from "../schemas/character-sheet-form";

export default function useBondsSectionProps(
  { control, getValues, setValue }: UseFormReturn<CharacterSheetFormValues>,
  derivedSecondaryAttributes: SecondaryAttributeDerivedValues,
): BondsSectionProps {
  const { remove, replace, update } = useFieldArray({
    control,
    keyName: "fieldKey",
    name: "bonds.rows",
  });
  const bonds = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.bonds,
    name: "bonds",
  });
  const derivedBonds = calculateBonds(
    bonds,
    derivedSecondaryAttributes.bondLimit,
  );

  useEffect(() => {
    const currentRows = getValues("bonds.rows");
    const retainedRows = retainBondRows(
      currentRows,
      derivedBonds.effectiveLimit,
    );
    const nextRowNumber =
      Math.max(
        0,
        ...currentRows.map((row) => {
          const match = /^bond-(\d+)$/.exec(row.rowId);
          return match === null ? 0 : Number(match[1]);
        }),
      ) + 1;
    const nextRows = [
      ...retainedRows,
      ...Array.from(
        { length: derivedBonds.requiredRowCount - retainedRows.length },
        (_, index): BondValues => ({
          isResolved: false,
          relation: "",
          rowId: `bond-${nextRowNumber + index}`,
          target: "",
        }),
      ),
    ];

    if (
      currentRows.length === nextRows.length &&
      currentRows.every((row, index) => row.rowId === nextRows[index]?.rowId)
    ) {
      return;
    }

    replace(nextRows);
  }, [
    derivedBonds.effectiveLimit,
    derivedBonds.requiredRowCount,
    getValues,
    replace,
  ]);

  function setBondRowValue(
    rowId: string,
    field: BondEditableFieldName,
    value: boolean | string,
  ): void {
    const rows = getValues("bonds.rows");
    const index = rows.findIndex((row) => row.rowId === rowId);
    const row = rows[index];
    if (row === undefined) return;
    update(index, { ...row, [field]: value });
  }

  return {
    bonds: bonds.rows,
    derived: derivedBonds,
    onEffectModifierChange: (field: ResolveEffectName, value: string) => {
      const normalizedValue = normalizeResolveEffectInput(field, value);

      setValue(`bonds.resolveEffectModifiers.${field}`, normalizedValue, {
        shouldValidate: true,
      });

      return normalizedValue;
    },
    onRowChange: setBondRowValue,
    onRowClear: (rowId) => {
      const rows = getValues("bonds.rows");
      const index = rows.findIndex((row) => row.rowId === rowId);
      const row = rows[index];
      if (row === undefined || row.isResolved) return;
      update(index, { ...row, isResolved: false, relation: "", target: "" });
    },
    onRowDelete: (rowId) => {
      const bonds = getValues("bonds");
      const row = bonds.rows.find((entry) => entry.rowId === rowId);
      const currentDerived = calculateBonds(
        bonds,
        derivedSecondaryAttributes.bondLimit,
      );

      if (row?.isResolved || !currentDerived.overflowRowIds.includes(rowId)) {
        return;
      }

      const index = bonds.rows.findIndex((entry) => entry.rowId === rowId);
      if (index >= 0) remove(index);
    },
  };
}

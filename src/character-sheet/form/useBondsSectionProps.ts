import { useCallback, useEffect, useMemo } from "react";
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
  const { move, remove, replace, update } = useFieldArray({
    control,
    keyName: "fieldKey",
    name: "bonds.rows",
  });
  const bonds = useWatch({
    control,
    defaultValue: characterSheetDefaultValues.bonds,
    name: "bonds",
  });
  const derivedBonds = useMemo(
    () => calculateBonds(bonds, derivedSecondaryAttributes.bondLimit),
    [bonds, derivedSecondaryAttributes.bondLimit],
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

  const setBondRowValue = useCallback(
    <K extends BondEditableFieldName>(
      rowId: string,
      field: K,
      value: BondValues[K],
    ): void => {
      const rows = getValues("bonds.rows");
      const index = rows.findIndex((row) => row.rowId === rowId);
      const row = rows[index];
      if (row === undefined) return;
      if (field === "target") {
        setValue(`bonds.rows.${index}.target`, value as string, {
          shouldDirty: true,
          shouldValidate: true,
        });
        return;
      }

      if (field === "relation") {
        setValue(`bonds.rows.${index}.relation`, value as string, {
          shouldDirty: true,
          shouldValidate: true,
        });
        return;
      }

      update(index, { ...row, [field]: value } as BondValues);
    },
    [getValues, setValue, update],
  );

  const onEffectModifierChange = useCallback(
    (field: ResolveEffectName, value: string) => {
      const normalizedValue = normalizeResolveEffectInput(field, value);

      setValue(`bonds.resolveEffectModifiers.${field}`, normalizedValue, {
        shouldValidate: true,
      });

      return normalizedValue;
    },
    [setValue],
  );
  const onRowClear = useCallback(
    (rowId: string) => {
      const rows = getValues("bonds.rows");
      const index = rows.findIndex((row) => row.rowId === rowId);
      const row = rows[index];
      if (row === undefined || row.isResolved) return;
      update(index, { ...row, isResolved: false, relation: "", target: "" });
    },
    [getValues, update],
  );
  const onRowDelete = useCallback(
    (rowId: string) => {
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
    [derivedSecondaryAttributes.bondLimit, getValues, remove],
  );
  const onRowMove = useCallback(
    (rowId: string, direction: "up" | "down") => {
      const rows = getValues("bonds.rows");
      const index = rows.findIndex((row) => row.rowId === rowId);
      const next = index + (direction === "up" ? -1 : 1);
      if (index >= 0 && next >= 0 && next < rows.length) move(index, next);
    },
    [getValues, move],
  );

  return useMemo(
    () => ({
      bonds: bonds.rows,
      derived: derivedBonds,
      onEffectModifierChange,
      onRowChange: setBondRowValue,
      onRowClear,
      onRowDelete,
      onRowMove,
    }),
    [
      bonds.rows,
      derivedBonds,
      onEffectModifierChange,
      onRowClear,
      onRowDelete,
      onRowMove,
      setBondRowValue,
    ],
  );
}

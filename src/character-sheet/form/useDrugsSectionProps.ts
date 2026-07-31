import { useCallback, useMemo } from "react";
import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";

import type { DrugsSectionProps } from "../components/DrugsSection";
import type { CharacterSheetFormValues, DrugRowValues } from "../form-values";
import { getDuplicateDrugRowIds } from "../logic/drugs";
import { getDrugById } from "../master-data/drugs";
import { normalizeIntegerInput } from "../schemas/character-sheet-form";

type Options = {
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
};

function createDrugRow(): DrugRowValues {
  return {
    drugId: null,
    quantity: 1,
    rowId: `drug-${crypto.randomUUID()}`,
  };
}

export default function useDrugsSectionProps(
  { control, getValues, setValue }: UseFormReturn<CharacterSheetFormValues>,
  options: Options,
): DrugsSectionProps {
  const { append, move, remove } = useFieldArray({
    control,
    keyName: "fieldKey",
    name: "drugs.rows",
  });
  const drugs = useWatch({ control, name: "drugs" });
  const duplicateRowIds = useMemo(
    () => getDuplicateDrugRowIds(drugs.rows),
    [drugs.rows],
  );

  const getRows = useCallback(
    (): DrugRowValues[] => getValues("drugs.rows"),
    [getValues],
  );
  const getRowIndex = useCallback(
    (rowId: string): number =>
      getRows().findIndex((row) => row.rowId === rowId),
    [getRows],
  );
  const onAdd = useCallback(() => append(createDrugRow()), [append]);
  const onMove = useCallback(
    (rowId: string, direction: "up" | "down") => {
      const rows = getRows();
      const index = rows.findIndex((row) => row.rowId === rowId);
      const nextIndex = index + (direction === "up" ? -1 : 1);
      if (index >= 0 && nextIndex >= 0 && nextIndex < rows.length) {
        move(index, nextIndex);
      }
    },
    [getRows, move],
  );
  const onQuantityChange = useCallback(
    (rowId: string, value: string) => {
      const index = getRowIndex(rowId);
      if (index < 0) return 0;
      const quantity = Math.max(0, normalizeIntegerInput(value));
      setValue(`drugs.rows.${index}.quantity`, quantity, {
        shouldValidate: true,
      });
      return quantity;
    },
    [getRowIndex, setValue],
  );
  const onRemove = useCallback(
    (rowId: string) => {
      const index = getRowIndex(rowId);
      if (index >= 0) remove(index);
    },
    [getRowIndex, remove],
  );
  const onSelect = useCallback(
    (rowId: string, drugId: string | null) => {
      const index = getRowIndex(rowId);
      if (index < 0) return;
      setValue(`drugs.rows.${index}.drugId`, drugId, {
        shouldValidate: true,
      });
    },
    [getRowIndex, setValue],
  );
  const rows = useMemo(
    () =>
      drugs.rows.map((row) => ({
        ...row,
        drug: getDrugById(row.drugId),
        hasDuplicateSelection: duplicateRowIds.has(row.rowId),
      })),
    [drugs.rows, duplicateRowIds],
  );
  const sectionProps = useMemo(
    () => ({
      onAdd,
      onMove,
      onPickerRequest: options.onPickerRequest,
      onQuantityChange,
      onRemove,
      onSelect,
      rows,
    }),
    [
      onAdd,
      onMove,
      onQuantityChange,
      onRemove,
      onSelect,
      options.onPickerRequest,
      rows,
    ],
  );

  return sectionProps;
}

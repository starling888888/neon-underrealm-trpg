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
    quantity: 0,
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
  const duplicateRowIds = getDuplicateDrugRowIds(drugs.rows);

  function getRows(): DrugRowValues[] {
    return getValues("drugs.rows");
  }

  function getRowIndex(rowId: string): number {
    return getRows().findIndex((row) => row.rowId === rowId);
  }

  return {
    onAdd: () => append(createDrugRow()),
    onMove: (rowId, direction) => {
      const rows = getRows();
      const index = rows.findIndex((row) => row.rowId === rowId);
      const nextIndex = index + (direction === "up" ? -1 : 1);
      if (index >= 0 && nextIndex >= 0 && nextIndex < rows.length) {
        move(index, nextIndex);
      }
    },
    onPickerRequest: options.onPickerRequest,
    onQuantityChange: (rowId, value) => {
      const index = getRowIndex(rowId);
      if (index < 0) return 0;
      const quantity = Math.max(0, normalizeIntegerInput(value));
      setValue(`drugs.rows.${index}.quantity`, quantity, {
        shouldValidate: true,
      });
      return quantity;
    },
    onRemove: (rowId) => {
      const index = getRowIndex(rowId);
      if (index >= 0) remove(index);
    },
    onSelect: (rowId, drugId) => {
      const index = getRowIndex(rowId);
      if (index < 0) return;
      setValue(`drugs.rows.${index}.drugId`, drugId, {
        shouldValidate: true,
      });
    },
    rows: drugs.rows.map((row) => ({
      ...row,
      drug: getDrugById(row.drugId),
      hasDuplicateSelection: duplicateRowIds.has(row.rowId),
    })),
  };
}

import { type UseFormReturn, useFieldArray, useWatch } from "react-hook-form";

import type { OmamoriSectionProps } from "../components/OmamoriSection";
import type {
  CharacterSheetFormValues,
  OmamoriRowValues,
} from "../form-values";
import { getOmamoriById } from "../master-data/omamori";

type Options = {
  onPickerRequest: (rowId: string, trigger: HTMLButtonElement) => void;
};

function createOmamoriRow(): OmamoriRowValues {
  return { omamoriId: null, rowId: crypto.randomUUID() };
}

export default function useOmamoriSectionProps(
  { control, getValues }: UseFormReturn<CharacterSheetFormValues>,
  options: Options,
): OmamoriSectionProps {
  const { append, move, remove, update } = useFieldArray({
    control,
    keyName: "fieldKey",
    name: "omamori.rows",
  });
  const omamori = useWatch({ control, name: "omamori" });

  function getRows(): OmamoriRowValues[] {
    return getValues("omamori.rows");
  }

  return {
    onAdd: () => append(createOmamoriRow()),
    onMove: (rowId, direction) => {
      const rows = getRows();
      const index = rows.findIndex((row) => row.rowId === rowId);
      const next = index + (direction === "up" ? -1 : 1);
      if (index >= 0 && next >= 0 && next < rows.length) move(index, next);
    },
    onPickerRequest: options.onPickerRequest,
    onRemove: (rowId) => {
      const index = getRows().findIndex((row) => row.rowId === rowId);
      if (index >= 0) remove(index);
    },
    onSelect: (rowId, omamoriId) => {
      const rows = getRows();
      const index = rows.findIndex((row) => row.rowId === rowId);
      const row = rows[index];
      if (row !== undefined && index >= 0) update(index, { ...row, omamoriId });
    },
    rows: omamori.rows.map((row) => ({
      ...row,
      omamori: getOmamoriById(row.omamoriId),
    })),
  };
}

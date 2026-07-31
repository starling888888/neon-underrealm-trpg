type DrugSelectionRow = {
  drugId: string | null;
  rowId: string;
};

/** Returns every row involved in a duplicate drug selection. */
export function getDuplicateDrugRowIds(
  rows: readonly DrugSelectionRow[],
): ReadonlySet<string> {
  const rowIdsByDrugId = new Map<string, string[]>();

  for (const row of rows) {
    if (row.drugId === null) continue;
    const rowIds = rowIdsByDrugId.get(row.drugId) ?? [];
    rowIds.push(row.rowId);
    rowIdsByDrugId.set(row.drugId, rowIds);
  }

  const duplicateRowIds = new Set<string>();
  for (const rowIds of rowIdsByDrugId.values()) {
    if (rowIds.length < 2) continue;
    for (const rowId of rowIds) duplicateRowIds.add(rowId);
  }

  return duplicateRowIds;
}

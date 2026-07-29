export type DisplayValue = string | number | null | undefined;

/** Formats optional table values with the shared unavailable-value marker. */
export function formatDisplayValue(value: DisplayValue): string {
  if (typeof value === "number") return String(value);

  return value?.trim() || "-";
}

/** Formats optional prose without showing an unavailable-value marker. */
export function formatDisplayText(value: string | null | undefined): string {
  return value?.trim() || "";
}

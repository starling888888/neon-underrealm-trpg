export type DisplayValue = string | number | null | undefined;

export function displayValue(value: DisplayValue): string {
  if (typeof value === "number") return String(value);
  return value?.trim() || "-";
}

export function displayText(value: string | null | undefined): string {
  return value?.trim() || "";
}

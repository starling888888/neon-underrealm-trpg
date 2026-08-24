export function getModifiedItemValue(
  baseValue: number | null | "特殊",
  modifier: number | null,
): number | null {
  if (typeof baseValue === "number") return baseValue + (modifier ?? 0);
  return modifier;
}

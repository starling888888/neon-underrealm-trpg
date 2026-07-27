import { characterSheetDictionary } from "./dictionary";

/** Formats nullable derived values with the shared unavailable-value marker. */
export function formatDisplayValue(
  value: number | string | null | undefined,
): string {
  return value === null || value === undefined
    ? characterSheetDictionary.general.unavailableValue
    : String(value);
}

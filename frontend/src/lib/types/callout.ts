export const CALLOUT_TYPES = [
  "note",
  "tip",
  "warning",
  "danger",
  "example",
  "version",
] as const;

export type CalloutType = (typeof CALLOUT_TYPES)[number];

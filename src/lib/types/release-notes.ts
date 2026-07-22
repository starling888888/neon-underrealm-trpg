export const RELEASE_NOTES_DATA_NAME = "release-notes";

export type ReleaseNotesDataName = typeof RELEASE_NOTES_DATA_NAME;

export interface ReleaseNote {
  id: string;
  date: string;
  summary: string;
  body: string | null;
  sourceOrder: number;
}

export interface ReleaseNotesJson {
  dataName: ReleaseNotesDataName;
  updatedAt: string;
  data: ReleaseNote[];
}

import releaseNotesJson from "../../../data/generated/release-notes.json";
import type { ReleaseNote, ReleaseNotesJson } from "../schemas/release-notes";

const generatedReleaseNotesJson = releaseNotesJson as ReleaseNotesJson;

export function getReleaseNotesJson(): ReleaseNotesJson {
  return generatedReleaseNotesJson;
}

export function getReleaseNotes(): ReleaseNote[] {
  return getReleaseNotesJson().data;
}

export function getLatestReleaseNotes(limit = 5): ReleaseNote[] {
  return getReleaseNotes().slice(0, limit);
}

export function getReleaseNoteBody(note: ReleaseNote): string {
  if (note.body === null || note.body.trim() === "") {
    return note.summary;
  }

  return note.body;
}

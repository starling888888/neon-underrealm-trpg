import releaseNotesJson from "../../../data/generated/release-notes.json";
import {
  getReleaseNoteBody,
  parseReleaseNotesJson,
  type ReleaseNote,
  type ReleaseNotesJson,
} from "../schemas/release-notes";

export function getReleaseNotesJson(): ReleaseNotesJson {
  return parseReleaseNotesJson(releaseNotesJson);
}

export function getReleaseNotes(): ReleaseNote[] {
  return getReleaseNotesJson().data;
}

export function getLatestReleaseNotes(limit = 5): ReleaseNote[] {
  return getReleaseNotes().slice(0, limit);
}

export { getReleaseNoteBody };

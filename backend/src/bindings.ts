/** Cloudflare bindings required by the character sheet API. */
export interface BackendBindings {
  CORS_ALLOW_ORIGIN: string;
  DB: D1Database;
  FIREBASE_PROJECT_ID: string;
  OBJECTS: R2Bucket;
}

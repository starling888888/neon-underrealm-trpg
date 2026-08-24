/** Cloudflare bindings required by the diagnostic Worker endpoint. */
export interface BackendBindings {
  DB: D1Database;
  OBJECTS: R2Bucket;
}

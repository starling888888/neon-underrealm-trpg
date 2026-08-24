import type { BackendBindings } from "./bindings.js";
import type { DiagnosticDependencies } from "./diagnostics.js";

export const createCloudflareDiagnostics = (
  bindings: BackendBindings,
): DiagnosticDependencies => ({
  database: {
    async probe() {
      const result = await bindings.DB.prepare("SELECT 1 AS ready").first<{
        ready: number;
      }>();

      if (result?.ready !== 1) {
        throw new Error("D1 diagnostic query returned no result.");
      }
    },
  },
  objectStore: {
    async delete(key) {
      await bindings.OBJECTS.delete(key);
    },
    async get(key) {
      const object = await bindings.OBJECTS.get(key);
      return object?.text() ?? null;
    },
    async put(key, value) {
      await bindings.OBJECTS.put(key, value);
    },
  },
});

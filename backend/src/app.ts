import { Hono } from "hono";
import type { DiagnosticDependencies } from "./diagnostics.js";

const diagnosticObjectPrefix = "diagnostic-probes/";

export const createApp = (dependencies: DiagnosticDependencies) => {
  const app = new Hono();

  app.get("/health", (context) => context.json({ status: "ok" }));

  app.post("/diagnostics/probe", async (context) => {
    try {
      await dependencies.database.probe();
    } catch {
      return context.json({ error: "D1 diagnostic query failed." }, 502);
    }

    const objectKey = `${diagnosticObjectPrefix}${crypto.randomUUID()}.txt`;
    const probeBody = "diagnostic probe";

    try {
      await dependencies.objectStore.put(objectKey, probeBody);
      const storedObject = await dependencies.objectStore.get(objectKey);

      if (storedObject !== probeBody) {
        return context.json({ error: "R2 diagnostic read failed." }, 502);
      }
    } catch {
      return context.json({ error: "R2 diagnostic operation failed." }, 502);
    } finally {
      await dependencies.objectStore.delete(objectKey).catch(() => undefined);
    }

    return context.json({ d1: "ok", r2: "ok" });
  });

  return app;
};

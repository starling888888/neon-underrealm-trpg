import assert from "node:assert/strict";
import test from "node:test";
import { createApp } from "../src/app.js";
import type { DiagnosticDependencies } from "../src/diagnostics.js";

const createBindings = () => {
  const objects = new Map<string, string>();
  const deletedKeys: string[] = [];

  const dependencies: DiagnosticDependencies = {
    database: {
      probe: async () => undefined,
    },
    objectStore: {
      delete: async (key: string) => {
        deletedKeys.push(key);
        objects.delete(key);
      },
      get: async (key: string) => {
        const value = objects.get(key);
        return value ?? null;
      },
      put: async (key: string, value: string) => {
        objects.set(key, value);
      },
    },
  };

  return { deletedKeys, dependencies, objects };
};

test("the diagnostic probe verifies D1 and cleans up its R2 object", async () => {
  const { deletedKeys, dependencies, objects } = createBindings();
  const response = await createApp(dependencies).request(
    "http://backend.local/diagnostics/probe",
    {
      method: "POST",
    },
  );

  assert.equal(response.status, 200);
  await assert.doesNotReject(
    response
      .json()
      .then((body) => assert.deepEqual(body, { d1: "ok", r2: "ok" })),
  );
  assert.equal(deletedKeys.length, 1);
  assert.match(deletedKeys[0] ?? "", /^diagnostic-probes\/.+\.txt$/);
  assert.equal(objects.size, 0);
});

test("the diagnostic probe identifies a D1 failure", async () => {
  const { dependencies } = createBindings();
  dependencies.database = {
    probe: async () => {
      throw new Error("unavailable");
    },
  };

  const response = await createApp(dependencies).request(
    "http://backend.local/diagnostics/probe",
    {
      method: "POST",
    },
  );

  assert.equal(response.status, 502);
  await assert.doesNotReject(
    response
      .json()
      .then((body) =>
        assert.deepEqual(body, { error: "D1 diagnostic query failed." }),
      ),
  );
});

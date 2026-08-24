import assert from "node:assert/strict";

const backendUrl =
  process.env.BACKEND_INTEGRATION_URL ?? "http://127.0.0.1:8787";
const probeResponse = await fetch(`${backendUrl}/diagnostics/probe`, {
  method: "POST",
  signal: AbortSignal.timeout(10_000),
});

assert.equal(
  probeResponse.status,
  200,
  "The D1/R2 diagnostic probe must succeed.",
);
assert.deepEqual(await probeResponse.json(), { d1: "ok", r2: "ok" });

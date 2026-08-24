import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const backendUrl =
  process.env.BACKEND_INTEGRATION_URL ?? "http://127.0.0.1:8787";
const executeFile = promisify(execFile);

type CreatedSheet = {
  id: string;
  type: "sample" | "user";
};

const ownerHeaders = {
  Authorization: "Bearer test-token-owner",
  "Content-Type": "application/json",
};

const otherHeaders = {
  Authorization: "Bearer test-token-other",
  "Content-Type": "application/json",
};

async function request(path: string, options: RequestInit = {}) {
  return fetch(`${backendUrl}${path}`, {
    ...options,
    signal: AbortSignal.timeout(10_000),
  });
}

async function createSheet(pcName: string): Promise<CreatedSheet> {
  const response = await request("/character-sheets", {
    body: JSON.stringify({
      imageBase64: null,
      metadata: { pcName, rank: 1 },
      snapshot: { profile: { pcName } },
    }),
    headers: ownerHeaders,
    method: "POST",
  });

  assert.equal(response.status, 200);
  return response.json() as Promise<CreatedSheet>;
}

async function markSample(id: string): Promise<void> {
  await executeFile(
    "../node_modules/.bin/wrangler",
    [
      "d1",
      "execute",
      "DB",
      "--local",
      "--persist-to",
      ".wrangler/state",
      "--command",
      `UPDATE character_sheets SET type = 'sample' WHERE id = '${id}'`,
      "--env",
      "dev",
    ],
    { cwd: process.cwd() },
  );
}

const health = await request("/health");
assert.equal(health.status, 200);

const removedDiagnostic = await request("/diagnostics/probe", {
  method: "POST",
});
assert.equal(removedDiagnostic.status, 404);

const first = await createSheet("first sample");
await markSample(first.id);
await new Promise((resolve) => setTimeout(resolve, 2));
const second = await createSheet("second sample");
await markSample(second.id);
const user = await createSheet("user sheet");

const anonymousList = await request("/character-sheets");
assert.equal(anonymousList.status, 200);
const anonymousBody = (await anonymousList.json()) as {
  sample: Array<{ id: string; isOwner: boolean; pcName: string }>;
  user: Array<{ id: string; isOwner: boolean }>;
};
assert.deepEqual(
  anonymousBody.sample.map((sheet) => sheet.pcName),
  ["first sample", "second sample"],
);
assert.deepEqual(
  anonymousBody.user.map((sheet) => sheet.id),
  [user.id],
);
assert.equal(anonymousBody.user[0]?.isOwner, false);

const ownedGet = await request(`/character-sheets/${user.id}`, {
  headers: { Authorization: "Bearer test-token-owner" },
});
assert.equal(ownedGet.status, 200);
const ownedBody = (await ownedGet.json()) as {
  id: string;
  imageBase64: string | null;
  isOwner: boolean;
  snapshot: { profile: { pcName: string } };
};
assert.equal(ownedBody.id, user.id);
assert.equal(ownedBody.isOwner, true);
assert.equal(ownedBody.imageBase64, null);
assert.equal(ownedBody.snapshot.profile.pcName, "user sheet");
assert.equal(JSON.stringify(ownedBody).includes("ownerUserId"), false);

const update = await request("/character-sheets", {
  body: JSON.stringify({
    id: user.id,
    imageBase64: "updated-image",
    metadata: { pcName: "updated user", rank: 2 },
    snapshot: { profile: { pcName: "updated user" } },
  }),
  headers: ownerHeaders,
  method: "POST",
});
assert.equal(update.status, 200);
const updatedBody = (await update.json()) as { type: string };
assert.equal(updatedBody.type, "user");

const nonOwnerUpdate = await request("/character-sheets", {
  body: JSON.stringify({
    id: user.id,
    imageBase64: null,
    metadata: { pcName: "forbidden", rank: 1 },
    snapshot: {},
  }),
  headers: otherHeaders,
  method: "POST",
});
assert.equal(nonOwnerUpdate.status, 403);

const missingUpdate = await request("/character-sheets", {
  body: JSON.stringify({
    id: "11111111-1111-4111-8111-111111111111",
    imageBase64: null,
    metadata: { pcName: "missing", rank: 1 },
    snapshot: {},
  }),
  headers: ownerHeaders,
  method: "POST",
});
assert.equal(missingUpdate.status, 404);

const expiredRead = await request("/character-sheets", {
  headers: { Authorization: "Bearer test-token-expired" },
});
assert.equal(expiredRead.status, 419);

const invalidBody = await request("/character-sheets", {
  body: JSON.stringify({}),
  headers: ownerHeaders,
  method: "POST",
});
assert.equal(invalidBody.status, 400);

const nonOwnerDelete = await request(`/character-sheets/${user.id}`, {
  headers: otherHeaders,
  method: "DELETE",
});
assert.equal(nonOwnerDelete.status, 403);

const ownerDelete = await request(`/character-sheets/${user.id}`, {
  headers: { Authorization: "Bearer test-token-owner" },
  method: "DELETE",
});
assert.equal(ownerDelete.status, 204);

const deleted = await request(`/character-sheets/${user.id}`);
assert.equal(deleted.status, 404);

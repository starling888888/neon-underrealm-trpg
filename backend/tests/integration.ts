import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const backendUrl =
  process.env.BACKEND_INTEGRATION_URL ?? "http://127.0.0.1:8787";
const executeFile = promisify(execFile);

type CreatedSheet = {
  id: string;
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
      metadata: { pcName, plName: "", rank: 1 },
      snapshot: { imageBase64String: null, profile: { pcName } },
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
  sample: Array<{
    id: string;
    metadata: { createdAt: number; isOwner: boolean; pcName: string };
  }>;
  user: Array<{
    id: string;
    metadata: { isOwner: boolean; updatedAt: number };
  }>;
};
assert.deepEqual(
  anonymousBody.sample.map((sheet) => sheet.metadata.pcName),
  ["first sample", "second sample"],
);
assert.deepEqual(
  anonymousBody.user.map((sheet) => sheet.id),
  [user.id],
);
assert.equal(anonymousBody.user[0]?.metadata.isOwner, false);
assert.equal(typeof anonymousBody.user[0]?.metadata.updatedAt, "number");

const ownedGet = await request(`/character-sheets/${user.id}`, {
  headers: { Authorization: "Bearer test-token-owner" },
});
assert.equal(ownedGet.status, 200);
const ownedBody = (await ownedGet.json()) as {
  id: string;
  metadata: {
    createdAt: number;
    isOwner: boolean;
    updatedAt: number;
  };
  snapshot: { imageBase64String: string | null; profile: { pcName: string } };
};
assert.equal(ownedBody.id, user.id);
assert.equal(ownedBody.metadata.isOwner, true);
assert.equal(typeof ownedBody.metadata.createdAt, "number");
assert.equal(typeof ownedBody.metadata.updatedAt, "number");
assert.equal(ownedBody.snapshot.imageBase64String, null);
assert.equal(ownedBody.snapshot.profile.pcName, "user sheet");
assert.equal(JSON.stringify(ownedBody).includes("ownerUserId"), false);

const update = await request("/character-sheets", {
  body: JSON.stringify({
    id: user.id,
    metadata: { pcName: "updated user", rank: 2 },
    snapshot: {
      imageBase64String: "updated-image",
      profile: { pcName: "updated user" },
    },
  }),
  headers: ownerHeaders,
  method: "POST",
});
assert.equal(update.status, 200);
const updatedBody = (await update.json()) as { metadata: { type: string } };
assert.equal(updatedBody.metadata.type, "user");

const nonOwnerUpdate = await request("/character-sheets", {
  body: JSON.stringify({
    id: user.id,
    metadata: { pcName: "forbidden", rank: 1 },
    snapshot: { imageBase64String: null },
  }),
  headers: otherHeaders,
  method: "POST",
});
assert.equal(nonOwnerUpdate.status, 403);

const missingUpdate = await request("/character-sheets", {
  body: JSON.stringify({
    id: "11111111-1111-4111-8111-111111111111",
    metadata: { pcName: "missing", rank: 1 },
    snapshot: { imageBase64String: null },
  }),
  headers: ownerHeaders,
  method: "POST",
});
assert.equal(missingUpdate.status, 404);

const expiredRead = await request("/character-sheets", {
  headers: { Authorization: "Bearer test-token-expired" },
});
assert.equal(expiredRead.status, 419);

const invalidRead = await request("/character-sheets", {
  headers: { Authorization: "Bearer not-a-test-token" },
});
assert.equal(invalidRead.status, 401);

const anonymousWrite = await request("/character-sheets", {
  body: JSON.stringify({
    metadata: { pcName: "anonymous", rank: 1 },
    snapshot: { imageBase64String: null },
  }),
  headers: { "Content-Type": "application/json" },
  method: "POST",
});
assert.equal(anonymousWrite.status, 401);

const invalidBody = await request("/character-sheets", {
  body: JSON.stringify({
    metadata: {
      ikizamaId: "invalid",
      pcName: "invalid master ID",
      rank: 1,
    },
    snapshot: { imageBase64String: null },
  }),
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

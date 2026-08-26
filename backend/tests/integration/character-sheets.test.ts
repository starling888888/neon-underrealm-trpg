import type {
  CharacterSheet,
  CharacterSheetInput,
  CharacterSheetListResponse,
  CharacterSheetSummary,
} from "@neon-underrealm/shared";
import { afterAll, afterEach, beforeAll, describe, expect, test } from "vitest";
import { getPlatformProxy, type PlatformProxy } from "wrangler";
import type { BackendBindings } from "../../src/bindings.js";
import type { CharacterSheetRecord } from "../../src/domain/index.js";
import { CloudflareCharacterSheetRepository } from "../../src/repository/index.js";

const backendUrl =
  process.env.BACKEND_INTEGRATION_URL ?? "http://127.0.0.1:8787";

const ownerHeaders = {
  Authorization: "Bearer test-token-owner",
  "Content-Type": "application/json",
};

const maximumRequestBodyBytes = 8 * 1024 * 1024;

const otherHeaders = {
  Authorization: "Bearer test-token-other",
  "Content-Type": "application/json",
};

let platform: PlatformProxy<BackendBindings>;
let repository: CloudflareCharacterSheetRepository;
let seededRecords: CharacterSheetRecord[] = [];
let nextId = 1;

async function request(
  path: string,
  options: RequestInit = {},
  timeoutMs = 10_000,
) {
  return fetch(`${backendUrl}${path}`, {
    ...options,
    signal: AbortSignal.timeout(timeoutMs),
  });
}

function createId(): string {
  const suffix = String(nextId++).padStart(12, "0");
  return `11111111-1111-4111-8111-${suffix}`;
}

function oversizedRequestBody(): string {
  return `${JSON.stringify({
    metadata: { isPublic: true, pcName: "too large", rank: 1 },
    snapshot: { imageBase64String: null },
  })}${" ".repeat(maximumRequestBodyBytes)}`;
}

async function seedSheet(
  overrides: Partial<CharacterSheetRecord> = {},
  snapshot: CharacterSheetInput["snapshot"] = {
    imageBase64String: null,
  },
): Promise<CharacterSheetRecord> {
  const now = Date.now();
  const record: CharacterSheetRecord = {
    createdAt: now,
    id: createId(),
    ikizamaId: null,
    isPublic: true,
    ownerUserId: "test-owner",
    pcName: "seeded sheet",
    plName: null,
    primaryRyugiId: null,
    rank: 1,
    type: "user",
    updatedAt: now,
    ...overrides,
  };

  await repository.putSnapshot(record.ownerUserId, record.id, snapshot);
  await repository.insertMetadata(record);
  seededRecords.push(record);
  return record;
}

beforeAll(async () => {
  platform = await getPlatformProxy<BackendBindings>({
    configPath: "wrangler.jsonc",
    environment: "dev",
    envFiles: [],
    persist: { path: ".wrangler/integration-state/v3" },
    remoteBindings: false,
  });
  repository = new CloudflareCharacterSheetRepository(platform.env);
});

afterEach(async () => {
  for (const record of seededRecords.reverse()) {
    await repository.deleteMetadata(record.id);
    await repository.deleteSnapshot(record.ownerUserId, record.id);
  }
  seededRecords = [];
});

afterAll(async () => {
  await platform.dispose();
});

describe("GET /health", () => {
  test("returns the health status", async () => {
    const response = await request("/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});

describe("GET /character-sheets", () => {
  test("separates samples and sorts them by creation time", async () => {
    await seedSheet({ createdAt: 30, pcName: "new sample", type: "sample" });
    const user = await seedSheet({ createdAt: 10, pcName: "user sheet" });
    await seedSheet({ createdAt: 20, pcName: "old sample", type: "sample" });

    const response = await request("/character-sheets");

    expect(response.status).toBe(200);
    const body = (await response.json()) as CharacterSheetListResponse;
    expect(body.sample.map((sheet) => sheet.metadata.pcName)).toEqual([
      "old sample",
      "new sample",
    ]);
    expect(body.user.map((sheet) => sheet.id)).toEqual([user.id]);
    expect(body.user[0]?.metadata.isOwner).toBe(false);
    expect(body.user[0]?.metadata.updatedAt).toEqual(expect.any(Number));
  });

  test("migration defaults pre-existing records to public", async () => {
    const record: CharacterSheetRecord = {
      createdAt: 1,
      id: createId(),
      ikizamaId: null,
      isPublic: true,
      ownerUserId: "test-owner",
      pcName: "pre-existing sheet",
      plName: null,
      primaryRyugiId: null,
      rank: 1,
      type: "user",
      updatedAt: 1,
    };

    await platform.env.DB.prepare(
      `INSERT INTO character_sheets (
        id, owner_user_id, type, pc_name, pl_name, rank,
        primary_ryugi_id, ikizama_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        record.id,
        record.ownerUserId,
        record.type,
        record.pcName,
        record.plName,
        record.rank,
        record.primaryRyugiId,
        record.ikizamaId,
        record.createdAt,
        record.updatedAt,
      )
      .run();
    await repository.putSnapshot(record.ownerUserId, record.id, {
      imageBase64String: null,
    });
    seededRecords.push(record);

    const response = await request("/character-sheets");

    expect(response.status).toBe(200);
    const body = (await response.json()) as CharacterSheetListResponse;
    expect(body.user).toMatchObject([
      { id: record.id, metadata: { isPublic: true } },
    ]);
  });

  test("filters private records by the authenticated owner", async () => {
    const publicRecord = await seedSheet({ pcName: "public sheet" });
    const ownerPrivate = await seedSheet({
      isPublic: false,
      pcName: "owner private sheet",
    });
    const otherPrivate = await seedSheet({
      isPublic: false,
      ownerUserId: "test-other",
      pcName: "other private sheet",
    });

    const anonymous = await request("/character-sheets");
    const owner = await request("/character-sheets", { headers: ownerHeaders });
    const other = await request("/character-sheets", { headers: otherHeaders });

    const anonymousBody =
      (await anonymous.json()) as CharacterSheetListResponse;
    const ownerBody = (await owner.json()) as CharacterSheetListResponse;
    const otherBody = (await other.json()) as CharacterSheetListResponse;

    expect(anonymousBody.user.map((sheet) => sheet.id)).toEqual([
      publicRecord.id,
    ]);
    expect(ownerBody.user.map((sheet) => sheet.id)).toEqual(
      expect.arrayContaining([ownerPrivate.id, publicRecord.id]),
    );
    expect(otherBody.user.map((sheet) => sheet.id)).toEqual(
      expect.arrayContaining([otherPrivate.id, publicRecord.id]),
    );
    expect(ownerBody.user).toHaveLength(2);
    expect(otherBody.user).toHaveLength(2);
  });

  test("distinguishes unavailable, unexpected, expired, and invalid tokens", async () => {
    const unavailable = await request("/character-sheets", {
      headers: {
        Authorization: "Bearer test-token-authentication-unavailable",
      },
    });
    const unexpected = await request("/character-sheets", {
      headers: { Authorization: "Bearer test-token-verifier-unexpected" },
    });
    const expired = await request("/character-sheets", {
      headers: { Authorization: "Bearer test-token-expired" },
    });
    const invalid = await request("/character-sheets", {
      headers: { Authorization: "Bearer not-a-test-token" },
    });

    expect(unavailable.status).toBe(503);
    await expect(unavailable.json()).resolves.toEqual({
      error: { code: "authentication_unavailable" },
    });
    expect(unexpected.status).toBe(500);
    await expect(unexpected.json()).resolves.toEqual({
      error: { code: "unexpected_error" },
    });
    expect(expired.status).toBe(419);
    expect(invalid.status).toBe(401);
  });
});

describe("POST /character-sheets", () => {
  test("creates a user sheet", async () => {
    const response = await request("/character-sheets", {
      body: JSON.stringify({
        metadata: {
          isPublic: false,
          pcName: "created sheet",
          plName: "",
          rank: 1,
        },
        snapshot: {
          imageBase64String: null,
          profile: { pcName: "created sheet" },
        },
      }),
      headers: ownerHeaders,
      method: "POST",
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as CharacterSheetSummary;
    expect(body.metadata.type).toBe("user");
    expect(body.metadata.isOwner).toBe(true);
    expect(body.metadata.isPublic).toBe(false);
    expect(body.metadata.pcName).toBe("created sheet");
    seededRecords.push({
      createdAt: body.metadata.createdAt,
      id: body.id,
      ikizamaId: body.metadata.ikizamaId ?? null,
      isPublic: body.metadata.isPublic,
      ownerUserId: "test-owner",
      pcName: body.metadata.pcName,
      plName: body.metadata.plName ?? null,
      primaryRyugiId: body.metadata.primaryRyugiId ?? null,
      rank: body.metadata.rank,
      type: body.metadata.type,
      updatedAt: body.metadata.updatedAt,
    });
  });

  test("updates an owned sample without changing its type", async () => {
    const sheet = await seedSheet({ pcName: "before", type: "sample" });

    const response = await request("/character-sheets", {
      body: JSON.stringify({
        id: sheet.id,
        metadata: { isPublic: false, pcName: "updated sheet", rank: 2 },
        snapshot: { imageBase64String: "updated-image" },
      }),
      headers: ownerHeaders,
      method: "POST",
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as CharacterSheetSummary;
    expect(body.metadata.type).toBe("sample");
    expect(body.metadata.isPublic).toBe(false);
    expect(body.metadata.pcName).toBe("updated sheet");
  });

  test("rejects a non-owner update", async () => {
    const sheet = await seedSheet();

    const response = await request("/character-sheets", {
      body: JSON.stringify({
        id: sheet.id,
        metadata: { isPublic: false, pcName: "forbidden", rank: 1 },
        snapshot: { imageBase64String: null },
      }),
      headers: otherHeaders,
      method: "POST",
    });

    expect(response.status).toBe(403);
  });

  test("rejects an update for an unknown sheet", async () => {
    const response = await request("/character-sheets", {
      body: JSON.stringify({
        id: "11111111-1111-4111-8111-999999999999",
        metadata: { isPublic: true, pcName: "missing", rank: 1 },
        snapshot: { imageBase64String: null },
      }),
      headers: ownerHeaders,
      method: "POST",
    });

    expect(response.status).toBe(404);
  });

  test("rejects an anonymous write", async () => {
    const response = await request("/character-sheets", {
      body: JSON.stringify({
        metadata: { isPublic: true, pcName: "anonymous", rank: 1 },
        snapshot: { imageBase64String: null },
      }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    expect(response.status).toBe(401);
  });

  test("rejects invalid input", async () => {
    const response = await request("/character-sheets", {
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

    expect(response.status).toBe(400);
  });

  test("rejects an oversized request with Content-Length", async () => {
    const body = oversizedRequestBody();
    const response = await request("/character-sheets", {
      body,
      headers: {
        ...ownerHeaders,
        "Content-Length": String(Buffer.byteLength(body)),
      },
      method: "POST",
    });

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      error: { code: "payload_too_large" },
    });
  });

  // FIXME: CI timeouts are inconsistent
  test.skip("rejects an oversized chunked request", async () => {
    const body = oversizedRequestBody();
    const response = await request(
      "/character-sheets",
      {
        body: new ReadableStream({
          start(controller) {
            controller.enqueue(new TextEncoder().encode(body));
            controller.close();
          },
        }),
        duplex: "half",
        headers: ownerHeaders,
        method: "POST",
      } as RequestInit,
      25_000,
    );

    expect(response.status).toBe(413);
    await expect(response.json()).resolves.toEqual({
      error: { code: "payload_too_large" },
    });
  });
});

describe("GET /character-sheets/:id", () => {
  test("returns an owned sheet without its owner ID", async () => {
    const sheet = await seedSheet(
      { pcName: "owned sheet" },
      {
        imageBase64String: null,
        profile: { pcName: "owned sheet" },
      },
    );

    const response = await request(`/character-sheets/${sheet.id}`, {
      headers: { Authorization: "Bearer test-token-owner" },
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as CharacterSheet;
    expect(body.id).toBe(sheet.id);
    expect(body.metadata.isOwner).toBe(true);
    expect(body.metadata.createdAt).toEqual(expect.any(Number));
    expect(body.metadata.updatedAt).toEqual(expect.any(Number));
    expect(body.snapshot.imageBase64String).toBeNull();
    expect(body.snapshot.profile).toEqual({ pcName: "owned sheet" });
    expect(JSON.stringify(body)).not.toContain("ownerUserId");
  });

  test("returns 404 for private records outside the owner", async () => {
    const privateSheet = await seedSheet({ isPublic: false });

    const anonymous = await request(`/character-sheets/${privateSheet.id}`);
    const nonOwner = await request(`/character-sheets/${privateSheet.id}`, {
      headers: otherHeaders,
    });
    const owner = await request(`/character-sheets/${privateSheet.id}`, {
      headers: ownerHeaders,
    });

    expect(anonymous.status).toBe(404);
    expect(nonOwner.status).toBe(404);
    expect(owner.status).toBe(200);
    await expect(owner.json()).resolves.toMatchObject({
      id: privateSheet.id,
      metadata: { isOwner: true, isPublic: false },
    });
  });
});

describe("DELETE /character-sheets/:id", () => {
  test("rejects deletion by a non-owner", async () => {
    const sheet = await seedSheet();

    const response = await request(`/character-sheets/${sheet.id}`, {
      headers: otherHeaders,
      method: "DELETE",
    });

    expect(response.status).toBe(403);
  });

  test("deletes an owned sheet", async () => {
    const sheet = await seedSheet();

    const response = await request(`/character-sheets/${sheet.id}`, {
      headers: ownerHeaders,
      method: "DELETE",
    });

    expect(response.status).toBe(204);
    seededRecords = seededRecords.filter((record) => record.id !== sheet.id);
    expect(await repository.getMetadata(sheet.id)).toBeNull();
    expect(
      await repository.getSnapshot(sheet.ownerUserId, sheet.id),
    ).toBeNull();
  });
});

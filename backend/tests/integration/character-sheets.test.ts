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

async function request(path: string, options: RequestInit = {}) {
  return fetch(`${backendUrl}${path}`, {
    ...options,
    signal: AbortSignal.timeout(10_000),
  });
}

function createId(): string {
  const suffix = String(nextId++).padStart(12, "0");
  return `11111111-1111-4111-8111-${suffix}`;
}

function oversizedRequestBody(): string {
  return `${JSON.stringify({
    metadata: { pcName: "too large", rank: 1 },
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
    persist: { path: ".wrangler/state/v3" },
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

  test("distinguishes expired and invalid tokens", async () => {
    const expired = await request("/character-sheets", {
      headers: { Authorization: "Bearer test-token-expired" },
    });
    const invalid = await request("/character-sheets", {
      headers: { Authorization: "Bearer not-a-test-token" },
    });

    expect(expired.status).toBe(419);
    expect(invalid.status).toBe(401);
  });
});

describe("POST /character-sheets", () => {
  test("creates a user sheet", async () => {
    const response = await request("/character-sheets", {
      body: JSON.stringify({
        metadata: { pcName: "created sheet", plName: "", rank: 1 },
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
    expect(body.metadata.pcName).toBe("created sheet");
    seededRecords.push({
      createdAt: body.metadata.createdAt,
      id: body.id,
      ikizamaId: body.metadata.ikizamaId ?? null,
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
        metadata: { pcName: "updated sheet", rank: 2 },
        snapshot: { imageBase64String: "updated-image" },
      }),
      headers: ownerHeaders,
      method: "POST",
    });

    expect(response.status).toBe(200);
    const body = (await response.json()) as CharacterSheetSummary;
    expect(body.metadata.type).toBe("sample");
    expect(body.metadata.pcName).toBe("updated sheet");
  });

  test("rejects a non-owner update", async () => {
    const sheet = await seedSheet();

    const response = await request("/character-sheets", {
      body: JSON.stringify({
        id: sheet.id,
        metadata: { pcName: "forbidden", rank: 1 },
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
        metadata: { pcName: "missing", rank: 1 },
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
        metadata: { pcName: "anonymous", rank: 1 },
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

  test("rejects an oversized chunked request", async () => {
    const body = oversizedRequestBody();
    const response = await request("/character-sheets", {
      body: new ReadableStream({
        start(controller) {
          controller.enqueue(new TextEncoder().encode(body));
          controller.close();
        },
      }),
      duplex: "half",
      headers: ownerHeaders,
      method: "POST",
    } as RequestInit);

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

import assert from "node:assert/strict";
import test from "node:test";
import type { CharacterSheetInput } from "@neon-underrealm/shared";
import { ApiError } from "../src/api-error.js";
import { CharacterSheetService } from "../src/character-sheet-service.js";
import type {
  CharacterSheetRecord,
  CharacterSheetRepository,
  CharacterSheetSnapshot,
  TokenVerification,
  TokenVerifier,
} from "../src/character-sheets.js";

const ownerToken = "owner-token";
const otherToken = "other-token";

const input = (
  overrides: Partial<CharacterSheetInput> = {},
): CharacterSheetInput => ({
  imageBase64: null,
  metadata: { pcName: "テストPC", rank: 1 },
  snapshot: { profile: { pcName: "テストPC" } },
  ...overrides,
});

class InMemoryRepository implements CharacterSheetRepository {
  readonly metadata = new Map<string, CharacterSheetRecord>();
  readonly operations: string[] = [];
  readonly snapshots = new Map<string, CharacterSheetSnapshot>();

  async deleteMetadata(id: string): Promise<void> {
    this.operations.push(`delete-metadata:${id}`);
    this.metadata.delete(id);
  }

  async deleteSnapshot(ownerUserId: string, id: string): Promise<void> {
    this.operations.push(`delete-snapshot:${id}`);
    this.snapshots.delete(this.key(ownerUserId, id));
  }

  async getMetadata(id: string): Promise<CharacterSheetRecord | null> {
    return this.metadata.get(id) ?? null;
  }

  async getSnapshot(
    ownerUserId: string,
    id: string,
  ): Promise<CharacterSheetSnapshot | null> {
    return this.snapshots.get(this.key(ownerUserId, id)) ?? null;
  }

  async insertMetadata(record: CharacterSheetRecord): Promise<void> {
    this.operations.push(`insert-metadata:${record.id}`);
    this.metadata.set(record.id, record);
  }

  async listMetadata(): Promise<CharacterSheetRecord[]> {
    return [...this.metadata.values()];
  }

  async putSnapshot(
    ownerUserId: string,
    id: string,
    snapshot: CharacterSheetSnapshot,
  ): Promise<void> {
    this.operations.push(`put-snapshot:${id}`);
    this.snapshots.set(this.key(ownerUserId, id), snapshot);
  }

  async updateMetadata(
    id: string,
    metadata: CharacterSheetInput["metadata"],
    updatedAt: number,
  ): Promise<void> {
    this.operations.push(`update-metadata:${id}`);
    const current = this.metadata.get(id);

    if (current === undefined) throw new Error("missing metadata");

    this.metadata.set(id, {
      ...current,
      ...metadata,
      ikizamaId: metadata.ikizamaId ?? null,
      plName: metadata.plName ?? null,
      primaryRyugiId: metadata.primaryRyugiId ?? null,
      updatedAt,
    });
  }

  private key(ownerUserId: string, id: string): string {
    return `${ownerUserId}/${id}`;
  }
}

class FixedTokenVerifier implements TokenVerifier {
  async verify(token: string): Promise<TokenVerification> {
    if (token === ownerToken) return { kind: "valid", userId: "owner" };
    if (token === otherToken) return { kind: "valid", userId: "other" };
    if (token === "expired-token") return { kind: "expired" };
    return { kind: "invalid" };
  }
}

const createService = (repository = new InMemoryRepository()) => ({
  repository,
  service: new CharacterSheetService(repository, new FixedTokenVerifier(), {
    createId: () => "11111111-1111-4111-8111-111111111111",
    now: () => 1_700_000_000_000,
  }),
});

test("create writes the snapshot before user metadata", async () => {
  const { repository, service } = createService();

  const result = await service.save(input(), ownerToken);

  assert.equal(result.id, "11111111-1111-4111-8111-111111111111");
  assert.equal(result.isOwner, true);
  assert.equal(result.type, "user");
  assert.deepEqual(repository.operations, [
    "put-snapshot:11111111-1111-4111-8111-111111111111",
    "insert-metadata:11111111-1111-4111-8111-111111111111",
  ]);
});

test("update preserves a sample type and owner", async () => {
  const { repository, service } = createService();
  const id = "11111111-1111-4111-8111-111111111111";
  repository.metadata.set(id, {
    createdAt: 1,
    id,
    ikizamaId: null,
    ownerUserId: "owner",
    pcName: "before",
    plName: null,
    primaryRyugiId: null,
    rank: 1,
    type: "sample",
    updatedAt: 1,
  });

  const result = await service.save(input({ id }), ownerToken);

  assert.equal(result.type, "sample");
  assert.equal(repository.metadata.get(id)?.ownerUserId, "owner");
  assert.deepEqual(repository.operations, [
    `put-snapshot:${id}`,
    `update-metadata:${id}`,
  ]);
});

test("write rejects an unknown id and a non-owner", async () => {
  const { repository, service } = createService();
  const id = "11111111-1111-4111-8111-111111111111";

  await assert.rejects(
    () => service.save(input({ id }), ownerToken),
    (error: unknown) => error instanceof ApiError && error.status === 404,
  );

  repository.metadata.set(id, {
    createdAt: 1,
    id,
    ikizamaId: null,
    ownerUserId: "owner",
    pcName: "owner sheet",
    plName: null,
    primaryRyugiId: null,
    rank: 1,
    type: "user",
    updatedAt: 1,
  });

  await assert.rejects(
    () => service.save(input({ id }), otherToken),
    (error: unknown) => error instanceof ApiError && error.status === 403,
  );
});

test("anonymous reads omit ownership and expired tokens are distinguishable", async () => {
  const { repository, service } = createService();
  const id = "11111111-1111-4111-8111-111111111111";
  repository.metadata.set(id, {
    createdAt: 1,
    id,
    ikizamaId: null,
    ownerUserId: "owner",
    pcName: "owner sheet",
    plName: null,
    primaryRyugiId: null,
    rank: 1,
    type: "user",
    updatedAt: 1,
  });
  repository.snapshots.set("owner/11111111-1111-4111-8111-111111111111", {
    imageBase64: null,
    snapshot: {},
  });

  assert.equal((await service.get(id, undefined)).isOwner, false);
  await assert.rejects(
    () => service.get(id, "expired-token"),
    (error: unknown) => error instanceof ApiError && error.status === 419,
  );
});

test("delete removes metadata before its snapshot", async () => {
  const { repository, service } = createService();
  const id = "11111111-1111-4111-8111-111111111111";
  repository.metadata.set(id, {
    createdAt: 1,
    id,
    ikizamaId: null,
    ownerUserId: "owner",
    pcName: "owner sheet",
    plName: null,
    primaryRyugiId: null,
    rank: 1,
    type: "user",
    updatedAt: 1,
  });

  await service.delete(id, ownerToken);

  assert.deepEqual(repository.operations, [
    `delete-metadata:${id}`,
    `delete-snapshot:${id}`,
  ]);
});

test("a D1 failure after an R2 write remains an error without cleanup", async () => {
  class FailingMetadataRepository extends InMemoryRepository {
    override async insertMetadata(
      _record: CharacterSheetRecord,
    ): Promise<void> {
      throw new Error("D1 unavailable");
    }
  }

  const repository = new FailingMetadataRepository();
  const { service } = createService(repository);

  await assert.rejects(() => service.save(input(), ownerToken));
  assert.equal(repository.metadata.size, 0);
  assert.equal(repository.snapshots.size, 1);
});

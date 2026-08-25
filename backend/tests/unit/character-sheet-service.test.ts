import type { CharacterSheetInput } from "@neon-underrealm/shared";
import { expect, test } from "vitest";
import type { CharacterSheetRecord } from "../../src/domain/index.js";
import type { CharacterSheetRepository } from "../../src/repository/index.js";
import { CharacterSheetService } from "../../src/service/index.js";

const ownerUserId = "owner";
const otherUserId = "other";

const input = (
  overrides: Partial<CharacterSheetInput> = {},
): CharacterSheetInput => ({
  metadata: { pcName: "テストPC", rank: 1 },
  snapshot: { imageBase64String: null, profile: { pcName: "テストPC" } },
  ...overrides,
});

class InMemoryRepository implements CharacterSheetRepository {
  readonly metadata = new Map<string, CharacterSheetRecord>();
  readonly operations: string[] = [];
  readonly snapshots = new Map<string, CharacterSheetInput["snapshot"]>();

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
  ): Promise<CharacterSheetInput["snapshot"] | null> {
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
    snapshot: CharacterSheetInput["snapshot"],
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

const createService = (repository = new InMemoryRepository()) => ({
  repository,
  service: new CharacterSheetService(repository, {
    createId: () => "11111111-1111-4111-8111-111111111111",
    now: () => 1_700_000_000_000,
  }),
});

test("create writes the snapshot before user metadata", async () => {
  const { repository, service } = createService();

  const result = await service.save(input(), ownerUserId);

  expect(result.id).toBe("11111111-1111-4111-8111-111111111111");
  expect(result.metadata.isOwner).toBe(true);
  expect(result.metadata.type).toBe("user");
  expect(repository.operations).toEqual([
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

  const result = await service.save(input({ id }), ownerUserId);

  expect(result.metadata.type).toBe("sample");
  expect(repository.metadata.get(id)?.ownerUserId).toBe("owner");
  expect(repository.operations).toEqual([
    `put-snapshot:${id}`,
    `update-metadata:${id}`,
  ]);
});

test("write rejects an unknown id and a non-owner", async () => {
  const { repository, service } = createService();
  const id = "11111111-1111-4111-8111-111111111111";

  await expect(service.save(input({ id }), ownerUserId)).rejects.toMatchObject({
    code: "not_found",
  });

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

  await expect(service.save(input({ id }), otherUserId)).rejects.toMatchObject({
    code: "forbidden",
  });
});

test("anonymous reads omit ownership and keep numeric timestamps", async () => {
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
    imageBase64String: null,
  });

  const result = await service.get(id, null);
  expect(result.metadata.isOwner).toBe(false);
  expect(result.metadata.createdAt).toBe(1);
  expect(result.metadata.updatedAt).toBe(1);
});

test("list keeps user query order and sorts samples by creation time", async () => {
  const { repository, service } = createService();
  const records: CharacterSheetRecord[] = [
    {
      createdAt: 30,
      id: "11111111-1111-4111-8111-111111111111",
      ikizamaId: null,
      ownerUserId,
      pcName: "new sample",
      plName: null,
      primaryRyugiId: null,
      rank: 1,
      type: "sample",
      updatedAt: 300,
    },
    {
      createdAt: 10,
      id: "22222222-2222-4222-8222-222222222222",
      ikizamaId: null,
      ownerUserId,
      pcName: "user first",
      plName: null,
      primaryRyugiId: null,
      rank: 1,
      type: "user",
      updatedAt: 200,
    },
    {
      createdAt: 20,
      id: "33333333-3333-4333-8333-333333333333",
      ikizamaId: null,
      ownerUserId,
      pcName: "old sample",
      plName: null,
      primaryRyugiId: null,
      rank: 1,
      type: "sample",
      updatedAt: 100,
    },
  ];

  for (const record of records) repository.metadata.set(record.id, record);

  const result = await service.list(null);

  expect(result.user.map((sheet) => sheet.metadata.pcName)).toEqual([
    "user first",
  ]);
  expect(result.sample.map((sheet) => sheet.metadata.pcName)).toEqual([
    "old sample",
    "new sample",
  ]);
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

  await service.delete(id, ownerUserId);

  expect(repository.operations).toEqual([
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

  await expect(service.save(input(), ownerUserId)).rejects.toThrow(
    "D1 unavailable",
  );
  expect(repository.metadata.size).toBe(0);
  expect(repository.snapshots.size).toBe(1);
});

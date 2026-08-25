import type {
  CharacterSheet,
  CharacterSheetInput,
  CharacterSheetListResponse,
  CharacterSheetMetadata,
  CharacterSheetSummary,
} from "@neon-underrealm/shared";
import type { CharacterSheetRecord } from "../domain/index.js";
import { ApplicationError } from "../application-error.js";
import type { CharacterSheetRepository } from "../repository/index.js";

type ServiceOptions = {
  createId?: () => string;
  now?: () => number;
};

const toMetadata = (
  record: CharacterSheetRecord,
  authenticatedUserId: string | null,
): CharacterSheetMetadata => ({
  createdAt: record.createdAt,
  ikizamaId: record.ikizamaId,
  isOwner: authenticatedUserId === record.ownerUserId,
  isPublic: record.isPublic,
  pcName: record.pcName,
  plName: record.plName,
  primaryRyugiId: record.primaryRyugiId,
  rank: record.rank,
  type: record.type,
  updatedAt: record.updatedAt,
});

const toSummary = (
  record: CharacterSheetRecord,
  actorUserId: string | null,
): CharacterSheetSummary => ({
  id: record.id,
  metadata: toMetadata(record, actorUserId),
});

export class CharacterSheetService {
  readonly #createId: () => string;
  readonly #now: () => number;
  readonly #repository: CharacterSheetRepository;

  constructor(
    repository: CharacterSheetRepository,
    options: ServiceOptions = {},
  ) {
    this.#createId = options.createId ?? (() => crypto.randomUUID());
    this.#now = options.now ?? Date.now;
    this.#repository = repository;
  }

  async delete(id: string, actorUserId: string): Promise<void> {
    const record = await this.#requireOwnedRecord(id, actorUserId);

    // Metadata first prevents a deleted sheet from remaining publicly visible.
    await this.#repository.deleteMetadata(record.id);
    await this.#repository.deleteSnapshot(record.ownerUserId, record.id);
  }

  async get(id: string, actorUserId: string | null): Promise<CharacterSheet> {
    const record = await this.#repository.getMetadata(id);

    if (record === null || !this.#canRead(record, actorUserId)) {
      throw new ApplicationError("not_found");
    }

    const storedSnapshot = await this.#repository.getSnapshot(
      record.ownerUserId,
      record.id,
    );

    if (storedSnapshot === null) {
      throw new ApplicationError("unexpected_error");
    }

    return { ...toSummary(record, actorUserId), snapshot: storedSnapshot };
  }

  async list(actorUserId: string | null): Promise<CharacterSheetListResponse> {
    const records = await this.#repository.listMetadata();
    const response: CharacterSheetListResponse = { sample: [], user: [] };

    for (const record of records) {
      if (!this.#canRead(record, actorUserId)) continue;
      response[record.type].push(toSummary(record, actorUserId));
    }

    response.sample.sort(
      (left, right) => left.metadata.createdAt - right.metadata.createdAt,
    );

    return response;
  }

  async save(
    input: CharacterSheetInput,
    actorUserId: string,
  ): Promise<CharacterSheetSummary> {
    const now = this.#now();

    if (input.id === undefined) {
      const id = this.#createId();
      const record: CharacterSheetRecord = {
        ...input.metadata,
        createdAt: now,
        id,
        ikizamaId: input.metadata.ikizamaId ?? null,
        ownerUserId: actorUserId,
        plName: input.metadata.plName ?? null,
        primaryRyugiId: input.metadata.primaryRyugiId ?? null,
        type: "user",
        updatedAt: now,
      };

      // R2 first can leave an orphan object if D1 fails; cleanup is out of scope.
      await this.#repository.putSnapshot(actorUserId, id, input.snapshot);
      await this.#repository.insertMetadata(record);

      return toSummary(record, actorUserId);
    }

    const record = await this.#requireOwnedRecord(input.id, actorUserId);
    await this.#repository.putSnapshot(
      record.ownerUserId,
      record.id,
      input.snapshot,
    );
    await this.#repository.updateMetadata(record.id, input.metadata, now);

    return toSummary(
      {
        ...record,
        ...input.metadata,
        ikizamaId: input.metadata.ikizamaId ?? null,
        plName: input.metadata.plName ?? null,
        primaryRyugiId: input.metadata.primaryRyugiId ?? null,
        updatedAt: now,
      },
      actorUserId,
    );
  }

  async #requireOwnedRecord(
    id: string,
    userId: string,
  ): Promise<CharacterSheetRecord> {
    const record = await this.#repository.getMetadata(id);

    if (record === null) throw new ApplicationError("not_found");
    if (record.ownerUserId !== userId) {
      throw new ApplicationError("forbidden");
    }

    return record;
  }

  #canRead(record: CharacterSheetRecord, actorUserId: string | null): boolean {
    return record.isPublic || record.ownerUserId === actorUserId;
  }
}

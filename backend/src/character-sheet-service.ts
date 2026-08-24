import type {
  CharacterSheet,
  CharacterSheetInput,
  CharacterSheetListResponse,
  CharacterSheetMetadata,
} from "@neon-underrealm/shared";
import { ApiError } from "./api-error.js";
import type {
  CharacterSheetRecord,
  CharacterSheetRepository,
  CharacterSheetSnapshot,
  TokenVerifier,
} from "./character-sheets.js";

type ServiceOptions = {
  createId?: () => string;
  now?: () => number;
};

const toMetadata = (
  record: CharacterSheetRecord,
  authenticatedUserId: string | null,
): CharacterSheetMetadata => ({
  createdAt: new Date(record.createdAt).toISOString(),
  id: record.id,
  ikizamaId: record.ikizamaId,
  isOwner: authenticatedUserId === record.ownerUserId,
  pcName: record.pcName,
  plName: record.plName,
  primaryRyugiId: record.primaryRyugiId,
  rank: record.rank,
  type: record.type,
  updatedAt: new Date(record.updatedAt).toISOString(),
});

const toSnapshot = (input: CharacterSheetInput): CharacterSheetSnapshot => ({
  imageBase64: input.imageBase64,
  snapshot: input.snapshot,
});

export class CharacterSheetService {
  readonly #createId: () => string;
  readonly #now: () => number;
  readonly #repository: CharacterSheetRepository;
  readonly #tokenVerifier: TokenVerifier;

  constructor(
    repository: CharacterSheetRepository,
    tokenVerifier: TokenVerifier,
    options: ServiceOptions = {},
  ) {
    this.#createId = options.createId ?? (() => crypto.randomUUID());
    this.#now = options.now ?? Date.now;
    this.#repository = repository;
    this.#tokenVerifier = tokenVerifier;
  }

  async delete(id: string, token: string | undefined): Promise<void> {
    const userId = await this.#authenticateRequired(token);
    const record = await this.#requireOwnedRecord(id, userId);

    // Metadata first prevents a deleted sheet from remaining publicly visible.
    await this.#repository.deleteMetadata(record.id);
    await this.#repository.deleteSnapshot(record.ownerUserId, record.id);
  }

  async get(id: string, token: string | undefined): Promise<CharacterSheet> {
    const userId = await this.#authenticate(token);
    const record = await this.#repository.getMetadata(id);

    if (record === null) throw new ApiError(404, "not_found");

    const storedSnapshot = await this.#repository.getSnapshot(
      record.ownerUserId,
      record.id,
    );

    if (storedSnapshot === null) throw new ApiError(500, "unexpected_error");

    return { ...toMetadata(record, userId), ...storedSnapshot };
  }

  async list(token: string | undefined): Promise<CharacterSheetListResponse> {
    const userId = await this.#authenticate(token);
    const records = await this.#repository.listMetadata();
    const response: CharacterSheetListResponse = { sample: [], user: [] };

    for (const record of records) {
      response[record.type].push(toMetadata(record, userId));
    }

    return response;
  }

  async save(
    input: CharacterSheetInput,
    token: string | undefined,
  ): Promise<CharacterSheetMetadata> {
    const userId = await this.#authenticateRequired(token);
    const now = this.#now();

    if (input.id === undefined) {
      const id = this.#createId();
      const record: CharacterSheetRecord = {
        ...input.metadata,
        createdAt: now,
        id,
        ikizamaId: input.metadata.ikizamaId ?? null,
        ownerUserId: userId,
        plName: input.metadata.plName ?? null,
        primaryRyugiId: input.metadata.primaryRyugiId ?? null,
        type: "user",
        updatedAt: now,
      };

      // R2 first can leave an orphan object if D1 fails; cleanup is out of scope.
      await this.#repository.putSnapshot(userId, id, toSnapshot(input));
      await this.#repository.insertMetadata(record);

      return toMetadata(record, userId);
    }

    const record = await this.#requireOwnedRecord(input.id, userId);
    await this.#repository.putSnapshot(
      record.ownerUserId,
      record.id,
      toSnapshot(input),
    );
    await this.#repository.updateMetadata(record.id, input.metadata, now);

    return toMetadata(
      {
        ...record,
        ...input.metadata,
        ikizamaId: input.metadata.ikizamaId ?? null,
        plName: input.metadata.plName ?? null,
        primaryRyugiId: input.metadata.primaryRyugiId ?? null,
        updatedAt: now,
      },
      userId,
    );
  }

  async #authenticate(token: string | undefined): Promise<string | null> {
    if (token === undefined) {
      return null;
    }

    const result = await this.#tokenVerifier.verify(token);

    if (result.kind === "expired") throw new ApiError(419, "expired_token");
    if (result.kind === "invalid") throw new ApiError(401, "invalid_token");

    return result.userId;
  }

  async #authenticateRequired(token: string | undefined): Promise<string> {
    const userId = await this.#authenticate(token);

    if (userId === null) throw new ApiError(401, "unauthorized");

    return userId;
  }

  async #requireOwnedRecord(
    id: string,
    userId: string,
  ): Promise<CharacterSheetRecord> {
    const record = await this.#repository.getMetadata(id);

    if (record === null) throw new ApiError(404, "not_found");
    if (record.ownerUserId !== userId) throw new ApiError(403, "forbidden");

    return record;
  }
}

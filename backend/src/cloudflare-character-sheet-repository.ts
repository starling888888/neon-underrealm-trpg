import type {
  CharacterSheetMetadataInput,
  CharacterSheetType,
} from "@neon-underrealm/shared";
import type { BackendBindings } from "./bindings.js";
import type {
  CharacterSheetRecord,
  CharacterSheetRepository,
  CharacterSheetSnapshot,
} from "./character-sheets.js";

type CharacterSheetRow = {
  created_at: number;
  id: string;
  ikizama_id: string | null;
  owner_user_id: string;
  pc_name: string;
  pl_name: string | null;
  primary_ryugi_id: string | null;
  rank: number;
  type: CharacterSheetType;
  updated_at: number;
};

const toRecord = (row: CharacterSheetRow): CharacterSheetRecord => ({
  createdAt: row.created_at,
  id: row.id,
  ikizamaId: row.ikizama_id,
  ownerUserId: row.owner_user_id,
  pcName: row.pc_name,
  plName: row.pl_name,
  primaryRyugiId: row.primary_ryugi_id,
  rank: row.rank,
  type: row.type,
  updatedAt: row.updated_at,
});

/** D1/R2 primitives used by the service to compose character sheet operations. */
export class CloudflareCharacterSheetRepository
  implements CharacterSheetRepository
{
  readonly #database: D1Database;
  readonly #objectStore: R2Bucket;

  constructor(bindings: Pick<BackendBindings, "DB" | "OBJECTS">) {
    this.#database = bindings.DB;
    this.#objectStore = bindings.OBJECTS;
  }

  async deleteMetadata(id: string): Promise<void> {
    await this.#database
      .prepare("DELETE FROM character_sheets WHERE id = ?")
      .bind(id)
      .run();
  }

  async deleteSnapshot(ownerUserId: string, id: string): Promise<void> {
    await this.#objectStore.delete(this.#snapshotKey(ownerUserId, id));
  }

  async getMetadata(id: string): Promise<CharacterSheetRecord | null> {
    const row = await this.#database
      .prepare(
        `SELECT id, owner_user_id, type, pc_name, pl_name, rank,
                primary_ryugi_id, ikizama_id, created_at, updated_at
           FROM character_sheets
          WHERE id = ?`,
      )
      .bind(id)
      .first<CharacterSheetRow>();

    return row === null ? null : toRecord(row);
  }

  async getSnapshot(
    ownerUserId: string,
    id: string,
  ): Promise<CharacterSheetSnapshot | null> {
    const object = await this.#objectStore.get(
      this.#snapshotKey(ownerUserId, id),
    );

    return object === null ? null : await object.json<CharacterSheetSnapshot>();
  }

  async insertMetadata(record: CharacterSheetRecord): Promise<void> {
    await this.#database
      .prepare(
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
  }

  async listMetadata(): Promise<CharacterSheetRecord[]> {
    const [user, sample] = await Promise.all([
      this.#database
        .prepare(
          `SELECT id, owner_user_id, type, pc_name, pl_name, rank,
                  primary_ryugi_id, ikizama_id, created_at, updated_at
             FROM character_sheets
            WHERE type = 'user'
            ORDER BY updated_at DESC`,
        )
        .all<CharacterSheetRow>(),
      this.#database
        .prepare(
          `SELECT id, owner_user_id, type, pc_name, pl_name, rank,
                  primary_ryugi_id, ikizama_id, created_at, updated_at
             FROM character_sheets
            WHERE type = 'sample'
            ORDER BY created_at ASC`,
        )
        .all<CharacterSheetRow>(),
    ]);

    return [...user.results, ...sample.results].map(toRecord);
  }

  async putSnapshot(
    ownerUserId: string,
    id: string,
    snapshot: CharacterSheetSnapshot,
  ): Promise<void> {
    await this.#objectStore.put(
      this.#snapshotKey(ownerUserId, id),
      JSON.stringify(snapshot),
      { httpMetadata: { contentType: "application/json" } },
    );
  }

  async updateMetadata(
    id: string,
    metadata: CharacterSheetMetadataInput,
    updatedAt: number,
  ): Promise<void> {
    await this.#database
      .prepare(
        `UPDATE character_sheets
            SET pc_name = ?, pl_name = ?, rank = ?, primary_ryugi_id = ?,
                ikizama_id = ?, updated_at = ?
          WHERE id = ?`,
      )
      .bind(
        metadata.pcName,
        metadata.plName ?? null,
        metadata.rank,
        metadata.primaryRyugiId ?? null,
        metadata.ikizamaId ?? null,
        updatedAt,
        id,
      )
      .run();
  }

  #snapshotKey(ownerUserId: string, id: string): string {
    return `${ownerUserId}/${id}.json`;
  }
}

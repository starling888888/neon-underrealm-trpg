import type {
  CharacterSheetInput,
  CharacterSheetMetadataInput,
  CharacterSheetType,
} from "@neon-underrealm/shared";

export type CharacterSheetRecord = CharacterSheetMetadataInput & {
  createdAt: number;
  id: string;
  ownerUserId: string;
  type: CharacterSheetType;
  updatedAt: number;
};

export type CharacterSheetSnapshot = Pick<
  CharacterSheetInput,
  "imageBase64" | "snapshot"
>;

export type CharacterSheetRepository = {
  deleteMetadata(id: string): Promise<void>;
  deleteSnapshot(ownerUserId: string, id: string): Promise<void>;
  getMetadata(id: string): Promise<CharacterSheetRecord | null>;
  getSnapshot(
    ownerUserId: string,
    id: string,
  ): Promise<CharacterSheetSnapshot | null>;
  insertMetadata(record: CharacterSheetRecord): Promise<void>;
  listMetadata(): Promise<CharacterSheetRecord[]>;
  putSnapshot(
    ownerUserId: string,
    id: string,
    snapshot: CharacterSheetSnapshot,
  ): Promise<void>;
  updateMetadata(
    id: string,
    metadata: CharacterSheetMetadataInput,
    updatedAt: number,
  ): Promise<void>;
};

export type TokenVerification =
  | { kind: "expired" }
  | { kind: "invalid" }
  | { kind: "valid"; userId: string };

export type TokenVerifier = {
  verify(token: string): Promise<TokenVerification>;
};

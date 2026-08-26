import type {
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

export type TokenVerification =
  | { kind: "expired" }
  | { kind: "invalid" }
  | { kind: "unavailable" }
  | { kind: "unexpected" }
  | { kind: "valid"; userId: string };

export type TokenVerifier = {
  verify(token: string): Promise<TokenVerification>;
};

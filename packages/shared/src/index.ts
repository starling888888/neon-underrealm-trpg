import { z } from "zod";

/** Marker type for the shared workspace's public API boundary. */
export type SharedPackageBoundary = "@neon-underrealm/shared";

export const characterSheetTypeSchema = z.enum(["sample", "user"]);

export const characterSheetMetadataInputSchema = z.object({
  ikizamaId: z.string().min(1).max(200).nullable().optional(),
  pcName: z.string().trim().min(1).max(200),
  plName: z.string().trim().min(1).max(200).nullable().optional(),
  primaryRyugiId: z.string().min(1).max(200).nullable().optional(),
  rank: z.int().min(0).max(100),
});

/** Shared input schema only; the API response is trusted by the client. */
export const characterSheetInputSchema = z.object({
  id: z.uuid().optional(),
  imageBase64: z
    .string()
    .max(8 * 1024 * 1024)
    .nullable(),
  metadata: characterSheetMetadataInputSchema,
  snapshot: z.record(z.string(), z.unknown()),
});

export type CharacterSheetInput = z.infer<typeof characterSheetInputSchema>;
export type CharacterSheetMetadataInput = z.infer<
  typeof characterSheetMetadataInputSchema
>;
export type CharacterSheetType = z.infer<typeof characterSheetTypeSchema>;

export type CharacterSheetMetadata = CharacterSheetMetadataInput & {
  createdAt: string;
  id: string;
  isOwner: boolean;
  type: CharacterSheetType;
  updatedAt: string;
};

export type CharacterSheet = CharacterSheetMetadata & {
  imageBase64: string | null;
  snapshot: Record<string, unknown>;
};

export type CharacterSheetListResponse = {
  sample: CharacterSheetMetadata[];
  user: CharacterSheetMetadata[];
};

export type ApiErrorCode =
  | "bad_request"
  | "expired_token"
  | "forbidden"
  | "invalid_token"
  | "not_found"
  | "payload_too_large"
  | "unauthorized"
  | "unexpected_error";

export type ApiErrorResponse = {
  error: {
    code: ApiErrorCode;
  };
};

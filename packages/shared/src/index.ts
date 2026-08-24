import { z } from "zod";

export const characterSheetTypeSchema = z.enum(["sample", "user"]);

export const primaryRyugiIds = [
  "kenkaya",
  "emono",
  "sutegoro",
  "kabe",
  "shabazou",
  "teppoudama",
  "yamiuchi",
  "kaeshi",
  "gotoshi",
  "kashira",
] as const;

export const ikizamaIds = ["burai", "kejime", "sumi", "yaku"] as const;

export const characterSheetMetadataInputSchema = z.object({
  ikizamaId: z.enum(ikizamaIds).nullable().optional(),
  pcName: z.string().trim().min(1).max(200),
  plName: z.string().trim().max(200).nullable().optional(),
  primaryRyugiId: z.enum(primaryRyugiIds).nullable().optional(),
  rank: z.int().min(0).max(100),
});

export const characterSheetSnapshotInputSchema = z
  .object({
    imageBase64: z
      .string()
      .max(8 * 1024 * 1024)
      .nullable(),
  })
  .catchall(z.unknown());

/** Shared input schema only; the API response is trusted by the client. */
export const characterSheetInputSchema = z.object({
  id: z.uuid().optional(),
  metadata: characterSheetMetadataInputSchema,
  snapshot: characterSheetSnapshotInputSchema,
});

export type CharacterSheetInput = z.infer<typeof characterSheetInputSchema>;
export type CharacterSheetMetadataInput = z.infer<
  typeof characterSheetMetadataInputSchema
>;
export type CharacterSheetSnapshot = z.infer<
  typeof characterSheetSnapshotInputSchema
>;
export type CharacterSheetType = z.infer<typeof characterSheetTypeSchema>;

export type CharacterSheetMetadata = CharacterSheetMetadataInput & {
  createdAt: number;
  isOwner: boolean;
  type: CharacterSheetType;
  updatedAt: number;
};

export type CharacterSheetSummary = {
  id: string;
  metadata: CharacterSheetMetadata;
};

export type CharacterSheet = CharacterSheetSummary & {
  snapshot: CharacterSheetSnapshot;
};

export type CharacterSheetListResponse = {
  sample: CharacterSheetSummary[];
  user: CharacterSheetSummary[];
};

export type ApplicationErrorCode =
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
    code: ApplicationErrorCode;
  };
};

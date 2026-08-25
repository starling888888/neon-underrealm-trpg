import type { CharacterSheetInput } from "@neon-underrealm/shared";
import { ikizamaIds, primaryRyugiIds } from "@neon-underrealm/shared";
import type { CharacterSheetFormValues } from "../form/values";
import type { CharacterImageRecord } from "../schemas/character-image";

type SaveInputOptions = {
  id?: string;
  image: CharacterImageRecord | null;
  isPublic: boolean;
  pcName: string;
  plName: string;
  values: CharacterSheetFormValues;
};

/** Builds the shared DTO for normal saves and copy saves. */
export function createCharacterSheetInput({
  id,
  image,
  isPublic,
  pcName,
  plName,
  values,
}: SaveInputOptions): CharacterSheetInput {
  return {
    ...(id === undefined ? {} : { id }),
    metadata: {
      ikizamaId: ikizamaIds.includes(values.build.ikizamaId as never)
        ? (values.build
            .ikizamaId as CharacterSheetInput["metadata"]["ikizamaId"])
        : null,
      isPublic,
      pcName,
      plName: plName || null,
      primaryRyugiId: primaryRyugiIds.includes(
        values.build.primaryRyugiId as never,
      )
        ? (values.build
            .primaryRyugiId as CharacterSheetInput["metadata"]["primaryRyugiId"])
        : null,
      rank: values.build.primaryRyugiLevel + values.build.ikizamaLevel,
    },
    snapshot: {
      ...values,
      imageBase64String: image?.base64 ?? null,
      profile: { ...values.profile, pcName, playerName: plName },
    },
  };
}

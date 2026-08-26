import { zodResolver } from "@hookform/resolvers/zod";
import type { CharacterSheet } from "@neon-underrealm/shared";
import { dequal } from "dequal/lite";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { writeTextToClipboard } from "../browser/ccfolia-clipboard";
import {
  CharacterImageError,
  convertCharacterImage,
  decodeImportedCharacterImage,
} from "../browser/character-image";
import { downloadJsonFile } from "../browser/json-download";
import { characterSheetDictionary } from "../dictionary";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../form/values";
import {
  createCharacterSheetJsonFilename,
  serializeCharacterSheetJsonExport,
} from "../logic/json-export";
import {
  deleteCharacterImage,
  readCharacterImage,
  writeCharacterImage,
} from "../persistence/character-image";
import {
  deleteCharacterSheetForm,
  readCharacterSheetForm,
  writeCharacterSheetForm,
} from "../persistence/character-sheet-form";
import type {
  CharacterImageErrorCode,
  CharacterImageRecord,
} from "../schemas/character-image";
import { characterSheetFormSchema } from "../schemas/character-sheet-form";
import {
  parseCharacterSheetRestoreJson,
  parseCharacterSheetRestoreValue,
} from "../schemas/character-sheet-persistence";

export type CharacterImageErrorState = {
  code: CharacterImageErrorCode | "restore";
};

type CharacterSheetRootOperations = {
  convertCharacterImage: typeof convertCharacterImage;
  writeTextToClipboard: typeof writeTextToClipboard;
  decodeImportedCharacterImage: typeof decodeImportedCharacterImage;
  deleteCharacterImage: typeof deleteCharacterImage;
  deleteCharacterSheetForm: typeof deleteCharacterSheetForm;
  downloadJsonFile: typeof downloadJsonFile;
  readCharacterImage: typeof readCharacterImage;
  writeCharacterImage: typeof writeCharacterImage;
  readCharacterSheetForm: typeof readCharacterSheetForm;
  writeCharacterSheetForm: typeof writeCharacterSheetForm;
};

type CharacterSheetRootDependencies = Partial<CharacterSheetRootOperations>;

const defaultOperations: CharacterSheetRootOperations = {
  convertCharacterImage,
  writeTextToClipboard,
  decodeImportedCharacterImage,
  deleteCharacterImage,
  deleteCharacterSheetForm,
  downloadJsonFile,
  readCharacterImage,
  writeCharacterImage,
  readCharacterSheetForm,
  writeCharacterSheetForm,
};

type RootOperation = {
  label: string;
};

export type RemoteCharacterState = {
  id: string;
  isOwner: boolean;
  isPublic: boolean;
};

function toImageErrorState(error: unknown): CharacterImageErrorState {
  if (error instanceof CharacterImageError) {
    return { code: error.code };
  }

  return { code: "storage" };
}

/** Owns form state and cross-cutting character-sheet UI state. */
export default function useCharacterSheetRootState(
  remoteCharacterIdOrDependencies:
    | string
    | null
    | CharacterSheetRootDependencies = null,
  dependencies: CharacterSheetRootDependencies = {},
) {
  const remoteCharacterId =
    typeof remoteCharacterIdOrDependencies === "string"
      ? remoteCharacterIdOrDependencies
      : null;
  const resolvedDependencies =
    typeof remoteCharacterIdOrDependencies === "object" &&
    remoteCharacterIdOrDependencies !== null
      ? remoteCharacterIdOrDependencies
      : dependencies;
  const operationsRef = useRef({
    ...defaultOperations,
    ...resolvedDependencies,
  });
  const operations = operationsRef.current;
  const isLocalCharacter = remoteCharacterId === null;
  const remoteCharacterIdRef = useRef(remoteCharacterId);
  const form = useForm<CharacterSheetFormValues>({
    defaultValues: characterSheetDefaultValues,
    mode: "onChange",
    resolver: zodResolver(characterSheetFormSchema),
  });
  const [characterImage, setCharacterImage] =
    useState<CharacterImageRecord | null>(null);
  const [rootOperation, setRootOperation] = useState<RootOperation | null>(
    null,
  );
  const [imageError, setImageError] = useState<CharacterImageErrorState | null>(
    null,
  );
  const [isImageErrorFromReset, setIsImageErrorFromReset] = useState(false);
  const [isFormRestoring, setIsFormRestoring] = useState(true);
  const [isCharacterImageRestoring, setIsCharacterImageRestoring] =
    useState(true);
  const [isFormRestoreErrorOpen, setIsFormRestoreErrorOpen] = useState(false);
  const [formResetVersion, setFormResetVersion] = useState(0);
  const [remoteCharacter, setRemoteCharacter] =
    useState<RemoteCharacterState | null>(null);
  const formRestoreConfirmButtonRef = useRef<HTMLButtonElement>(null);
  const formRestoreReturnFocusRef = useRef<HTMLInputElement>(null);
  const imageReturnFocusRef = useRef<HTMLButtonElement>(null);
  const imageErrorCloseButtonRef = useRef<HTMLButtonElement>(null);
  const hasCommittedImageRef = useRef(false);
  const isLocalDraftPersistenceSuspendedRef = useRef(false);
  const resetForm = useCallback(
    (values: CharacterSheetFormValues) => {
      form.reset(values);
      setFormResetVersion((version) => version + 1);
    },
    [form],
  );

  const persistLocalDraftForm = useCallback(
    (values: CharacterSheetFormValues) => {
      if (dequal(values, characterSheetDefaultValues)) {
        operations.deleteCharacterSheetForm(window.localStorage);
      } else {
        operations.writeCharacterSheetForm(window.localStorage, values);
      }
    },
    [operations],
  );

  useEffect(() => {
    remoteCharacterIdRef.current = remoteCharacterId;
    setRemoteCharacter(null);
    if (isLocalCharacter) {
      isLocalDraftPersistenceSuspendedRef.current = false;
    }
    if (!isLocalCharacter) {
      setCharacterImage(null);
      setIsCharacterImageRestoring(false);
      setIsFormRestoring(false);
      resetForm(structuredClone(characterSheetDefaultValues));
    }
  }, [isLocalCharacter, remoteCharacterId, resetForm]);

  useEffect(() => {
    if (!isLocalCharacter) return;

    let isCurrent = true;
    hasCommittedImageRef.current = false;
    setIsCharacterImageRestoring(true);
    setCharacterImage(null);

    void operations
      .readCharacterImage()
      .then((record) => {
        if (isCurrent && !hasCommittedImageRef.current && record !== null) {
          setCharacterImage(record);
        }
      })
      .catch(() => {
        if (isCurrent && !hasCommittedImageRef.current) {
          setImageError({ code: "restore" });
        }
      })
      .finally(() => {
        if (isCurrent) {
          setIsCharacterImageRestoring(false);
        }
      });

    return () => {
      isCurrent = false;
    };
  }, [isLocalCharacter, operations]);

  useEffect(() => {
    if (!isLocalCharacter) return;

    setIsFormRestoring(true);
    try {
      const text = operations.readCharacterSheetForm(window.localStorage);
      if (text !== null) {
        const values = parseCharacterSheetRestoreJson(text);
        if (values === null) {
          setIsFormRestoreErrorOpen(true);
        } else {
          resetForm(values);
        }
      } else {
        resetForm(structuredClone(characterSheetDefaultValues));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsFormRestoring(false);
    }
  }, [isLocalCharacter, operations, resetForm]);

  useEffect(() => {
    if (!isLocalCharacter || isFormRestoring) return;

    let timeout: ReturnType<typeof setTimeout> | undefined;
    let latestValues = form.getValues();
    let hasPendingWrite = false;
    const flush = () => {
      if (!hasPendingWrite || isLocalDraftPersistenceSuspendedRef.current)
        return;
      hasPendingWrite = false;
      if (timeout !== undefined) clearTimeout(timeout);
      try {
        persistLocalDraftForm(latestValues);
      } catch (error) {
        console.error(error);
      }
    };
    const subscription = form.subscribe({
      callback: ({ values }) => {
        latestValues = values as CharacterSheetFormValues;
        if (timeout !== undefined) clearTimeout(timeout);
        hasPendingWrite = true;
        timeout = setTimeout(() => {
          flush();
        }, 200);
      },
      formState: { values: true },
    });
    window.addEventListener("pagehide", flush);

    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
      subscription();
    };
  }, [form, isFormRestoring, isLocalCharacter, persistLocalDraftForm]);

  const onCharacterImageOperationStarted = useCallback(
    (trigger: HTMLButtonElement): void => {
      imageReturnFocusRef.current = trigger;
    },
    [],
  );

  const runRootOperation = useCallback(
    async <T>(label: string, operation: () => Promise<T>): Promise<T> => {
      setRootOperation({ label });

      try {
        return await operation();
      } finally {
        setRootOperation(null);
      }
    },
    [],
  );

  const onCharacterImageSelected = useCallback(
    async (file: File): Promise<void> => {
      setIsImageErrorFromReset(false);
      try {
        await runRootOperation(
          characterSheetDictionary.characterSheet.image.loading,
          async () => {
            const record = await operations.convertCharacterImage(file);

            if (isLocalCharacter) await operations.writeCharacterImage(record);
            hasCommittedImageRef.current = true;
            setCharacterImage(record);
          },
        );
      } catch (error) {
        setIsImageErrorFromReset(false);
        setImageError(toImageErrorState(error));
      }
    },
    [isLocalCharacter, operations, runRootOperation],
  );

  const onCharacterImageCleared = useCallback(async (): Promise<void> => {
    setIsImageErrorFromReset(false);
    try {
      await runRootOperation(
        characterSheetDictionary.characterSheet.image.clearing,
        async () => {
          if (isLocalCharacter) await operations.deleteCharacterImage();
          hasCommittedImageRef.current = true;
          setCharacterImage(null);
        },
      );
    } catch (error) {
      setIsImageErrorFromReset(false);
      setImageError(toImageErrorState(error));
    }
  }, [isLocalCharacter, operations, runRootOperation]);

  const onResetConfirmed = useCallback(async (): Promise<void> => {
    if (
      !isLocalCharacter ||
      isCharacterImageRestoring ||
      rootOperation !== null
    )
      return;

    setIsImageErrorFromReset(false);
    try {
      await runRootOperation(
        characterSheetDictionary.characterSheet.reset.loading,
        async () => {
          const valuesBeforeReset = structuredClone(form.getValues());
          try {
            operations.deleteCharacterSheetForm(window.localStorage);
          } catch {
            throw new CharacterImageError("storage");
          }

          try {
            await operations.deleteCharacterImage();
          } catch (error) {
            try {
              operations.writeCharacterSheetForm(
                window.localStorage,
                valuesBeforeReset,
              );
            } catch {
              // The reset remains failed; retain the in-memory state and report it.
            }
            throw error;
          }

          hasCommittedImageRef.current = true;
          setCharacterImage(null);
          resetForm(structuredClone(characterSheetDefaultValues));
        },
      );
    } catch (error) {
      setIsImageErrorFromReset(true);
      setImageError(toImageErrorState(error));
    }
  }, [
    form,
    isCharacterImageRestoring,
    isLocalCharacter,
    operations,
    resetForm,
    rootOperation,
    runRootOperation,
  ]);

  const onJsonExport = useCallback((): void => {
    if (isCharacterImageRestoring) return;

    const values = form.getValues();

    operations.downloadJsonFile(
      serializeCharacterSheetJsonExport(values, characterImage),
      createCharacterSheetJsonFilename(values, new Date()),
    );
  }, [characterImage, form, isCharacterImageRestoring, operations]);

  const onCcfoliaCopy = useCallback(
    async (json: string): Promise<boolean> => {
      if (rootOperation !== null) return false;

      try {
        await runRootOperation(
          characterSheetDictionary.characterSheet.ccfolia.loading,
          () => operations.writeTextToClipboard(json),
        );
        return true;
      } catch {
        return false;
      }
    },
    [operations, rootOperation, runRootOperation],
  );

  const bindRemoteCharacter = useCallback(
    ({ id, metadata }: CharacterSheet) => {
      const next = {
        id,
        isOwner: metadata.isOwner,
        isPublic: metadata.isPublic,
      };
      setRemoteCharacter(next);
    },
    [],
  );

  const bindRemoteSummary = useCallback(
    (summary: Pick<CharacterSheet, "id" | "metadata">) => {
      setRemoteCharacter({
        id: summary.id,
        isOwner: summary.metadata.isOwner,
        isPublic: summary.metadata.isPublic,
      });
    },
    [],
  );

  const clearRemoteCharacter = useCallback(() => {
    setRemoteCharacter(null);
  }, []);

  const clearCharacterImageForCopy = useCallback(async (): Promise<boolean> => {
    try {
      await runRootOperation(
        characterSheetDictionary.characterSheet.image.clearing,
        async () => {
          hasCommittedImageRef.current = true;
          setCharacterImage(null);
        },
      );
      return true;
    } catch (error) {
      setImageError(toImageErrorState(error));
      return false;
    }
  }, [runRootOperation]);

  const clearLocalDraftForRemote = useCallback(async (): Promise<void> => {
    isLocalDraftPersistenceSuspendedRef.current = true;
    try {
      operations.deleteCharacterSheetForm(window.localStorage);
      await operations.deleteCharacterImage();
    } catch (error) {
      isLocalDraftPersistenceSuspendedRef.current = false;
      throw error;
    }
  }, [operations]);

  const updateRemoteCharacterMetadata = useCallback(
    ({
      id,
      metadata,
    }: {
      id: string;
      metadata: Pick<CharacterSheet["metadata"], "isOwner" | "isPublic">;
    }) => {
      if (remoteCharacter?.id !== id) return;
      setRemoteCharacter({
        id,
        isOwner: metadata.isOwner,
        isPublic: metadata.isPublic,
      });
    },
    [remoteCharacter?.id],
  );

  const restoreRemoteCharacter = useCallback(
    async (character: CharacterSheet): Promise<boolean> => {
      if (character.id !== remoteCharacterIdRef.current) return false;
      const values = parseCharacterSheetRestoreValue(character.snapshot);
      if (values === null) return false;

      let image: CharacterImageRecord | null = null;
      if (character.snapshot.imageBase64String !== null) {
        try {
          image = await operations.decodeImportedCharacterImage(
            character.snapshot.imageBase64String,
          );
        } catch {
          return false;
        }
      }

      if (character.id !== remoteCharacterIdRef.current) return false;

      try {
        let restored = false;
        await runRootOperation(
          characterSheetDictionary.characterSheet.persistence.restoring,
          async () => {
            if (character.id !== remoteCharacterIdRef.current) return;
            hasCommittedImageRef.current = true;
            setCharacterImage(image);
            resetForm(values);
            restored = true;
          },
        );
        if (!restored) return false;
        bindRemoteCharacter(character);
        return true;
      } catch {
        return false;
      }
    },
    [bindRemoteCharacter, operations, resetForm, runRootOperation],
  );

  return {
    characterImage,
    bindRemoteCharacter,
    bindRemoteSummary,
    clearLocalDraftForRemote,
    clearCharacterImageForCopy,
    clearRemoteCharacter,
    form,
    formResetVersion,
    imageError,
    isImageErrorFromReset,
    imageErrorCloseButtonRef,
    imageReturnFocusRef,
    formRestoreConfirmButtonRef,
    formRestoreReturnFocusRef,
    isCharacterImageRestoring,
    isFormRestoreErrorOpen,
    isFormRestoring,
    isRootOperationInProgress: rootOperation !== null,
    onCharacterImageSelected,
    onCharacterImageCleared,
    onCharacterImageOperationStarted,
    onCcfoliaCopy,
    onJsonExport,
    onResetConfirmed,
    setImageError,
    setIsFormRestoreErrorOpen,
    rootOperation,
    remoteCharacter,
    restoreRemoteCharacter,
    updateRemoteCharacterMetadata,
  };
}

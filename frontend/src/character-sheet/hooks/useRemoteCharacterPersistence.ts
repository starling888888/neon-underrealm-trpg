import type {
  CharacterSheet,
  CharacterSheetListResponse,
  CharacterSheetSummary,
} from "@neon-underrealm/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { createCharacterSheetInput } from "../api/character-sheet-input";
import {
  type CharacterSheetApiClient,
  CharacterSheetApiError,
  createCharacterSheetApiClient,
} from "../api/character-sheets";
import type { Authentication } from "../auth/types";
import { characterSheetDictionary } from "../dictionary";
import type { CharacterSheetFormValues } from "../form/values";
import type { CharacterImageRecord } from "../schemas/character-image";
import type { RemoteCharacterState } from "./useCharacterSheetRootState";

type RemoteCharacterOperations = {
  bindRemoteSummary: (summary: Pick<CharacterSheet, "id" | "metadata">) => void;
  clearCharacterImageForCopy: () => Promise<boolean>;
  clearLocalDraftForRemote: () => Promise<void>;
  clearRemoteCharacter: () => void;
  restoreRemoteCharacter: (character: CharacterSheet) => Promise<boolean>;
  updateRemoteCharacterMetadata: (value: {
    id: string;
    metadata: Pick<CharacterSheet["metadata"], "isOwner" | "isPublic">;
  }) => void;
};

type UseRemoteCharacterPersistenceArgs = RemoteCharacterOperations & {
  authentication: Authentication;
  characterImage: CharacterImageRecord | null;
  form: UseFormReturn<CharacterSheetFormValues>;
  isRootOperationInProgress: boolean;
  notify: (kind: "error" | "success", message: string) => void;
  onNavigate: (id: string | null) => void;
  remoteCharacter: RemoteCharacterState | null;
  remoteCharacterId: string | null;
};

type RemoteCharacterPersistenceDependencies = {
  characterSheetApi: CharacterSheetApiClient;
};

export type RemoteCharacterPersistenceDialogProps = {
  characterList: {
    cache: CharacterSheetListResponse | null;
    isLoading: boolean;
    isOpen: boolean;
    onRequestClose: () => void;
    onSelect: (id: string) => void;
  };
  copySave: {
    isOpen: boolean;
    isSaving: boolean;
    onConfirm: (pcName: string, plName: string, isPublic: boolean) => void;
    onRequestClose: () => void;
  };
  delete: {
    isDeleting: boolean;
    isOpen: boolean;
    onConfirm: () => void;
    onRequestClose: () => void;
  };
  save: {
    initialPcName: string;
    initialPublic: boolean;
    isOpen: boolean;
    isSaving: boolean;
    onConfirm: (pcName: string, isPublic: boolean) => void;
    onRequestClose: () => void;
  };
};

class AuthenticationSessionExpiredError extends Error {}
class AuthenticationTokenUnavailableError extends Error {}

const { authentication: authenticationCopy, persistence } =
  characterSheetDictionary.characterSheet;

function requireIdToken(idToken: string | null): string {
  if (idToken === null) throw new AuthenticationTokenUnavailableError();
  return idToken;
}

/** Coordinates remote API state without making the island Container a feature store. */
export default function useRemoteCharacterPersistence(
  {
    authentication,
    bindRemoteSummary,
    characterImage,
    clearCharacterImageForCopy,
    clearLocalDraftForRemote,
    clearRemoteCharacter,
    form,
    isRootOperationInProgress,
    notify,
    onNavigate,
    remoteCharacter,
    remoteCharacterId,
    restoreRemoteCharacter,
    updateRemoteCharacterMetadata,
  }: UseRemoteCharacterPersistenceArgs,
  dependencies: Partial<RemoteCharacterPersistenceDependencies> = {},
) {
  const apiRef = useRef(
    dependencies.characterSheetApi ?? createCharacterSheetApiClient(),
  );
  const characterSheetApi = apiRef.current;
  const [characterListCache, setCharacterListCache] =
    useState<CharacterSheetListResponse | null>(null);
  const [characterListCacheSessionKey, setCharacterListCacheSessionKey] =
    useState<string | null>(null);
  const [isCharacterListLoading, setIsCharacterListLoading] = useState(false);
  const [isCharacterListOpen, setIsCharacterListOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isCopySaveOpen, setIsCopySaveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRemoteOperationInProgress, setIsRemoteOperationInProgress] =
    useState(false);
  const [failedRemoteCharacterId, setFailedRemoteCharacterId] = useState<
    string | null
  >(null);
  const previousSessionKey = useRef<string | null | undefined>(undefined);
  const characterListRequestVersionRef = useRef(0);
  const remoteRequestVersionRef = useRef(0);
  const sessionKey = authentication.sessionKey;
  const isAuthenticated = sessionKey !== null;
  const isRemoteRoute = remoteCharacterId !== null;
  const isRemoteCharacterLoading =
    isRemoteRoute &&
    remoteCharacter?.id !== remoteCharacterId &&
    failedRemoteCharacterId !== remoteCharacterId;
  const isRemoteCharacterLoadFailed =
    isRemoteRoute &&
    remoteCharacter === null &&
    failedRemoteCharacterId === remoteCharacterId;
  const isEditable =
    !isRemoteRoute ||
    (remoteCharacter !== null && isAuthenticated && remoteCharacter.isOwner);

  const runApiRequest = useCallback(
    async <T>(
      request: (idToken: string | null) => Promise<T>,
      requiresAuthentication: boolean,
    ): Promise<T> => {
      const requestSessionKey = authentication.sessionKey;
      if (requiresAuthentication && requestSessionKey === null) {
        throw new AuthenticationTokenUnavailableError();
      }

      let idToken: string | null = null;
      if (requestSessionKey !== null) {
        idToken = await authentication.getIdToken();
        if (idToken === null) {
          throw new AuthenticationTokenUnavailableError();
        }
      }

      try {
        return await request(idToken);
      } catch (error) {
        if (
          !(error instanceof CharacterSheetApiError) ||
          !error.isExpiredToken ||
          requestSessionKey === null
        ) {
          throw error;
        }

        const refreshedToken = await authentication.getIdToken(true);
        if (refreshedToken === null) {
          await authentication.onLogout().catch(() => undefined);
          throw new AuthenticationSessionExpiredError();
        }

        try {
          return await request(refreshedToken);
        } catch (retryError) {
          if (
            retryError instanceof CharacterSheetApiError &&
            retryError.isExpiredToken
          ) {
            await authentication.onLogout().catch(() => undefined);
            throw new AuthenticationSessionExpiredError();
          }
          throw retryError;
        }
      }
    },
    [authentication],
  );

  const onApiError = useCallback(
    (error: unknown, fallback: string) => {
      if (error instanceof AuthenticationSessionExpiredError) {
        notify("error", authenticationCopy.sessionExpired);
        return;
      }
      notify("error", fallback);
    },
    [notify],
  );

  const updateCachedSummary = useCallback((summary: CharacterSheetSummary) => {
    setCharacterListCache((current) => {
      if (current === null) return current;
      if (summary.metadata.type === "sample") {
        const sample = [
          ...current.sample.filter(({ id }) => id !== summary.id),
          summary,
        ].sort(
          (left, right) => left.metadata.createdAt - right.metadata.createdAt,
        );
        return { ...current, sample };
      }

      return {
        ...current,
        user: [summary, ...current.user.filter(({ id }) => id !== summary.id)],
      };
    });
  }, []);

  useEffect(() => {
    if (authentication.status === "initializing") return;
    const previous = previousSessionKey.current;
    previousSessionKey.current = sessionKey;
    if (previous === undefined || previous === sessionKey) return;

    setCharacterListCache(null);
    setCharacterListCacheSessionKey(null);
    characterListRequestVersionRef.current += 1;
    if (remoteCharacter !== null) {
      updateRemoteCharacterMetadata({
        id: remoteCharacter.id,
        metadata: { isOwner: false, isPublic: remoteCharacter.isPublic },
      });
    }
  }, [
    authentication.status,
    remoteCharacter,
    sessionKey,
    updateRemoteCharacterMetadata,
  ]);

  useEffect(() => {
    if (
      authentication.status === "initializing" ||
      remoteCharacterId === null
    ) {
      return;
    }

    const requestVersion = ++remoteRequestVersionRef.current;
    void runApiRequest(
      (idToken) => characterSheetApi.get(remoteCharacterId, idToken),
      false,
    )
      .then(async (character) => {
        if (requestVersion !== remoteRequestVersionRef.current) return;
        const restored = await restoreRemoteCharacter(character);
        if (!restored) {
          setFailedRemoteCharacterId(remoteCharacterId);
          notify("error", persistence.remoteRestoreError);
        }
      })
      .catch((error) => {
        if (requestVersion === remoteRequestVersionRef.current) {
          setFailedRemoteCharacterId(remoteCharacterId);
          onApiError(error, persistence.loadError);
        }
      });

    return () => {
      remoteRequestVersionRef.current += 1;
    };
  }, [
    authentication.status,
    characterSheetApi,
    notify,
    onApiError,
    remoteCharacterId,
    restoreRemoteCharacter,
    runApiRequest,
  ]);

  const openCharacterList = useCallback(() => {
    setIsCharacterListOpen(true);
  }, []);

  useEffect(() => {
    if (
      !isCharacterListOpen ||
      authentication.status === "initializing" ||
      (characterListCache !== null &&
        characterListCacheSessionKey === sessionKey)
    ) {
      return;
    }

    setIsCharacterListLoading(true);
    const requestVersion = ++characterListRequestVersionRef.current;
    const requestSessionKey = sessionKey;
    void runApiRequest((idToken) => characterSheetApi.list(idToken), false)
      .then((response) => {
        if (requestVersion !== characterListRequestVersionRef.current) return;
        setCharacterListCache(response);
        setCharacterListCacheSessionKey(requestSessionKey);
      })
      .catch((error) => {
        if (requestVersion === characterListRequestVersionRef.current) {
          onApiError(error, persistence.listLoadError);
        }
      })
      .finally(() => {
        if (requestVersion === characterListRequestVersionRef.current) {
          setIsCharacterListLoading(false);
        }
      });
  }, [
    authentication.status,
    characterListCache,
    characterListCacheSessionKey,
    characterSheetApi,
    isCharacterListOpen,
    onApiError,
    runApiRequest,
    sessionKey,
  ]);

  const selectCharacter = useCallback(
    (id: string) => {
      setIsCharacterListOpen(false);
      onNavigate(id);
    },
    [onNavigate],
  );

  const save = useCallback(
    (pcName: string, isPublic: boolean) => {
      if (!isAuthenticated || isRemoteOperationInProgress) return;
      setIsRemoteOperationInProgress(true);
      void runApiRequest(
        (idToken) =>
          characterSheetApi.save(
            createCharacterSheetInput({
              id: remoteCharacter?.id,
              image: characterImage,
              isPublic,
              pcName,
              plName: form.getValues().profile.playerName,
              values: form.getValues(),
            }),
            requireIdToken(idToken),
          ),
        true,
      )
        .then(async (summary) => {
          form.setValue("profile.pcName", pcName);
          if (!isRemoteRoute) {
            try {
              await clearLocalDraftForRemote();
            } catch {
              notify("error", persistence.localDraftCleanupError);
              return;
            }
          }
          bindRemoteSummary(summary);
          updateCachedSummary(summary);
          onNavigate(summary.id);
          setIsSaveOpen(false);
          notify("success", persistence.saveSuccess);
        })
        .catch((error) => onApiError(error, persistence.saveError))
        .finally(() => setIsRemoteOperationInProgress(false));
    },
    [
      bindRemoteSummary,
      characterImage,
      characterSheetApi,
      clearLocalDraftForRemote,
      form,
      isAuthenticated,
      isRemoteOperationInProgress,
      notify,
      onApiError,
      onNavigate,
      remoteCharacter?.id,
      runApiRequest,
      isRemoteRoute,
      updateCachedSummary,
    ],
  );

  const copySave = useCallback(
    (pcName: string, plName: string, isPublic: boolean) => {
      if (!isAuthenticated || !isRemoteRoute || isRemoteOperationInProgress)
        return;
      setIsRemoteOperationInProgress(true);
      const values = form.getValues();
      void runApiRequest(
        (idToken) =>
          characterSheetApi.save(
            createCharacterSheetInput({
              image: null,
              isPublic,
              pcName,
              plName,
              values,
            }),
            requireIdToken(idToken),
          ),
        true,
      )
        .then(async (summary) => {
          form.setValue("profile.pcName", pcName);
          form.setValue("profile.playerName", plName);
          bindRemoteSummary(summary);
          updateCachedSummary(summary);
          onNavigate(summary.id);
          setIsCopySaveOpen(false);
          notify("success", persistence.copySaveSuccess);
          await clearCharacterImageForCopy();
        })
        .catch((error) => onApiError(error, persistence.copySaveError))
        .finally(() => setIsRemoteOperationInProgress(false));
    },
    [
      bindRemoteSummary,
      characterSheetApi,
      clearCharacterImageForCopy,
      form,
      isAuthenticated,
      isRemoteOperationInProgress,
      isRemoteRoute,
      notify,
      onApiError,
      onNavigate,
      runApiRequest,
      updateCachedSummary,
    ],
  );

  const remove = useCallback(() => {
    if (
      !isAuthenticated ||
      remoteCharacter === null ||
      !remoteCharacter.isOwner ||
      isRemoteOperationInProgress
    ) {
      return;
    }
    setIsRemoteOperationInProgress(true);
    void runApiRequest(
      (idToken) =>
        characterSheetApi.delete(remoteCharacter.id, requireIdToken(idToken)),
      true,
    )
      .then(() => {
        clearRemoteCharacter();
        setCharacterListCache((current) =>
          current === null
            ? current
            : {
                sample: current.sample.filter(
                  ({ id }) => id !== remoteCharacter.id,
                ),
                user: current.user.filter(
                  ({ id }) => id !== remoteCharacter.id,
                ),
              },
        );
        onNavigate(null);
        setIsDeleteOpen(false);
        notify("success", persistence.deleteSuccess);
      })
      .catch((error) => onApiError(error, persistence.deleteError))
      .finally(() => setIsRemoteOperationInProgress(false));
  }, [
    characterSheetApi,
    clearRemoteCharacter,
    isAuthenticated,
    isRemoteOperationInProgress,
    notify,
    onApiError,
    onNavigate,
    remoteCharacter,
    runApiRequest,
  ]);

  const openSave = useCallback(() => setIsSaveOpen(true), []);
  const closeSave = useCallback(() => setIsSaveOpen(false), []);
  const openCopySave = useCallback(() => setIsCopySaveOpen(true), []);
  const closeCopySave = useCallback(() => setIsCopySaveOpen(false), []);
  const openDelete = useCallback(() => setIsDeleteOpen(true), []);
  const closeDelete = useCallback(() => setIsDeleteOpen(false), []);
  const closeCharacterList = useCallback(
    () => setIsCharacterListOpen(false),
    [],
  );
  const dialogProps = useMemo<RemoteCharacterPersistenceDialogProps>(
    () => ({
      characterList: {
        cache:
          characterListCacheSessionKey === sessionKey
            ? characterListCache
            : null,
        isLoading: isCharacterListLoading,
        isOpen: isCharacterListOpen,
        onRequestClose: closeCharacterList,
        onSelect: selectCharacter,
      },
      copySave: {
        isOpen: isCopySaveOpen,
        isSaving: isRemoteOperationInProgress,
        onConfirm: copySave,
        onRequestClose: closeCopySave,
      },
      delete: {
        isDeleting: isRemoteOperationInProgress,
        isOpen: isDeleteOpen,
        onConfirm: remove,
        onRequestClose: closeDelete,
      },
      save: {
        initialPcName: form.getValues().profile.pcName,
        initialPublic: remoteCharacter?.isPublic ?? true,
        isOpen: isSaveOpen,
        isSaving: isRemoteOperationInProgress,
        onConfirm: save,
        onRequestClose: closeSave,
      },
    }),
    [
      characterListCache,
      characterListCacheSessionKey,
      closeCharacterList,
      closeCopySave,
      closeDelete,
      closeSave,
      copySave,
      form,
      isCharacterListLoading,
      isCharacterListOpen,
      isCopySaveOpen,
      isDeleteOpen,
      isRemoteOperationInProgress,
      isSaveOpen,
      remoteCharacter?.isPublic,
      remove,
      save,
      selectCharacter,
      sessionKey,
    ],
  );

  return useMemo(
    () => ({
      dialogProps,
      isCopySaveDisabled:
        !isAuthenticated ||
        !isRemoteRoute ||
        remoteCharacter === null ||
        isRootOperationInProgress ||
        isRemoteOperationInProgress,
      isDeleteDisabled:
        !isAuthenticated ||
        remoteCharacter === null ||
        !remoteCharacter.isOwner ||
        isRootOperationInProgress ||
        isRemoteOperationInProgress,
      isEditable,
      isRemoteCharacterLoadFailed,
      isRemoteCharacterLoading,
      isSaveDisabled:
        !isAuthenticated ||
        !isEditable ||
        isRootOperationInProgress ||
        isRemoteOperationInProgress,
      openCharacterList,
      openCopySave,
      openDelete,
      openSave,
    }),
    [
      dialogProps,
      isAuthenticated,
      isEditable,
      isRemoteCharacterLoadFailed,
      isRemoteCharacterLoading,
      isRemoteOperationInProgress,
      isRootOperationInProgress,
      isRemoteRoute,
      openCharacterList,
      openCopySave,
      openDelete,
      openSave,
      remoteCharacter,
    ],
  );
}

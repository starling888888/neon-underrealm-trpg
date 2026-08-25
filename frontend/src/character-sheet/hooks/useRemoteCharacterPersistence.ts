import type {
  CharacterSheet,
  CharacterSheetListResponse,
  CharacterSheetSummary,
} from "@neon-underrealm/shared";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import { createCharacterSheetInput } from "../api/character-sheet-input";
import {
  CharacterSheetApiError,
  createCharacterSheetApiClient,
  type CharacterSheetApiClient,
} from "../api/character-sheets";
import type { Authentication } from "../auth/types";
import { characterSheetDictionary } from "../dictionary";
import type { CharacterSheetFormValues } from "../form/values";
import type { CharacterImageRecord } from "../schemas/character-image";
import type { RemoteCharacterState } from "./useCharacterSheetRootState";

type RemoteCharacterOperations = {
  bindRemoteSummary: (summary: Pick<CharacterSheet, "id" | "metadata">) => void;
  clearCharacterImageForCopy: () => Promise<boolean>;
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
  remoteCharacter: RemoteCharacterState | null;
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

const createRemoteRefreshKey = (sessionKey: string, id: string) =>
  `${sessionKey}\u0000${id}`;

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
    clearRemoteCharacter,
    form,
    isRootOperationInProgress,
    notify,
    remoteCharacter,
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
  const previousSessionKey = useRef<string | null | undefined>(undefined);
  const remoteRefreshKeyRef = useRef<string | null>(null);
  const characterListRequestVersionRef = useRef(0);
  const sessionKey = authentication.sessionKey;
  const isAuthenticated = sessionKey !== null;
  const isEditable =
    remoteCharacter === null || (isAuthenticated && remoteCharacter.isOwner);

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
    remoteRefreshKeyRef.current = null;

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
      authentication.status !== "signed-in" ||
      sessionKey === null ||
      remoteCharacter === null
    ) {
      return;
    }

    const refreshKey = createRemoteRefreshKey(sessionKey, remoteCharacter.id);
    if (remoteRefreshKeyRef.current === refreshKey) return;
    remoteRefreshKeyRef.current = refreshKey;

    void runApiRequest(
      (idToken) => characterSheetApi.get(remoteCharacter.id, idToken),
      false,
    )
      .then((character) => restoreRemoteCharacter(character))
      .catch(() => undefined);
  }, [
    authentication.status,
    characterSheetApi,
    remoteCharacter,
    restoreRemoteCharacter,
    runApiRequest,
    sessionKey,
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
      setIsCharacterListLoading(true);
      void runApiRequest((idToken) => characterSheetApi.get(id, idToken), false)
        .then(async (character) => {
          if (sessionKey !== null) {
            remoteRefreshKeyRef.current = createRemoteRefreshKey(
              sessionKey,
              id,
            );
          }
          return restoreRemoteCharacter(character);
        })
        .then((restored) => {
          if (restored) {
            setIsCharacterListOpen(false);
          } else {
            notify("error", persistence.remoteRestoreError);
          }
        })
        .catch((error) => onApiError(error, persistence.loadError))
        .finally(() => setIsCharacterListLoading(false));
    },
    [
      characterSheetApi,
      notify,
      onApiError,
      restoreRemoteCharacter,
      runApiRequest,
      sessionKey,
    ],
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
        .then((summary) => {
          if (sessionKey !== null) {
            remoteRefreshKeyRef.current = createRemoteRefreshKey(
              sessionKey,
              summary.id,
            );
          }
          form.setValue("profile.pcName", pcName);
          bindRemoteSummary(summary);
          updateCachedSummary(summary);
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
      form,
      isAuthenticated,
      isRemoteOperationInProgress,
      notify,
      onApiError,
      remoteCharacter?.id,
      runApiRequest,
      sessionKey,
      updateCachedSummary,
    ],
  );

  const copySave = useCallback(
    (pcName: string, plName: string, isPublic: boolean) => {
      if (!isAuthenticated || isRemoteOperationInProgress) return;
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
          if (sessionKey !== null) {
            remoteRefreshKeyRef.current = createRemoteRefreshKey(
              sessionKey,
              summary.id,
            );
          }
          form.setValue("profile.pcName", pcName);
          form.setValue("profile.playerName", plName);
          bindRemoteSummary(summary);
          updateCachedSummary(summary);
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
      notify,
      onApiError,
      runApiRequest,
      sessionKey,
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
        remoteRefreshKeyRef.current = null;
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
        isRootOperationInProgress ||
        isRemoteOperationInProgress,
      isDeleteDisabled:
        !isAuthenticated ||
        remoteCharacter === null ||
        !remoteCharacter.isOwner ||
        isRootOperationInProgress ||
        isRemoteOperationInProgress,
      isEditable,
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
      isRemoteOperationInProgress,
      isRootOperationInProgress,
      openCharacterList,
      openCopySave,
      openDelete,
      openSave,
      remoteCharacter,
    ],
  );
}

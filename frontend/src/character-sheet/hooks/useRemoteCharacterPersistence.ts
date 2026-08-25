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
import type { GoogleAuthentication } from "../auth/types";
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
  authentication: GoogleAuthentication;
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

const { authentication: authenticationCopy, persistence } =
  characterSheetDictionary.characterSheet;

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
  const [characterListCacheToken, setCharacterListCacheToken] = useState<
    string | null
  >(null);
  const [isCharacterListLoading, setIsCharacterListLoading] = useState(false);
  const [isCharacterListOpen, setIsCharacterListOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isCopySaveOpen, setIsCopySaveOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isRemoteOperationInProgress, setIsRemoteOperationInProgress] =
    useState(false);
  const previousIdToken = useRef<string | null | undefined>(undefined);
  const idToken = authentication.idToken ?? null;
  const isEditable =
    remoteCharacter === null || (idToken !== null && remoteCharacter.isOwner);

  const onApiError = useCallback(
    (error: unknown, fallback: string) => {
      if (error instanceof CharacterSheetApiError && error.isExpiredToken) {
        authentication.onLogout();
        notify("error", authenticationCopy.sessionExpired);
        return;
      }
      notify("error", fallback);
    },
    [authentication, notify],
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
    const previous = previousIdToken.current;
    previousIdToken.current = idToken;
    if (previous === undefined || previous === idToken) return;
    setCharacterListCache(null);
    setCharacterListCacheToken(null);
    if (remoteCharacter === null) return;
    if (idToken === null) {
      updateRemoteCharacterMetadata({
        id: remoteCharacter.id,
        metadata: { isOwner: false, isPublic: remoteCharacter.isPublic },
      });
      return;
    }
    void characterSheetApi
      .get(remoteCharacter.id, idToken)
      .then((character) => restoreRemoteCharacter(character))
      .catch(() => undefined);
  }, [
    characterSheetApi,
    idToken,
    remoteCharacter,
    restoreRemoteCharacter,
    updateRemoteCharacterMetadata,
  ]);

  const openCharacterList = useCallback(() => {
    setIsCharacterListOpen(true);
    if (characterListCache !== null && characterListCacheToken === idToken) {
      return;
    }
    setIsCharacterListLoading(true);
    void characterSheetApi
      .list(idToken)
      .then((response) => {
        setCharacterListCache(response);
        setCharacterListCacheToken(idToken);
      })
      .catch((error) => onApiError(error, persistence.listLoadError))
      .finally(() => setIsCharacterListLoading(false));
  }, [
    characterListCache,
    characterListCacheToken,
    characterSheetApi,
    idToken,
    onApiError,
  ]);
  const selectCharacter = useCallback(
    (id: string) => {
      setIsCharacterListLoading(true);
      void characterSheetApi
        .get(id, idToken)
        .then((character) => restoreRemoteCharacter(character))
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
    [characterSheetApi, idToken, notify, onApiError, restoreRemoteCharacter],
  );
  const save = useCallback(
    (pcName: string, isPublic: boolean) => {
      if (idToken === null || isRemoteOperationInProgress) return;
      setIsRemoteOperationInProgress(true);
      void characterSheetApi
        .save(
          createCharacterSheetInput({
            id: remoteCharacter?.id,
            image: characterImage,
            isPublic,
            pcName,
            plName: form.getValues().profile.playerName,
            values: form.getValues(),
          }),
          idToken,
        )
        .then((summary) => {
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
      idToken,
      isRemoteOperationInProgress,
      notify,
      onApiError,
      remoteCharacter?.id,
      updateCachedSummary,
    ],
  );
  const copySave = useCallback(
    (pcName: string, plName: string, isPublic: boolean) => {
      if (idToken === null || isRemoteOperationInProgress) return;
      setIsRemoteOperationInProgress(true);
      const values = form.getValues();
      void characterSheetApi
        .save(
          createCharacterSheetInput({
            image: null,
            isPublic,
            pcName,
            plName,
            values,
          }),
          idToken,
        )
        .then(async (summary) => {
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
      idToken,
      isRemoteOperationInProgress,
      notify,
      onApiError,
      updateCachedSummary,
    ],
  );
  const remove = useCallback(() => {
    if (
      idToken === null ||
      remoteCharacter === null ||
      !remoteCharacter.isOwner ||
      isRemoteOperationInProgress
    )
      return;
    setIsRemoteOperationInProgress(true);
    void characterSheetApi
      .delete(remoteCharacter.id, idToken)
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
        setIsDeleteOpen(false);
        notify("success", persistence.deleteSuccess);
      })
      .catch((error) => onApiError(error, persistence.deleteError))
      .finally(() => setIsRemoteOperationInProgress(false));
  }, [
    characterSheetApi,
    clearRemoteCharacter,
    idToken,
    isRemoteOperationInProgress,
    notify,
    onApiError,
    remoteCharacter,
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
        cache: characterListCacheToken === idToken ? characterListCache : null,
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
      characterListCacheToken,
      closeCharacterList,
      closeCopySave,
      closeDelete,
      closeSave,
      copySave,
      form,
      idToken,
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
    ],
  );

  return useMemo(
    () => ({
      dialogProps,
      isCopySaveDisabled:
        idToken === null ||
        isRootOperationInProgress ||
        isRemoteOperationInProgress,
      isDeleteDisabled:
        idToken === null ||
        remoteCharacter === null ||
        !remoteCharacter.isOwner ||
        isRootOperationInProgress ||
        isRemoteOperationInProgress,
      isEditable,
      isSaveDisabled:
        idToken === null ||
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
      idToken,
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

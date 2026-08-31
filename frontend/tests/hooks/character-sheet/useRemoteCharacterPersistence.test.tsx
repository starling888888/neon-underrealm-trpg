// @vitest-environment jsdom

import type {
  CharacterSheet,
  CharacterSheetListResponse,
  CharacterSheetSummary,
} from "@neon-underrealm/shared";
import { act, renderHook, waitFor } from "@testing-library/react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import {
  type CharacterSheetApiClient,
  CharacterSheetApiError,
} from "../../../src/character-sheet/api/character-sheets";
import type { Authentication } from "../../../src/character-sheet/auth/types";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form/values";
import type { RemoteCharacterState } from "../../../src/character-sheet/hooks/useCharacterSheetRootState";
import useRemoteCharacterPersistence from "../../../src/character-sheet/hooks/useRemoteCharacterPersistence";

const emptyList: CharacterSheetListResponse = { sample: [], user: [] };

type HarnessOptions = {
  clearLocalDraftForRemote?: () => Promise<void>;
  remoteCharacter?: RemoteCharacterState | null;
  remoteCharacterId?: string | null;
  restoreRemoteCharacter?: (character: CharacterSheet) => Promise<boolean>;
};

function summary(
  id: string,
  updatedAt: number,
  type: CharacterSheetSummary["metadata"]["type"] = "user",
): CharacterSheetSummary {
  return {
    id,
    metadata: {
      createdAt: updatedAt,
      isOwner: true,
      isPublic: true,
      pcName: id,
      rank: 1,
      type,
      updatedAt,
    },
  };
}

function renderPersistenceHarness(
  characterSheetApi: CharacterSheetApiClient,
  clearCharacterImageForCopy: () => Promise<boolean> = async () => true,
  authentication: Authentication = {
    getIdToken: vi.fn(async () => "token"),
    onLogin: vi.fn(),
    onLogout: vi.fn(),
    sessionKey: "uid-a",
    status: "signed-in",
  },
  {
    clearLocalDraftForRemote: clearLocalDraftForRemoteOption,
    remoteCharacter = null,
    remoteCharacterId = null,
    restoreRemoteCharacter,
  }: HarnessOptions = {},
) {
  const bindRemoteSummary = vi.fn();
  const clearLocalDraftForRemote =
    clearLocalDraftForRemoteOption ?? vi.fn(async () => {});
  const notify = vi.fn();
  const onUnexpectedError = vi.fn();
  const clearRemoteCharacter = vi.fn();
  const onNavigate = vi.fn();
  const restore = vi.fn(restoreRemoteCharacter ?? (async () => true));
  const formRef: { current: UseFormReturn<CharacterSheetFormValues> | null } = {
    current: null,
  };
  const rendered = renderHook(() => {
    const form = useForm<CharacterSheetFormValues>({
      defaultValues: characterSheetDefaultValues,
    });
    formRef.current = form;
    return useRemoteCharacterPersistence(
      {
        authentication,
        bindRemoteSummary,
        characterImage: null,
        clearCharacterImageForCopy,
        clearLocalDraftForRemote,
        clearRemoteCharacter,
        form,
        isRootOperationInProgress: false,
        notify,
        onNavigate,
        onUnexpectedError,
        remoteCharacter,
        remoteCharacterId,
        restoreRemoteCharacter: restore,
      },
      { characterSheetApi },
    );
  });

  return {
    ...rendered,
    bindRemoteSummary,
    clearLocalDraftForRemote,
    clearRemoteCharacter,
    formRef,
    notify,
    onUnexpectedError,
    onNavigate,
    restore,
  };
}

describe("useRemoteCharacterPersistence", () => {
  it("reuses a list cache within the same authentication state", async () => {
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(async () => {}),
      get: vi.fn(),
      list: vi.fn(async () => emptyList),
      save: vi.fn(),
    };
    const authentication: Authentication = {
      getIdToken: vi.fn(async () => "token"),
      onLogin: vi.fn(),
      onLogout: vi.fn(),
      sessionKey: "uid-a",
      status: "signed-in",
    };
    const { result } = renderPersistenceHarness(
      characterSheetApi,
      undefined,
      authentication,
    );

    act(() => result.current.openCharacterList());
    await waitFor(() => expect(characterSheetApi.list).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(result.current.dialogProps.characterList.cache).toBe(emptyList),
    );

    act(() => result.current.openCharacterList());
    expect(characterSheetApi.list).toHaveBeenCalledOnce();
  });

  it("keeps the current PC name when DB saving fails", async () => {
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(async () => {}),
      get: vi.fn(),
      list: vi.fn(async () => emptyList),
      save: vi.fn(async () => {
        throw new Error("save failed");
      }),
    };
    const { formRef, result } = renderPersistenceHarness(characterSheetApi);
    formRef.current?.setValue("profile.pcName", "保存前PC");

    act(() => result.current.dialogProps.save.onConfirm("保存するPC", true));

    await waitFor(() => expect(characterSheetApi.save).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(formRef.current?.getValues("profile.pcName")).toBe("保存前PC"),
    );
    expect(characterSheetApi.save).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ pcName: "保存するPC" }),
        snapshot: expect.objectContaining({
          profile: expect.objectContaining({ pcName: "保存するPC" }),
        }),
      }),
      "token",
    );
  });

  it("keeps a new save local when browser draft cleanup fails after API success", async () => {
    const created = summary("created", 3);
    const cleanupError = new Error("cleanup failed");
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(async () => {}),
      get: vi.fn(),
      list: vi.fn(async () => emptyList),
      save: vi.fn(async () => created),
    };
    const clearLocalDraftForRemote = vi.fn(async () => {
      throw cleanupError;
    });
    const { bindRemoteSummary, notify, onNavigate, result } =
      renderPersistenceHarness(characterSheetApi, undefined, undefined, {
        clearLocalDraftForRemote,
      });

    act(() => result.current.dialogProps.save.onConfirm("新規PC", true));

    await waitFor(() => expect(characterSheetApi.save).toHaveBeenCalledOnce());
    expect(clearLocalDraftForRemote).toHaveBeenCalledOnce();
    expect(bindRemoteSummary).not.toHaveBeenCalled();
    expect(onNavigate).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith(
      "error",
      "保存しましたが、ブラウザに保存された下書きデータを削除できませんでした。現在の入力内容を確認してください。",
    );
  });

  it("commits a copy even when local image cleanup fails", async () => {
    const created = summary("created", 3);
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(async () => {}),
      get: vi.fn(),
      list: vi.fn(async () => emptyList),
      save: vi.fn(async () => created),
    };
    const clearCharacterImageForCopy = vi.fn(async () => false);
    const { bindRemoteSummary, formRef, notify, onNavigate, result } =
      renderPersistenceHarness(
        characterSheetApi,
        clearCharacterImageForCopy,
        undefined,
        {
          remoteCharacterId: "source-character",
        },
      );

    act(() =>
      result.current.dialogProps.copySave.onConfirm(
        "コピーPC",
        "コピーPL",
        false,
      ),
    );

    await waitFor(() =>
      expect(bindRemoteSummary).toHaveBeenCalledWith(created),
    );
    expect(formRef.current?.getValues("profile")).toMatchObject({
      pcName: "コピーPC",
      playerName: "コピーPL",
    });
    expect(notify).toHaveBeenCalledWith(
      "success",
      "コピーを保存し、複製したキャラクターへ表示を切り替えました。",
    );
    expect(clearCharacterImageForCopy).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith("created");
  });

  it("disables copy save and ignores confirmation for an unsaved character", async () => {
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(),
      get: vi.fn(),
      list: vi.fn(async () => emptyList),
      save: vi.fn(),
    };
    const { result } = renderPersistenceHarness(characterSheetApi);

    expect(result.current.isCopySaveDisabled).toBe(true);
    act(() =>
      result.current.dialogProps.copySave.onConfirm(
        "コピーPC",
        "コピーPL",
        false,
      ),
    );

    await Promise.resolve();
    expect(characterSheetApi.save).not.toHaveBeenCalled();
  });

  it("moves an updated user summary to the front of the cache", async () => {
    const updated = summary("c", 4);
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(async () => {}),
      get: vi.fn(),
      list: vi.fn(async () => ({
        sample: [],
        user: [summary("a", 3), summary("b", 2), summary("c", 1)],
      })),
      save: vi.fn(async () => updated),
    };
    const { clearLocalDraftForRemote, onNavigate, result } =
      renderPersistenceHarness(characterSheetApi);

    act(() => result.current.openCharacterList());
    await waitFor(() =>
      expect(result.current.dialogProps.characterList.cache?.user).toHaveLength(
        3,
      ),
    );
    act(() => result.current.dialogProps.save.onConfirm("更新PC", true));

    await waitFor(() =>
      expect(
        result.current.dialogProps.characterList.cache?.user.map(
          ({ id }) => id,
        ),
      ).toEqual(["c", "a", "b"]),
    );
    expect(clearLocalDraftForRemote).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith("c");
  });

  it("loads the public list while signed out", async () => {
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(),
      get: vi.fn(),
      list: vi.fn(async () => emptyList),
      save: vi.fn(),
    };
    const authentication: Authentication = {
      getIdToken: vi.fn(async () => null),
      onLogin: vi.fn(),
      onLogout: vi.fn(),
      sessionKey: null,
      status: "signed-out",
    };
    const { result } = renderPersistenceHarness(
      characterSheetApi,
      undefined,
      authentication,
    );
    act(() => result.current.openCharacterList());
    await waitFor(() =>
      expect(characterSheetApi.list).toHaveBeenCalledWith(null),
    );
  });

  it("does not load a list while authentication is initializing", async () => {
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(),
      get: vi.fn(),
      list: vi.fn(async () => emptyList),
      save: vi.fn(),
    };
    const authentication: Authentication = {
      getIdToken: vi.fn(async () => null),
      onLogin: vi.fn(),
      onLogout: vi.fn(),
      sessionKey: null,
      status: "initializing",
    };
    const { result } = renderPersistenceHarness(
      characterSheetApi,
      undefined,
      authentication,
      { remoteCharacterId: "private-character" },
    );
    act(() => result.current.openCharacterList());
    await Promise.resolve();
    expect(characterSheetApi.list).not.toHaveBeenCalled();
    expect(characterSheetApi.get).not.toHaveBeenCalled();
    expect(result.current.isRemoteCharacterLoading).toBe(true);
  });

  it("does not request a token when none is available", async () => {
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(),
      get: vi.fn(),
      list: vi.fn(async () => emptyList),
      save: vi.fn(),
    };
    const authentication: Authentication = {
      getIdToken: vi.fn(async () => null),
      onLogin: vi.fn(),
      onLogout: vi.fn(),
      sessionKey: "uid-a",
      status: "signed-in",
    };
    const { result } = renderPersistenceHarness(
      characterSheetApi,
      undefined,
      authentication,
    );
    act(() => result.current.dialogProps.save.onConfirm("保存", true));
    await Promise.resolve();
    expect(characterSheetApi.save).not.toHaveBeenCalled();
  });

  it("loads the character named by the URL while signed out", async () => {
    const character = {} as CharacterSheet;
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(),
      get: vi.fn(async () => character),
      list: vi.fn(async () => emptyList),
      save: vi.fn(),
    };
    const authentication: Authentication = {
      getIdToken: vi.fn(async () => null),
      onLogin: vi.fn(),
      onLogout: vi.fn(),
      sessionKey: null,
      status: "signed-out",
    };
    const { restore } = renderPersistenceHarness(
      characterSheetApi,
      undefined,
      authentication,
      { remoteCharacterId: "public-character" },
    );

    await waitFor(() =>
      expect(characterSheetApi.get).toHaveBeenCalledWith(
        "public-character",
        null,
      ),
    );
    expect(restore).toHaveBeenCalledWith(character);
  });

  it("ends remote loading and keeps the sheet read-only when loading fails", async () => {
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(),
      get: vi.fn(async () => {
        throw new Error("not found");
      }),
      list: vi.fn(async () => emptyList),
      save: vi.fn(),
    };
    const { notify, onUnexpectedError, result } = renderPersistenceHarness(
      characterSheetApi,
      undefined,
      undefined,
      { remoteCharacterId: "missing-character" },
    );

    await waitFor(() => expect(characterSheetApi.get).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(result.current.isRemoteCharacterLoading).toBe(false),
    );

    expect(result.current.isRemoteCharacterLoadFailed).toBe(true);
    expect(result.current.isEditable).toBe(false);
    expect(result.current.isCopySaveDisabled).toBe(true);
    expect(onUnexpectedError).toHaveBeenCalledOnce();
    expect(notify).not.toHaveBeenCalled();
  });

  it("keeps a known 404 remote-load failure in the existing notification path", async () => {
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(),
      get: vi.fn(async () => {
        throw new CharacterSheetApiError(404);
      }),
      list: vi.fn(async () => emptyList),
      save: vi.fn(),
    };
    const { notify, onUnexpectedError, result } = renderPersistenceHarness(
      characterSheetApi,
      undefined,
      undefined,
      { remoteCharacterId: "missing-character" },
    );

    await waitFor(() => expect(characterSheetApi.get).toHaveBeenCalledOnce());

    expect(result.current.isRemoteCharacterLoadFailed).toBe(true);
    expect(notify).toHaveBeenCalledWith(
      "error",
      "キャラクターを読み込めませんでした。",
    );
    expect(onUnexpectedError).not.toHaveBeenCalled();
  });

  it("changes the URL identity from character-list selection without fetching first", async () => {
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(),
      get: vi.fn(),
      list: vi.fn(async () => emptyList),
      save: vi.fn(),
    };
    const { onNavigate, result } = renderPersistenceHarness(characterSheetApi);

    act(() => result.current.dialogProps.characterList.onSelect("next"));

    expect(onNavigate).toHaveBeenCalledWith("next");
    expect(characterSheetApi.get).not.toHaveBeenCalled();
  });

  it("keeps the current URL when a save request fails", async () => {
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(),
      get: vi.fn(),
      list: vi.fn(async () => emptyList),
      save: vi.fn(async () => {
        throw new Error("save failed");
      }),
    };
    const { onNavigate, result } = renderPersistenceHarness(characterSheetApi);

    act(() => result.current.dialogProps.save.onConfirm("保存", true));

    await waitFor(() => expect(characterSheetApi.save).toHaveBeenCalledOnce());
    expect(onNavigate).not.toHaveBeenCalled();
  });

  it("keeps a remote character URL on normal save without clearing the local draft", async () => {
    const existing = summary("existing", 3);
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(),
      get: vi.fn(async () => ({}) as CharacterSheet),
      list: vi.fn(async () => emptyList),
      save: vi.fn(async () => existing),
    };
    const { clearLocalDraftForRemote, onNavigate, result } =
      renderPersistenceHarness(characterSheetApi, undefined, undefined, {
        remoteCharacter: {
          id: "existing",
          isOwner: true,
          isPublic: true,
        },
        remoteCharacterId: "existing",
      });

    act(() => result.current.dialogProps.save.onConfirm("更新", true));

    await waitFor(() => expect(onNavigate).toHaveBeenCalledWith("existing"));
    expect(clearLocalDraftForRemote).not.toHaveBeenCalled();
  });

  it("returns to the unsaved URL after deleting the active remote character", async () => {
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(async () => {}),
      get: vi.fn(async () => ({}) as CharacterSheet),
      list: vi.fn(async () => emptyList),
      save: vi.fn(),
    };
    const { clearRemoteCharacter, onNavigate, result } =
      renderPersistenceHarness(characterSheetApi, undefined, undefined, {
        remoteCharacter: {
          id: "existing",
          isOwner: true,
          isPublic: true,
        },
        remoteCharacterId: "existing",
      });

    act(() => result.current.dialogProps.delete.onConfirm());

    await waitFor(() =>
      expect(characterSheetApi.delete).toHaveBeenCalledOnce(),
    );
    expect(clearRemoteCharacter).toHaveBeenCalledOnce();
    expect(onNavigate).toHaveBeenCalledWith(null);
  });
});

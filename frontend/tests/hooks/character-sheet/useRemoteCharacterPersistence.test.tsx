// @vitest-environment jsdom

import type {
  CharacterSheetListResponse,
  CharacterSheetSummary,
} from "@neon-underrealm/shared";
import { act, renderHook, waitFor } from "@testing-library/react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import type { CharacterSheetApiClient } from "../../../src/character-sheet/api/character-sheets";
import type { GoogleAuthentication } from "../../../src/character-sheet/auth/types";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form/values";
import useRemoteCharacterPersistence from "../../../src/character-sheet/hooks/useRemoteCharacterPersistence";

const emptyList: CharacterSheetListResponse = { sample: [], user: [] };

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
) {
  const bindRemoteSummary = vi.fn();
  const notify = vi.fn();
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
        authentication: {
          idToken: "token",
          onCredential: vi.fn(),
          onLoginError: vi.fn(),
          onLoginStarted: vi.fn(),
          onLogout: vi.fn(),
          status: "signed-in",
        },
        bindRemoteSummary,
        characterImage: null,
        clearCharacterImageForCopy,
        clearRemoteCharacter: vi.fn(),
        form,
        isRootOperationInProgress: false,
        notify,
        remoteCharacter: null,
        restoreRemoteCharacter: vi.fn(async () => true),
        updateRemoteCharacterMetadata: vi.fn(),
      },
      { characterSheetApi },
    );
  });

  return { ...rendered, bindRemoteSummary, formRef, notify };
}

describe("useRemoteCharacterPersistence", () => {
  it("reuses a list cache within the same authentication state", async () => {
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(async () => {}),
      get: vi.fn(),
      list: vi.fn(async () => emptyList),
      save: vi.fn(),
    };
    const authentication: GoogleAuthentication = {
      idToken: "token",
      onCredential: vi.fn(),
      onLoginError: vi.fn(),
      onLoginStarted: vi.fn(),
      onLogout: vi.fn(),
      status: "signed-in",
    };
    const { result } = renderHook(() => {
      const form = useForm<CharacterSheetFormValues>({
        defaultValues: characterSheetDefaultValues,
      });
      return useRemoteCharacterPersistence(
        {
          authentication,
          bindRemoteSummary: vi.fn(),
          characterImage: null,
          clearCharacterImageForCopy: vi.fn(async () => true),
          clearRemoteCharacter: vi.fn(),
          form,
          isRootOperationInProgress: false,
          notify: vi.fn(),
          remoteCharacter: null,
          restoreRemoteCharacter: vi.fn(async () => true),
          updateRemoteCharacterMetadata: vi.fn(),
        },
        { characterSheetApi },
      );
    });

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

  it("commits a copy even when local image cleanup fails", async () => {
    const created = summary("created", 3);
    const characterSheetApi: CharacterSheetApiClient = {
      delete: vi.fn(async () => {}),
      get: vi.fn(),
      list: vi.fn(async () => emptyList),
      save: vi.fn(async () => created),
    };
    const clearCharacterImageForCopy = vi.fn(async () => false);
    const { bindRemoteSummary, formRef, notify, result } =
      renderPersistenceHarness(characterSheetApi, clearCharacterImageForCopy);

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
      "コピーをDBに保存しました。",
    );
    expect(clearCharacterImageForCopy).toHaveBeenCalledOnce();
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
    const { result } = renderPersistenceHarness(characterSheetApi);

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
  });
});

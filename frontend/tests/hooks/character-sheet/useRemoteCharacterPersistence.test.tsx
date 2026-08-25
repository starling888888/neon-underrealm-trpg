// @vitest-environment jsdom

import type { CharacterSheetListResponse } from "@neon-underrealm/shared";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import type { CharacterSheetApiClient } from "../../../src/character-sheet/api/character-sheets";
import type { GoogleAuthentication } from "../../../src/character-sheet/auth/types";
import {
  type CharacterSheetFormValues,
  characterSheetDefaultValues,
} from "../../../src/character-sheet/form/values";
import useRemoteCharacterPersistence from "../../../src/character-sheet/hooks/useRemoteCharacterPersistence";

const emptyList: CharacterSheetListResponse = { sample: [], user: [] };

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
});

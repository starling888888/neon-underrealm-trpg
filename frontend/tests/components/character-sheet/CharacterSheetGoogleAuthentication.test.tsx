// @vitest-environment jsdom

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import CharacterSheetGoogleAuthentication from "../../../src/character-sheet/components/CharacterSheetGoogleAuthentication";
import type { GoogleAuthentication } from "../../../src/character-sheet/auth/types";

const { googleLoginSpy } = vi.hoisted(() => ({ googleLoginSpy: vi.fn() }));

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: (props: {
    auto_select: boolean;
    useOneTap: boolean;
    width?: string;
  }) => {
    googleLoginSpy(props);
    return null;
  },
}));

afterEach(() => {
  cleanup();
  googleLoginSpy.mockReset();
  vi.restoreAllMocks();
});

const authentication: GoogleAuthentication = {
  onCredential: () => {},
  onLoginError: () => {},
  onLoginStarted: () => {},
  onLogout: () => {},
  status: "signed-out",
};

describe("CharacterSheetGoogleAuthentication", () => {
  it("gives Google the full-width action-pane container", () => {
    render(
      <CharacterSheetGoogleAuthentication authentication={authentication} />,
    );

    expect(googleLoginSpy.mock.lastCall?.[0]).toMatchObject({
      auto_select: true,
      containerProps: { style: { width: "100%" } },
      useOneTap: true,
    });
    expect(googleLoginSpy.mock.lastCall?.[0]?.width).toBeUndefined();
  });
});

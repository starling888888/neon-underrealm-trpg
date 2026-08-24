// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useGoogleAuthentication from "../../../src/character-sheet/auth/useGoogleAuthentication";

const { googleLogoutSpy, oneTapLoginSpy } = vi.hoisted(() => ({
  googleLogoutSpy: vi.fn(),
  oneTapLoginSpy: vi.fn(),
}));

vi.mock("@react-oauth/google", () => ({
  googleLogout: googleLogoutSpy,
  useGoogleOneTapLogin: oneTapLoginSpy,
}));

beforeEach(() => {
  googleLogoutSpy.mockReset();
  oneTapLoginSpy.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useGoogleAuthentication", () => {
  it("starts One Tap again on mount and keeps a successful credential in memory", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useGoogleAuthentication());

    expect(oneTapLoginSpy).toHaveBeenCalledWith(
      expect.objectContaining({ auto_select: true }),
    );
    expect(result.current.status).toBe("signed-out");

    const options = oneTapLoginSpy.mock.lastCall?.[0] as {
      onSuccess: (response: { credential?: string }) => void;
    };
    act(() => options.onSuccess({ credential: "google-id-token" }));

    expect(result.current.status).toBe("signed-in");
    expect(setItem).not.toHaveBeenCalled();
  });

  it("reports interactive start and GIS failure without blocking local editing", () => {
    const { result } = renderHook(() => useGoogleAuthentication());
    const options = oneTapLoginSpy.mock.lastCall?.[0] as {
      onError: () => void;
    };

    act(() => result.current.onLoginStarted());
    expect(result.current.status).toBe("signing-in");

    act(() => options.onError());
    expect(result.current.status).toBe("error");
  });

  it("discards the memory credential and suppresses Google auto-select on logout", () => {
    const { result } = renderHook(() => useGoogleAuthentication());
    const options = oneTapLoginSpy.mock.lastCall?.[0] as {
      onSuccess: (response: { credential?: string }) => void;
    };
    act(() => options.onSuccess({ credential: "google-id-token" }));

    act(() => result.current.onLogout());

    expect(googleLogoutSpy).toHaveBeenCalledOnce();
    expect(result.current.status).toBe("signed-out");
  });
});

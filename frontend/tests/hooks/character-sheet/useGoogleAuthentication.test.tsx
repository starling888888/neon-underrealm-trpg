// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import useGoogleAuthentication from "../../../src/character-sheet/auth/useGoogleAuthentication";

const { googleLogoutSpy } = vi.hoisted(() => ({
  googleLogoutSpy: vi.fn(),
}));

vi.mock("@react-oauth/google", () => ({
  googleLogout: googleLogoutSpy,
}));

beforeEach(() => {
  googleLogoutSpy.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useGoogleAuthentication", () => {
  it("keeps a successful credential in memory", () => {
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const { result } = renderHook(() => useGoogleAuthentication());

    expect(result.current.status).toBe("signed-out");

    act(() => result.current.onCredential({ credential: "google-id-token" }));

    expect(result.current.status).toBe("signed-in");
    expect(setItem).not.toHaveBeenCalled();
  });

  it("reports interactive start and GIS failure without blocking local editing", () => {
    const { result } = renderHook(() => useGoogleAuthentication());

    act(() => result.current.onLoginStarted());
    expect(result.current.status).toBe("signing-in");

    act(() => result.current.onLoginError());
    expect(result.current.status).toBe("error");
  });

  it("discards the memory credential and suppresses Google auto-select on logout", () => {
    const { result } = renderHook(() => useGoogleAuthentication());
    act(() => result.current.onCredential({ credential: "google-id-token" }));

    act(() => result.current.onLogout());

    expect(googleLogoutSpy).toHaveBeenCalledOnce();
    expect(result.current.status).toBe("signed-out");
  });
});

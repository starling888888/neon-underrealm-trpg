// @vitest-environment jsdom
import type { User } from "firebase/auth";
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import useFirebaseAuthentication from "../../../src/character-sheet/auth/useFirebaseAuthentication";

type FirebaseUserStub = Pick<User, "uid" | "getIdToken">;

const { auth, getAuthMock, observer } = vi.hoisted(() => ({
  auth: { currentUser: null as FirebaseUserStub | null },
  getAuthMock: vi.fn(),
  observer: vi.fn(),
}));
vi.mock("../../../src/character-sheet/auth/firebase-client", () => ({
  getFirebaseAuth: getAuthMock,
}));
vi.mock("firebase/auth", () => ({
  GoogleAuthProvider: vi.fn(),
  onAuthStateChanged: vi.fn((_auth, callback) => {
    observer.mockImplementation(callback);
    return vi.fn();
  }),
  signInWithPopup: vi.fn(),
  signOut: vi.fn(),
}));
const firebaseAuth = await import("firebase/auth");
beforeEach(() => {
  getAuthMock.mockResolvedValue(auth);
  auth.currentUser = null;
  observer.mockReset();
});
afterEach(() => vi.restoreAllMocks());
describe("useFirebaseAuthentication", () => {
  it("starts initializing and follows persisted signed-out state", async () => {
    const { result } = renderHook(() => useFirebaseAuthentication());
    expect(result.current.status).toBe("initializing");
    await act(async () => {
      await Promise.resolve();
      observer(null);
    });
    expect(result.current).toMatchObject({
      status: "signed-out",
      sessionKey: null,
    });
  });
  it("follows persisted user and exposes uid", async () => {
    const { result } = renderHook(() => useFirebaseAuthentication());
    await act(async () => {
      await Promise.resolve();
      observer({ uid: "uid-a" });
    });
    expect(result.current).toMatchObject({
      status: "signed-in",
      sessionKey: "uid-a",
    });
  });
  it("reports initialization failures", async () => {
    getAuthMock.mockRejectedValueOnce(new Error("config"));
    const { result } = renderHook(() => useFirebaseAuthentication());
    await act(async () => {
      await Promise.resolve();
    });
    expect(result.current.status).toBe("error");
  });
  it("delegates login and logout without changing session identity manually", async () => {
    const { result } = renderHook(() => useFirebaseAuthentication());
    await act(async () => {
      await result.current.onLogin();
    });
    expect(firebaseAuth.signInWithPopup).toHaveBeenCalledOnce();
    expect(result.current.sessionKey).toBeNull();
    await act(async () => {
      await result.current.onLogout();
    });
    expect(firebaseAuth.signOut).toHaveBeenCalledOnce();
    expect(result.current.sessionKey).toBeNull();
  });
  it("delegates token reads and returns null without a current user", async () => {
    const { result } = renderHook(() => useFirebaseAuthentication());
    await expect(result.current.getIdToken()).resolves.toBeNull();
    auth.currentUser = {
      uid: "uid-a",
      getIdToken: vi.fn().mockResolvedValue("token"),
    };
    await expect(result.current.getIdToken(true)).resolves.toBe("token");
    expect(auth.currentUser.getIdToken).toHaveBeenCalledWith(true);
  });
  it("unsubscribes the auth observer on unmount", async () => {
    const unsubscribe = vi.fn();
    vi.mocked(firebaseAuth.onAuthStateChanged).mockReturnValueOnce(unsubscribe);
    const { unmount } = renderHook(() => useFirebaseAuthentication());
    await act(async () => {
      await Promise.resolve();
    });
    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });
});

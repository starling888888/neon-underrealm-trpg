import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getAppsMock,
  getAppMock,
  initializeAppMock,
  getAuthMock,
  setPersistenceMock,
} = vi.hoisted(() => ({
  getAppsMock: vi.fn(),
  getAppMock: vi.fn(),
  initializeAppMock: vi.fn(),
  getAuthMock: vi.fn(),
  setPersistenceMock: vi.fn(),
}));
vi.mock("firebase/app", () => ({
  getApps: getAppsMock,
  getApp: getAppMock,
  initializeApp: initializeAppMock,
}));
vi.mock("firebase/auth", () => ({
  browserLocalPersistence: "local",
  getAuth: getAuthMock,
  setPersistence: setPersistenceMock,
}));

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("PUBLIC_FIREBASE_API_KEY", "api");
  vi.stubEnv("PUBLIC_FIREBASE_APP_ID", "app");
  vi.stubEnv("PUBLIC_FIREBASE_AUTH_DOMAIN", "auth");
  vi.stubEnv("PUBLIC_FIREBASE_PROJECT_ID", "project");
  getAppsMock.mockReset().mockReturnValue([]);
  getAppMock.mockReset();
  initializeAppMock.mockReset().mockReturnValue({});
  getAuthMock.mockReset().mockReturnValue({});
  setPersistenceMock.mockReset().mockResolvedValue(undefined);
});
describe("getFirebaseAuth", () => {
  it("initializes once and shares concurrent promise", async () => {
    const { getFirebaseAuth } = await import(
      "../../../../src/character-sheet/auth/firebase-client"
    );
    const [a, b] = await Promise.all([getFirebaseAuth(), getFirebaseAuth()]);
    expect(a).toBe(b);
    expect(initializeAppMock).toHaveBeenCalledOnce();
    expect(setPersistenceMock).toHaveBeenCalledWith(a, "local");
  });
  it("reuses an existing Firebase app", async () => {
    getAppsMock.mockReturnValue([{}]);
    const { getFirebaseAuth } = await import(
      "../../../../src/character-sheet/auth/firebase-client"
    );
    await getFirebaseAuth();
    expect(getAppMock).toHaveBeenCalledOnce();
    expect(initializeAppMock).not.toHaveBeenCalled();
  });
  it("rejects missing configuration", async () => {
    vi.stubEnv("PUBLIC_FIREBASE_PROJECT_ID", "");

    const { getFirebaseAuth } = await import(
      "../../../../src/character-sheet/auth/firebase-client"
    );

    await expect(getFirebaseAuth()).rejects.toThrow("projectId");
  });
  it("retries after persistence initialization failure", async () => {
    setPersistenceMock.mockRejectedValueOnce(new Error("storage"));

    const { getFirebaseAuth } = await import(
      "../../../../src/character-sheet/auth/firebase-client"
    );

    await expect(getFirebaseAuth()).rejects.toThrow("storage");
    await expect(getFirebaseAuth()).resolves.toBeDefined();

    expect(initializeAppMock).toHaveBeenCalledTimes(2);
  });
});

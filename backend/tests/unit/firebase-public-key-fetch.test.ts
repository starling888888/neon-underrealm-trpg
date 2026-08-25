import { generateKeyPair, SignJWT } from "jose";
import { afterEach, expect, test, vi } from "vitest";

afterEach(() => vi.restoreAllMocks());

test("Firebase verifier fetches Secure Token X509 keys through global fetch", async () => {
  vi.resetModules();
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response("unavailable", { status: 503 }));
  vi.stubGlobal("fetch", fetchMock);
  const { FirebaseIdTokenVerifier } = await import(
    "../../src/auth/token-verifier.js"
  );
  const { privateKey } = await generateKeyPair("RS256");
  const token = await new SignJWT({ auth_time: Math.floor(Date.now() / 1000) })
    .setProtectedHeader({ alg: "RS256", kid: "missing" })
    .setAudience("project")
    .setIssuer("https://securetoken.google.com/project")
    .setSubject("user")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
  expect(await new FirebaseIdTokenVerifier("project").verify(token)).toEqual({
    kind: "invalid",
  });
  expect(fetchMock).toHaveBeenCalledOnce();
  expect(fetchMock.mock.calls[0]?.[0]?.toString()).toContain(
    "securetoken@system.gserviceaccount.com",
  );
});

test("Firebase verifier rejects a token without kid without fetching", async () => {
  vi.resetModules();
  const fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  const { FirebaseIdTokenVerifier } = await import(
    "../../src/auth/token-verifier.js"
  );
  const { generateKeyPair } = await import("jose");
  const { privateKey } = await generateKeyPair("RS256");
  const token = await new SignJWT({ auth_time: Math.floor(Date.now() / 1000) })
    .setProtectedHeader({ alg: "RS256" })
    .setAudience("project")
    .setIssuer("https://securetoken.google.com/project")
    .setSubject("user")
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(privateKey);
  expect(await new FirebaseIdTokenVerifier("project").verify(token)).toEqual({
    kind: "invalid",
  });
  expect(fetchMock).not.toHaveBeenCalled();
});

import assert from "node:assert/strict";
import test from "node:test";
import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import { GoogleIdTokenVerifier } from "../src/token-verifiers.js";

const clientId = "test-client-id";

async function createVerifier() {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);
  const keySet = createLocalJWKSet({ keys: [publicJwk] });

  return { privateKey, verifier: new GoogleIdTokenVerifier(clientId, keySet) };
}

async function signToken(
  privateKey: CryptoKey,
  options: { audience?: string; expirationTime: string; subject?: string },
) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setAudience(options.audience ?? clientId)
    .setIssuedAt()
    .setIssuer("https://accounts.google.com")
    .setSubject(options.subject ?? "google-user")
    .setExpirationTime(options.expirationTime)
    .sign(privateKey);
}

test("Google verifier accepts a signed token with Google issuer and audience", async () => {
  const { privateKey, verifier } = await createVerifier();
  const token = await signToken(privateKey, { expirationTime: "5m" });

  assert.deepEqual(await verifier.verify(token), {
    kind: "valid",
    userId: "google-user",
  });
});

test("Google verifier distinguishes expired from invalid tokens", async () => {
  const { privateKey, verifier } = await createVerifier();
  const { privateKey: untrustedPrivateKey } = await generateKeyPair("RS256");
  const expired = await signToken(privateKey, { expirationTime: "-1s" });
  const wrongAudience = await signToken(privateKey, {
    audience: "another-client",
    expirationTime: "5m",
  });
  const untrustedSignature = await signToken(untrustedPrivateKey, {
    expirationTime: "5m",
  });

  assert.deepEqual(await verifier.verify(expired), { kind: "expired" });
  assert.deepEqual(await verifier.verify(wrongAudience), { kind: "invalid" });
  assert.deepEqual(await verifier.verify(untrustedSignature), {
    kind: "invalid",
  });
});

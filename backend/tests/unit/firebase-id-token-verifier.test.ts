import { createLocalJWKSet, exportJWK, generateKeyPair, SignJWT } from "jose";
import { expect, test } from "vitest";
import { FirebaseIdTokenVerifier } from "../../src/auth/token-verifier.js";

const projectId = "test-firebase-project";
const issuer = `https://securetoken.google.com/${projectId}`;
const userId = "firebase-user";

async function createVerifier() {
  const { privateKey, publicKey } = await generateKeyPair("RS256");
  const publicJwk = await exportJWK(publicKey);
  const keySet = createLocalJWKSet({ keys: [publicJwk] });

  return {
    privateKey,
    verifier: new FirebaseIdTokenVerifier(projectId, keySet),
  };
}

type SignTokenOptions = {
  audience?: string | string[];
  authTime?: number;
  expirationTime?: string | number;
  issuedAt?: number;
  issuer?: string;
  subject?: string | null;
};

async function signToken(
  privateKey: CryptoKey,
  options: SignTokenOptions = {},
) {
  const now = Math.floor(Date.now() / 1000);

  let token = new SignJWT({
    auth_time: options.authTime ?? now,
  })
    .setProtectedHeader({ alg: "RS256" })
    .setAudience(options.audience ?? projectId)
    .setIssuedAt(options.issuedAt ?? now)
    .setIssuer(options.issuer ?? issuer)
    .setExpirationTime(options.expirationTime ?? "5m");

  if (options.subject !== null) {
    token = token.setSubject(options.subject ?? userId);
  }

  return token.sign(privateKey);
}

test("Firebase verifier accepts a valid Firebase ID token", async () => {
  const { privateKey, verifier } = await createVerifier();
  const token = await signToken(privateKey);

  expect(await verifier.verify(token)).toEqual({
    kind: "valid",
    userId,
  });
});

test("Firebase verifier distinguishes an expired token", async () => {
  const { privateKey, verifier } = await createVerifier();
  const token = await signToken(privateKey, {
    expirationTime: "-1s",
  });

  expect(await verifier.verify(token)).toEqual({
    kind: "expired",
  });
});

test("Firebase verifier rejects an untrusted signature", async () => {
  const { verifier } = await createVerifier();
  const { privateKey: untrustedPrivateKey } = await generateKeyPair("RS256");
  const token = await signToken(untrustedPrivateKey);

  expect(await verifier.verify(token)).toEqual({
    kind: "invalid",
  });
});

test("Firebase verifier rejects a non-RS256 token", async () => {
  const { verifier } = await createVerifier();
  const { privateKey } = await generateKeyPair("ES256");
  const now = Math.floor(Date.now() / 1000);

  const token = await new SignJWT({
    auth_time: now,
  })
    .setProtectedHeader({ alg: "ES256" })
    .setAudience(projectId)
    .setIssuedAt(now)
    .setIssuer(issuer)
    .setSubject(userId)
    .setExpirationTime("5m")
    .sign(privateKey);

  expect(await verifier.verify(token)).toEqual({
    kind: "invalid",
  });
});

test("Firebase verifier rejects the wrong audience", async () => {
  const { privateKey, verifier } = await createVerifier();
  const token = await signToken(privateKey, {
    audience: "another-firebase-project",
  });

  expect(await verifier.verify(token)).toEqual({
    kind: "invalid",
  });
});

test("Firebase verifier rejects an audience array", async () => {
  const { privateKey, verifier } = await createVerifier();
  const token = await signToken(privateKey, {
    audience: [projectId, "another-audience"],
  });

  expect(await verifier.verify(token)).toEqual({
    kind: "invalid",
  });
});

test("Firebase verifier rejects the wrong issuer", async () => {
  const { privateKey, verifier } = await createVerifier();
  const token = await signToken(privateKey, {
    issuer: "https://securetoken.google.com/another-firebase-project",
  });

  expect(await verifier.verify(token)).toEqual({
    kind: "invalid",
  });
});

test("Firebase verifier rejects a token without a subject", async () => {
  const { privateKey, verifier } = await createVerifier();
  const token = await signToken(privateKey, {
    subject: null,
  });

  expect(await verifier.verify(token)).toEqual({
    kind: "invalid",
  });
});

test("Firebase verifier rejects an empty subject", async () => {
  const { privateKey, verifier } = await createVerifier();
  const token = await signToken(privateKey, {
    subject: "",
  });

  expect(await verifier.verify(token)).toEqual({
    kind: "invalid",
  });
});

test("Firebase verifier rejects a future issued-at time", async () => {
  const { privateKey, verifier } = await createVerifier();
  const now = Math.floor(Date.now() / 1000);
  const token = await signToken(privateKey, {
    issuedAt: now + 300,
  });

  expect(await verifier.verify(token)).toEqual({
    kind: "invalid",
  });
});

test("Firebase verifier rejects a future auth_time", async () => {
  const { privateKey, verifier } = await createVerifier();
  const now = Math.floor(Date.now() / 1000);
  const token = await signToken(privateKey, {
    authTime: now + 300,
  });

  expect(await verifier.verify(token)).toEqual({
    kind: "invalid",
  });
});

test("Firebase verifier rejects a token without auth_time", async () => {
  const { privateKey, verifier } = await createVerifier();
  const now = Math.floor(Date.now() / 1000);

  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setAudience(projectId)
    .setIssuedAt(now)
    .setIssuer(issuer)
    .setSubject(userId)
    .setExpirationTime("5m")
    .sign(privateKey);

  expect(await verifier.verify(token)).toEqual({
    kind: "invalid",
  });
});

test("Firebase verifier reports an unexpected key-set failure separately", async () => {
  const { privateKey } = await generateKeyPair("RS256");
  const verifier = new FirebaseIdTokenVerifier(projectId, async () => {
    throw new Error("unexpected key-set failure");
  });

  expect(await verifier.verify(await signToken(privateKey))).toEqual({
    kind: "unexpected",
  });
});

test("Firebase verifier requires a non-empty project ID", () => {
  expect(() => new FirebaseIdTokenVerifier("")).toThrow(
    "FIREBASE_PROJECT_ID must not be empty.",
  );

  expect(() => new FirebaseIdTokenVerifier("   ")).toThrow(
    "FIREBASE_PROJECT_ID must not be empty.",
  );
});

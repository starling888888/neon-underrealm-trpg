import { errors, importX509, type JWTVerifyGetKey, jwtVerify } from "jose";
import type { TokenVerification, TokenVerifier } from "../domain/index.js";

const firebasePublicKeysUrl = new URL(
  "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com",
);

const defaultPublicKeyCacheDurationMilliseconds = 5 * 60 * 1000;
const unknownKeyRefreshCooldownMilliseconds = 60 * 1000;

type FirebasePublicKeyResponse = Record<string, string>;

class FirebasePublicKeyUnavailableError extends Error {}
class FirebaseTokenInvalidError extends Error {}

const parseCacheDurationMilliseconds = (
  cacheControl: string | null,
): number => {
  if (cacheControl === null) {
    return defaultPublicKeyCacheDurationMilliseconds;
  }

  const match = /(?:^|,)\s*max-age=(\d+)/i.exec(cacheControl);
  if (match === null) {
    return defaultPublicKeyCacheDurationMilliseconds;
  }

  const seconds = Number(match[1]);
  return Number.isFinite(seconds)
    ? seconds * 1000
    : defaultPublicKeyCacheDurationMilliseconds;
};

const isFirebasePublicKeyResponse = (
  value: unknown,
): value is FirebasePublicKeyResponse => {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (certificate) => typeof certificate === "string",
  );
};

/**
 * Resolves Firebase Secure Token signing certificates.
 *
 * Firebase publishes an X.509 certificate map keyed by JWT `kid`, not a
 * standard JWKS document. Certificates are imported through jose and cached
 * according to Google's Cache-Control max-age response header.
 */
class FirebasePublicKeyResolver {
  readonly #fetch: typeof fetch;
  #expiresAt = 0;
  #keys = new Map<string, CryptoKey>();
  #lastUnknownKeyRefreshAt = 0;
  #refreshPromise: Promise<void> | null = null;

  constructor(fetcher: typeof fetch = fetch) {
    this.#fetch = fetcher.bind(globalThis);
  }

  readonly getKey: JWTVerifyGetKey = async (protectedHeader) => {
    if (
      protectedHeader.alg !== "RS256" ||
      typeof protectedHeader.kid !== "string" ||
      protectedHeader.kid.length === 0
    ) {
      throw new FirebaseTokenInvalidError("Invalid Firebase ID token header.");
    }

    const kid = protectedHeader.kid;
    let refreshed = false;

    if (this.#keys.size === 0 || Date.now() >= this.#expiresAt) {
      await this.#refresh();
      refreshed = true;
    }

    let key = this.#keys.get(kid);

    /*
     * A previously unseen kid can indicate a signing-key rotation.
     * Refresh once even while the normal cache is still valid, but throttle
     * unknown-kid refreshes so arbitrary invalid JWTs cannot force an outbound
     * request for every verification attempt.
     */
    if (
      key === undefined &&
      !refreshed &&
      Date.now() - this.#lastUnknownKeyRefreshAt >=
        unknownKeyRefreshCooldownMilliseconds
    ) {
      this.#lastUnknownKeyRefreshAt = Date.now();
      await this.#refresh();
      key = this.#keys.get(kid);
    }

    if (key === undefined) {
      throw new FirebaseTokenInvalidError(
        "Firebase ID token signing key was not found.",
      );
    }

    return key;
  };

  #refresh(): Promise<void> {
    if (this.#refreshPromise !== null) {
      return this.#refreshPromise;
    }

    const refreshPromise = this.#loadKeys().finally(() => {
      if (this.#refreshPromise === refreshPromise) {
        this.#refreshPromise = null;
      }
    });

    this.#refreshPromise = refreshPromise;
    return refreshPromise;
  }

  async #loadKeys(): Promise<void> {
    try {
      const response = await this.#fetch(firebasePublicKeysUrl);

      if (!response.ok) {
        throw new FirebasePublicKeyUnavailableError(
          `Failed to load Firebase public keys: ${response.status}.`,
        );
      }

      const certificates: unknown = await response.json();

      if (
        !isFirebasePublicKeyResponse(certificates) ||
        Object.keys(certificates).length === 0
      ) {
        throw new FirebasePublicKeyUnavailableError(
          "Firebase public key response is invalid.",
        );
      }

      const importedKeys = new Map<string, CryptoKey>();

      await Promise.all(
        Object.entries(certificates).map(async ([kid, certificate]) => {
          if (kid.length === 0 || certificate.length === 0) {
            throw new FirebasePublicKeyUnavailableError(
              "Firebase public key response is invalid.",
            );
          }

          importedKeys.set(kid, await importX509(certificate, "RS256"));
        }),
      );

      this.#keys = importedKeys;
      this.#expiresAt =
        Date.now() +
        parseCacheDurationMilliseconds(response.headers.get("cache-control"));
    } catch (error) {
      if (error instanceof FirebasePublicKeyUnavailableError) throw error;
      throw new FirebasePublicKeyUnavailableError(
        "Firebase public keys could not be loaded.",
      );
    }
  }
}

/*
 * Keep the signing-key cache at module scope.
 *
 * src/index.ts currently creates a verifier for each Worker request. A shared
 * resolver lets Cloudflare reuse the fetched certificate set for the lifetime
 * of the Worker isolate instead of downloading certificates for every request.
 */
const firebasePublicKeyResolver = new FirebasePublicKeyResolver();

export class FirebaseIdTokenVerifier implements TokenVerifier {
  readonly #issuer: string;
  readonly #keySet: JWTVerifyGetKey;
  readonly #projectId: string;

  constructor(
    projectId: string,
    keySet: JWTVerifyGetKey = firebasePublicKeyResolver.getKey,
  ) {
    const normalizedProjectId = projectId.trim();

    if (normalizedProjectId.length === 0) {
      throw new Error("FIREBASE_PROJECT_ID must not be empty.");
    }

    this.#projectId = normalizedProjectId;
    this.#issuer = `https://securetoken.google.com/${normalizedProjectId}`;
    this.#keySet = keySet;
  }

  async verify(token: string): Promise<TokenVerification> {
    try {
      const { payload } = await jwtVerify(token, this.#keySet, {
        algorithms: ["RS256"],
        audience: this.#projectId,
        issuer: this.#issuer,
        requiredClaims: ["exp", "iat", "aud", "iss", "sub", "auth_time"],
      });

      const now = Math.floor(Date.now() / 1000);

      /*
       * jwtVerify verifies the signature, issuer, audience and expiration.
       * Firebase additionally requires iat and auth_time to be in the past.
       *
       * Require an exact string audience as specified by Firebase rather than
       * accepting a general JWT audience array containing the project ID.
       */
      if (
        payload.aud !== this.#projectId ||
        payload.iss !== this.#issuer ||
        typeof payload.sub !== "string" ||
        payload.sub.length === 0 ||
        typeof payload.iat !== "number" ||
        payload.iat > now ||
        typeof payload.exp !== "number" ||
        typeof payload.auth_time !== "number" ||
        payload.auth_time > now
      ) {
        return { kind: "invalid" };
      }

      return {
        kind: "valid",
        userId: payload.sub,
      };
    } catch (error) {
      if (error instanceof errors.JWTExpired) return { kind: "expired" };
      if (error instanceof FirebasePublicKeyUnavailableError) {
        return { kind: "unavailable" };
      }
      if (
        error instanceof FirebaseTokenInvalidError ||
        error instanceof errors.JOSEError
      ) {
        return { kind: "invalid" };
      }
      return { kind: "unexpected" };
    }
  }
}

export class TestTokenVerifier implements TokenVerifier {
  async verify(token: string): Promise<TokenVerification> {
    switch (token) {
      case "test-token-owner":
        return { kind: "valid", userId: "test-owner" };
      case "test-token-other":
        return { kind: "valid", userId: "test-other" };
      case "test-token-expired":
        return { kind: "expired" };
      case "test-token-authentication-unavailable":
        return { kind: "unavailable" };
      case "test-token-verifier-unexpected":
        return { kind: "unexpected" };
      default:
        return { kind: "invalid" };
    }
  }
}

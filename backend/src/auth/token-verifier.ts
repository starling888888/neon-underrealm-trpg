import {
  createRemoteJWKSet,
  errors,
  jwtVerify,
  type JWTVerifyGetKey,
} from "jose";
import type { TokenVerification, TokenVerifier } from "../domain/index.js";

const googleJwksUrl = new URL("https://www.googleapis.com/oauth2/v3/certs");
const googleIssuer = ["accounts.google.com", "https://accounts.google.com"];

export class GoogleIdTokenVerifier implements TokenVerifier {
  readonly #clientId: string;
  readonly #keySet: JWTVerifyGetKey;

  constructor(
    clientId: string,
    keySet: JWTVerifyGetKey = createRemoteJWKSet(googleJwksUrl),
  ) {
    this.#clientId = clientId;
    this.#keySet = keySet;
  }

  async verify(token: string): Promise<TokenVerification> {
    try {
      const { payload } = await jwtVerify(token, this.#keySet, {
        algorithms: ["RS256"],
        audience: this.#clientId,
        issuer: googleIssuer,
      });

      return typeof payload.sub === "string" && payload.sub.length > 0
        ? { kind: "valid", userId: payload.sub }
        : { kind: "invalid" };
    } catch (error) {
      return error instanceof errors.JWTExpired
        ? { kind: "expired" }
        : { kind: "invalid" };
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
      default:
        return { kind: "invalid" };
    }
  }
}

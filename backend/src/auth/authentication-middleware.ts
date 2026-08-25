import type { MiddlewareHandler } from "hono";
import type { TokenVerifier } from "../domain/index.js";
import { ApplicationError } from "../application-error.js";

export type AuthenticationEnvironment = {
  Variables: {
    actorUserId: string | null;
  };
};

const parseBearerToken = (authorization: string | undefined): string | null => {
  if (authorization === undefined) return null;

  const match = /^Bearer ([^\s]+)$/.exec(authorization);

  if (match?.[1] === undefined) {
    throw new ApplicationError("invalid_token");
  }

  return match[1];
};

export const createAuthenticationMiddleware =
  (
    tokenVerifier: TokenVerifier,
  ): MiddlewareHandler<AuthenticationEnvironment> =>
  async (context, next) => {
    const token = parseBearerToken(context.req.header("Authorization"));

    if (token === null) {
      context.set("actorUserId", null);
      await next();
      return;
    }

    const result = await tokenVerifier.verify(token);

    if (result.kind === "expired") {
      throw new ApplicationError("expired_token");
    }

    if (result.kind === "invalid") {
      throw new ApplicationError("invalid_token");
    }

    context.set("actorUserId", result.userId);
    await next();
  };

export const requireAuthentication: MiddlewareHandler<
  AuthenticationEnvironment
> = async (context, next) => {
  if (context.get("actorUserId") === null) {
    throw new ApplicationError("unauthorized");
  }

  await next();
};

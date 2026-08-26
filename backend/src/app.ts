import type {
  ApiErrorResponse,
  ApplicationErrorCode,
} from "@neon-underrealm/shared";
import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { ApplicationError } from "./application-error.js";
import {
  type AuthenticationEnvironment,
  createAuthenticationMiddleware,
  requireAuthentication,
} from "./auth/authentication-middleware.js";
import type { TokenVerifier } from "./domain/index.js";
import type { CharacterSheetService } from "./service/index.js";
import {
  parseCharacterSheetId,
  parseCharacterSheetInput,
} from "./validation/index.js";

export type AppDependencies = {
  corsAllowOrigins: string[];
  characterSheetService: CharacterSheetService;
  tokenVerifier: TokenVerifier;
};

type ErrorStatus = 400 | 401 | 403 | 404 | 413 | 419 | 500 | 503;

const maximumRequestBodyBytes = 8 * 1024 * 1024;

const errorStatusByCode = {
  authentication_unavailable: 503,
  bad_request: 400,
  expired_token: 419,
  forbidden: 403,
  invalid_token: 401,
  not_found: 404,
  payload_too_large: 413,
  unauthorized: 401,
  unexpected_error: 500,
} satisfies Record<ApplicationErrorCode, ErrorStatus>;

const errorResponse = (error: ApplicationError): ApiErrorResponse => ({
  error: { code: error.code },
});

export const createApp = (dependencies: AppDependencies) => {
  const app = new Hono<AuthenticationEnvironment>();

  app.use(
    "*",
    cors({
      allowHeaders: ["Authorization", "Content-Type"],
      allowMethods: ["DELETE", "GET", "POST"],
      origin: dependencies.corsAllowOrigins,
    }),
  );

  app.get("/health", (context) => context.json({ status: "ok" }));

  app.use(
    "/character-sheets",
    createAuthenticationMiddleware(dependencies.tokenVerifier),
  );
  app.use(
    "/character-sheets/*",
    createAuthenticationMiddleware(dependencies.tokenVerifier),
  );

  app.get("/character-sheets", async (context) =>
    context.json(
      await dependencies.characterSheetService.list(context.get("actorUserId")),
    ),
  );

  app.post(
    "/character-sheets",
    requireAuthentication,
    bodyLimit({
      maxSize: maximumRequestBodyBytes,
      onError: () => {
        throw new ApplicationError("payload_too_large");
      },
    }),
    async (context) => {
      const actorUserId = context.get("actorUserId");

      if (actorUserId === null) {
        throw new ApplicationError("unauthorized");
      }

      const input = await parseCharacterSheetInput(context.req.raw);

      return context.json(
        await dependencies.characterSheetService.save(input, actorUserId),
      );
    },
  );

  app.get("/character-sheets/:id", async (context) =>
    context.json(
      await dependencies.characterSheetService.get(
        parseCharacterSheetId(context.req.param("id")),
        context.get("actorUserId"),
      ),
    ),
  );

  app.delete(
    "/character-sheets/:id",
    requireAuthentication,
    async (context) => {
      const actorUserId = context.get("actorUserId");

      if (actorUserId === null) {
        throw new ApplicationError("unauthorized");
      }

      await dependencies.characterSheetService.delete(
        parseCharacterSheetId(context.req.param("id")),
        actorUserId,
      );

      return context.body(null, 204);
    },
  );

  app.onError((error, context) => {
    if (error instanceof ApplicationError) {
      return new Response(JSON.stringify(errorResponse(error)), {
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        status: errorStatusByCode[error.code],
      });
    }

    return context.json(
      { error: { code: "unexpected_error" } } satisfies ApiErrorResponse,
      500,
    );
  });

  return app;
};

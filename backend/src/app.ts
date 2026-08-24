import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ApiErrorResponse } from "@neon-underrealm/shared";
import { ApiError } from "./api-error.js";
import type { CharacterSheetService } from "./character-sheet-service.js";
import {
  parseBearerToken,
  parseCharacterSheetId,
  parseCharacterSheetInput,
} from "./validation.js";

export type AppDependencies = {
  corsAllowOrigins: string[];
  characterSheetService: CharacterSheetService;
};

const errorResponse = (error: ApiError): ApiErrorResponse => ({
  error: { code: error.code },
});

export const createApp = (dependencies: AppDependencies) => {
  const app = new Hono();

  app.use(
    "*",
    cors({
      allowHeaders: ["Authorization", "Content-Type"],
      allowMethods: ["DELETE", "GET", "POST"],
      origin: dependencies.corsAllowOrigins,
    }),
  );

  app.get("/health", (context) => context.json({ status: "ok" }));

  app.get("/character-sheets", async (context) =>
    context.json(
      await dependencies.characterSheetService.list(
        parseBearerToken(context.req.header("Authorization")),
      ),
    ),
  );

  app.post("/character-sheets", async (context) => {
    const input = await parseCharacterSheetInput(context.req.raw);

    return context.json(
      await dependencies.characterSheetService.save(
        input,
        parseBearerToken(context.req.header("Authorization")),
      ),
    );
  });

  app.get("/character-sheets/:id", async (context) =>
    context.json(
      await dependencies.characterSheetService.get(
        parseCharacterSheetId(context.req.param("id")),
        parseBearerToken(context.req.header("Authorization")),
      ),
    ),
  );

  app.delete("/character-sheets/:id", async (context) => {
    await dependencies.characterSheetService.delete(
      parseCharacterSheetId(context.req.param("id")),
      parseBearerToken(context.req.header("Authorization")),
    );

    return context.body(null, 204);
  });

  app.onError((error, context) => {
    if (error instanceof ApiError) {
      return new Response(JSON.stringify(errorResponse(error)), {
        headers: { "Content-Type": "application/json; charset=UTF-8" },
        status: error.status,
      });
    }

    return context.json(
      { error: { code: "unexpected_error" } } satisfies ApiErrorResponse,
      500,
    );
  });

  return app;
};

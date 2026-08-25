import { createApp } from "./app.js";
import type { BackendBindings } from "./bindings.js";
import { FirebaseIdTokenVerifier } from "./auth/token-verifier.js";
import { CloudflareCharacterSheetRepository } from "./repository/index.js";
import { CharacterSheetService } from "./service/index.js";

export type { BackendBindings } from "./bindings.js";

export default {
  fetch(request, environment, executionContext) {
    const app = createApp({
      characterSheetService: new CharacterSheetService(
        new CloudflareCharacterSheetRepository(environment),
      ),
      corsAllowOrigins: environment.CORS_ALLOW_ORIGIN.split(",").map((origin) =>
        origin.trim(),
      ),
      tokenVerifier: new FirebaseIdTokenVerifier(
        environment.FIREBASE_PROJECT_ID,
      ),
    });

    return app.fetch(request, environment, executionContext);
  },
} satisfies ExportedHandler<BackendBindings>;

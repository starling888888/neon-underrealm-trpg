import { createApp } from "./app.js";
import { TestTokenVerifier } from "./auth/token-verifier.js";
import type { BackendBindings } from "./bindings.js";
import { CloudflareCharacterSheetRepository } from "./repository/index.js";
import { CharacterSheetService } from "./service/index.js";

export default {
  fetch(request, environment, executionContext) {
    const app = createApp({
      characterSheetService: new CharacterSheetService(
        new CloudflareCharacterSheetRepository(environment),
      ),
      corsAllowOrigins: environment.CORS_ALLOW_ORIGIN.split(",").map((origin) =>
        origin.trim(),
      ),
      tokenVerifier: new TestTokenVerifier(),
    });

    return app.fetch(request, environment, executionContext);
  },
} satisfies ExportedHandler<BackendBindings>;

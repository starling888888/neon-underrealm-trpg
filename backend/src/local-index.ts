import { createApp } from "./app.js";
import type { BackendBindings } from "./bindings.js";
import { CloudflareCharacterSheetRepository } from "./cloudflare-character-sheet-repository.js";
import { CharacterSheetService } from "./character-sheet-service.js";
import { TestTokenVerifier } from "./token-verifiers.js";

export default {
  fetch(request, environment, executionContext) {
    const app = createApp({
      characterSheetService: new CharacterSheetService(
        new CloudflareCharacterSheetRepository(environment),
        new TestTokenVerifier(),
      ),
      corsAllowOrigins: environment.CORS_ALLOW_ORIGIN.split(",").map((origin) =>
        origin.trim(),
      ),
    });

    return app.fetch(request, environment, executionContext);
  },
} satisfies ExportedHandler<BackendBindings>;

import { createApp } from "./app.js";
import type { BackendBindings } from "./bindings.js";
import { createCloudflareDiagnostics } from "./cloudflare-diagnostics.js";

export type { BackendBindings } from "./bindings.js";

export default {
  fetch(request, environment, executionContext) {
    return createApp(createCloudflareDiagnostics(environment)).fetch(
      request,
      environment,
      executionContext,
    );
  },
} satisfies ExportedHandler<BackendBindings>;

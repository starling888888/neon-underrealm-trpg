import { defineConfig } from "@playwright/test";
import { visualBaseUrl } from "./tests/visual/config";

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      pathTemplate: "canonical-snapshots/visual{/projectName}/{arg}{ext}",
    },
  },
  use: {
    baseURL: visualBaseUrl,
  },
});

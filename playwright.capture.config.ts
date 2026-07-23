import { defineConfig } from "@playwright/test";
import { visualPlaywrightUse } from "./playwright.config";

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      pathTemplate: "test-results/visual{/projectName}/{arg}{ext}",
    },
  },
  use: visualPlaywrightUse,
});

import { defineConfig } from "@playwright/test";
import { visualPlaywrightUse } from "./playwright.config";
import { visualBaseUrl } from "./tests/visual/config";

export default defineConfig({
  testDir: "./tests/visual",
  testIgnore: ["**/vrt/**"],
  use: visualPlaywrightUse,
  webServer: {
    command: "npm run preview",
    url: visualBaseUrl,
    reuseExistingServer: false,
  },
});

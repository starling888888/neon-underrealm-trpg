import { defineConfig } from "@playwright/test";
import { visualPlaywrightUse } from "./playwright.config";

const e2eBaseUrl = "http://127.0.0.1:4322/neon-underrealm-trpg/";

export default defineConfig({
  testDir: "./tests/visual",
  testIgnore: ["**/vrt/**"],
  use: {
    ...visualPlaywrightUse,
    baseURL: e2eBaseUrl,
  },
  webServer: {
    command: "npm run preview -- --port 4322",
    url: e2eBaseUrl,
    reuseExistingServer: false,
  },
});

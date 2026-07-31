import { defineConfig } from "@playwright/test";
import { siteBaseUrl } from "./tests/support/site";

const isRemote = Boolean(process.env.E2E_BASE_URL);
const localWebServer = {
  command: "npm run preview -- --port 4322",
  url: siteBaseUrl,
  reuseExistingServer: false,
};

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: siteBaseUrl,
  },
  ...(isRemote ? {} : { webServer: localWebServer }),
});

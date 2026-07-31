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
  ...(isRemote
    ? {
        outputDir: "test-results/public-e2e",
        reporter: [
          ["dot"],
          ["html", { open: "never", outputFolder: "playwright-report" }],
        ],
      }
    : {}),
  use: {
    baseURL: siteBaseUrl,
    ...(isRemote
      ? {
          screenshot: "only-on-failure",
          trace: "retain-on-failure",
        }
      : {}),
  },
  ...(isRemote ? {} : { webServer: localWebServer }),
});

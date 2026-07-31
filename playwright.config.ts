import { defineConfig } from "@playwright/test";
import { visualBaseUrl } from "./tests/support/site";

export const visualPlaywrightUse = {
  baseURL: visualBaseUrl,
};

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      pathTemplate: "canonical-snapshots/visual{/projectName}/{arg}{ext}",
    },
  },
  use: visualPlaywrightUse,
});

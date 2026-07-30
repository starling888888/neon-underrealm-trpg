import { defineConfig } from "@playwright/test";
import { visualBaseUrl } from "./tests/visual/config";

export const visualPlaywrightUse = {
  baseURL: visualBaseUrl,
};

export default defineConfig({
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.01,
      pathTemplate: "canonical-snapshots/visual{/projectName}/{arg}{ext}",
    },
  },
  use: visualPlaywrightUse,
});

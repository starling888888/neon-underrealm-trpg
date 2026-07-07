import { defineConfig } from "@playwright/test";
import { visualBaseUrl } from "./tests/visual/config";

export default defineConfig({
  use: {
    baseURL: visualBaseUrl,
  },
});

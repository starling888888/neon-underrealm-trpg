/// <reference types="vitest/config" />

import { getViteConfig } from "astro/config";
import { configDefaults } from "vitest/config";

export default getViteConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text-summary"],
    },
    exclude: [
      ...configDefaults.exclude,
      "tests/contract/**",
      "tests/e2e/**",
      "tests/vrt/**",
    ],
  },
});

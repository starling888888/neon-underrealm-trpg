/// <reference types="vitest/config" />

import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    exclude: [...configDefaults.exclude, "tests/integration/**"],
    include: ["tests/unit/**/*.test.ts"],
  },
});

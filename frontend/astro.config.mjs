// @ts-check
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://starling888888.github.io",
  base: "/neon-underrealm-trpg",
  integrations: [mdx(), react()],
});

// @ts-check
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { defineConfig } from "astro/config";

const deploymentCommitSha = process.env.GITHUB_SHA?.trim() ?? "local";

if (
  deploymentCommitSha !== "local" &&
  !/^[0-9a-f]{40}$/iu.test(deploymentCommitSha)
) {
  throw new Error(
    "GITHUB_SHA must be a 40-character hexadecimal value when it is set.",
  );
}

export default defineConfig({
  site: "https://starling888888.github.io",
  base: "/neon-underrealm-trpg",
  integrations: [mdx(), react()],
  vite: {
    define: {
      __PAGEFIND_DEPLOYMENT_COMMIT_SHA__: JSON.stringify(deploymentCommitSha),
    },
  },
});

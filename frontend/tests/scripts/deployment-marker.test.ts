import { describe, expect, it } from "vitest";
import { getDeploymentCommitSha } from "../../scripts/write-pagefind-deployment-marker/lib";

const commitSha = "abcdef0123456789abcdef0123456789abcdef01";

describe("deployment marker", () => {
  it("prefers the GitHub Actions commit SHA", () => {
    expect(
      getDeploymentCommitSha({ GITHUB_SHA: commitSha.toUpperCase() }),
    ).toBe(commitSha);
  });

  it("marks local builds without requiring Git access", () => {
    expect(getDeploymentCommitSha({})).toBe("local");
  });

  it("rejects invalid commit SHA values", () => {
    expect(() =>
      getDeploymentCommitSha({ GITHUB_SHA: "not-a-commit" }),
    ).toThrow("Deployment commit SHA");
  });
});

import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  frontendPath,
  frontendRoot,
  repositoryPath,
  repositoryRoot,
} from "../../scripts/_common/repository-paths";

describe("workspace repository paths", () => {
  it("keeps raw inputs at the repository root and generated outputs in frontend", () => {
    expect(repositoryPath(".raw")).toBe(join(repositoryRoot, ".raw"));
    expect(frontendPath("data/generated")).toBe(
      join(frontendRoot, "data/generated"),
    );
    expect(frontendPath(".env")).toBe(join(frontendRoot, ".env"));
    expect(frontendPath("dist")).toBe(join(frontendRoot, "dist"));
  });
});

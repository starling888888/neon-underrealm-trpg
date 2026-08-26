const commitShaPattern = /^[0-9a-f]{40}$/iu;
const localDeploymentMarker = "local";

export function getDeploymentCommitSha(
  environment: NodeJS.ProcessEnv = process.env,
): string {
  const commitSha = environment.GITHUB_SHA;

  if (commitSha === undefined) {
    return localDeploymentMarker;
  }

  const normalizedCommitSha = commitSha.trim();

  if (!commitShaPattern.test(normalizedCommitSha)) {
    throw new Error(
      "Deployment commit SHA must be a 40-character hexadecimal value.",
    );
  }

  return normalizedCommitSha.toLowerCase();
}

import { spawn } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const backendDirectory = fileURLToPath(new URL("..", import.meta.url));
const terraformDirectory = fileURLToPath(
  new URL("../terraform", import.meta.url),
);
const environmentPath = join(backendDirectory, ".env");
const variablesPath = join(terraformDirectory, "local.tfvars");

const readAssignment = (source, name) => {
  const match = source.match(
    new RegExp(`^${name}\\s*=\\s*"?([^"\\n]+)"?\\s*$`, "m"),
  );
  if (!match?.[1]) {
    throw new Error(`${name} must be set in ${variablesPath}.`);
  }

  return match[1].trim();
};

const readEnvironmentAssignment = (source, name) => {
  const match = source.match(new RegExp(`^${name}=(.+)$`, "m"));
  if (!match?.[1]) {
    throw new Error(`${name} must be set in ${environmentPath}.`);
  }

  return match[1].trim();
};

const variables = await readFile(variablesPath, "utf8");
const environment = await readFile(environmentPath, "utf8");
const stateDirectory = await mkdtemp(
  join(tmpdir(), "neon-underrealm-tfstate-"),
);
const backendConfigPath = join(stateDirectory, "backend.tfbackend");

const stateBucket = readAssignment(variables, "terraform_state_r2_bucket_name");
const stateKey = readAssignment(variables, "terraform_state_key");
const stateEndpoint = readAssignment(variables, "terraform_state_r2_endpoint");

await writeFile(
  backendConfigPath,
  [
    `bucket = "${stateBucket}"`,
    `key = "${stateKey}"`,
    'region = "auto"',
    `endpoints = { s3 = "${stateEndpoint}" }`,
    "skip_credentials_validation = true",
    "skip_metadata_api_check = true",
    "skip_requesting_account_id = true",
    "skip_s3_checksum = true",
    "use_path_style = true",
  ].join("\n"),
);

const terraform = spawn(
  "terraform",
  ["-chdir=terraform", "init", `-backend-config=${backendConfigPath}`],
  {
    cwd: backendDirectory,
    env: {
      ...process.env,
      AWS_ACCESS_KEY_ID: readEnvironmentAssignment(
        environment,
        "TF_STATE_R2_ACCESS_KEY_ID",
      ),
      AWS_SECRET_ACCESS_KEY: readEnvironmentAssignment(
        environment,
        "TF_STATE_R2_SECRET_ACCESS_KEY",
      ),
    },
    stdio: "inherit",
  },
);

terraform.on("exit", (code) => (process.exitCode = code ?? 1));

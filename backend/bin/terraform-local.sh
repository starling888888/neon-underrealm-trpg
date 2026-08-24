#!/usr/bin/env bash
set -euo pipefail

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
environment_file="$script_directory/../.env"

if [[ ! -f "$environment_file" ]]; then
  printf 'Missing local Terraform environment file: %s\n' "$environment_file" >&2
  exit 1
fi

set -a
source "$environment_file"
set +a

exec terraform "$@"

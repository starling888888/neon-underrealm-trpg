#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  printf 'Usage: %s <d1-database-name>\n' "$0" >&2
  exit 1
fi

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
backend_directory="$(cd -- "$script_directory/.." && pwd)"

cd "$backend_directory"
exec ../node_modules/.bin/wrangler d1 migrations apply "$1" --remote

#!/usr/bin/env bash
set -euo pipefail

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
backend_directory="$(cd -- "$script_directory/.." && pwd)"
repository_directory="$(cd -- "$backend_directory/.." && pwd)"
wrangler="$repository_directory/node_modules/.bin/wrangler"
state_directory="$(mktemp -d "${TMPDIR:-/tmp}/neon-underrealm-d1-r2.XXXXXX")"
worker_pid=""

cleanup() {
  if [[ -n "$worker_pid" ]]; then
    kill "$worker_pid" 2>/dev/null || true
    wait "$worker_pid" 2>/dev/null || true
  fi
  rm -rf -- "$state_directory"
}

trap cleanup EXIT INT TERM

cd "$backend_directory"
"$wrangler" d1 migrations apply DB --local --persist-to "$state_directory"
"$wrangler" dev --local --persist-to "$state_directory" --port "${BACKEND_PORT:-8787}" &
worker_pid="$!"
wait "$worker_pid"

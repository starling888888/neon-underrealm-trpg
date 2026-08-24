#!/usr/bin/env bash
set -euo pipefail

script_directory="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
backend_directory="$(cd -- "$script_directory/.." && pwd)"
repository_directory="$(cd -- "$backend_directory/.." && pwd)"
wrangler="$repository_directory/node_modules/.bin/wrangler"
state_directory="$(mktemp -d "${TMPDIR:-/tmp}/neon-underrealm-d1-r2.XXXXXX")"
worker_log="$(mktemp "${TMPDIR:-/tmp}/neon-underrealm-worker.XXXXXX.log")"
worker_pid=""

cleanup() {
  if [[ -n "$worker_pid" ]]; then
    kill "$worker_pid" 2>/dev/null || true
    wait "$worker_pid" 2>/dev/null || true
  fi
  rm -rf -- "$state_directory"
  rm -f -- "$worker_log"
}

trap cleanup EXIT INT TERM

cd "$backend_directory"
"$wrangler" d1 migrations apply DB --local --persist-to "$state_directory"
"$wrangler" dev --local --persist-to "$state_directory" --port 8787 --log-level warn >"$worker_log" 2>&1 &
worker_pid="$!"

for attempt in {1..30}; do
  if curl --fail --silent --show-error http://127.0.0.1:8787/health; then
    break
  fi
  sleep 1
done

if ! curl --fail --silent http://127.0.0.1:8787/health >/dev/null; then
  cat "$worker_log" >&2
  exit 1
fi

"$repository_directory/node_modules/.bin/tsx" tests/integration.ts

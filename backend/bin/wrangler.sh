#!/usr/bin/env sh
set -eu

script_dir=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
backend_dir=$(dirname "$script_dir")
repository_dir=$(dirname "$backend_dir")
wrangler_binary="$repository_dir/node_modules/.bin/wrangler"

usage() {
  echo "Usage: backend/bin/wrangler.sh <dev|prod> <wrangler arguments...>" >&2
  exit 2
}

environment=${1-}
[ -n "$environment" ] || usage
shift
[ "$#" -gt 0 ] || usage

case "$environment" in
  dev)
    if [ -f "$backend_dir/.env" ]; then
      set -a
      . "$backend_dir/.env"
      set +a
    fi
    wrangler_environment=dev
    ;;
  prod)
    wrangler_environment=""
    ;;
  *)
    usage
    ;;
esac

for argument in "$@"; do
  case "$argument" in
    --env | --env=* | -e)
      echo "The wrapper selects the Wrangler environment; do not pass --env or -e." >&2
      exit 2
      ;;
  esac
done

if [ "$1" = "deploy" ]; then
  set -- "$@" \
    --var "GOOGLE_OAUTH_CLIENT_ID:${GOOGLE_OAUTH_CLIENT_ID-}" \
    --var "CORS_ALLOW_ORIGIN:${CORS_ALLOW_ORIGIN-}"
fi

exec "$wrangler_binary" "$@" --env "$wrangler_environment"

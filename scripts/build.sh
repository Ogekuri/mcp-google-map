#!/usr/bin/env bash
# build.sh — compile TypeScript sources to dist/
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d node_modules ]; then
  echo "node_modules missing — running setup first..." >&2
  scripts/setup.sh
fi

npm run build
echo "Build OK → dist/"

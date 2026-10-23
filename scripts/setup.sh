#!/usr/bin/env bash
# setup.sh — prepare the project: install dependencies and create .env
set -euo pipefail
cd "$(dirname "$0")/.."

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"
if [ "${NODE_MAJOR:-0}" -lt 22 ]; then
  echo "ERROR: Node.js >= 22 required (found $(node -v))" >&2
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit it and set GOOGLE_MAPS_API_KEY."
fi

npm install
echo
echo "Setup complete. Next steps:"
echo "  scripts/build.sh       # compile to dist/"
echo "  scripts/start-mcp.sh   # run MCP server (stdio)"
echo "  scripts/start-http.sh  # run MCP server (HTTP)"

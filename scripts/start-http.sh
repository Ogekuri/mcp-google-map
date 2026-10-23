#!/usr/bin/env bash
# start-http.sh — run the MCP server over Streamable HTTP
# Endpoint: http://<host>:<port>/mcp   (defaults: 127.0.0.1:3000, override via env or args)
# Extra args are forwarded to the CLI (e.g. --port 3100 --apikey "AIza...")
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f dist/cli.js ] || scripts/build.sh

HOST="${MCP_SERVER_HOST:-127.0.0.1}"
PORT="${MCP_SERVER_PORT:-3000}"

exec node dist/cli.js --host "$HOST" --port "$PORT" "$@"

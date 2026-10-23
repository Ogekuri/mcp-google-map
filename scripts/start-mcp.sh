#!/usr/bin/env bash
# start-mcp.sh — run the MCP server over stdio (for MCP clients: pi, Claude Desktop, Cursor, ...)
# Builds automatically on first run. Extra args are forwarded to the CLI.
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f dist/cli.js ] || scripts/build.sh

# stdout is reserved for JSON-RPC: all server logs already go to stderr
exec node dist/cli.js --stdio "$@"

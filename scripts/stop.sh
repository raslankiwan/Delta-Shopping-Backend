#!/usr/bin/env bash
#
# Mercato — stop everything started by scripts/dev.sh.
#   ./scripts/stop.sh            # stop dev servers + containers (keep data)
#   ./scripts/stop.sh --clean    # also delete the Postgres/Redis volumes
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "▶ Stopping dev servers…"
pkill -f "turbo run dev" 2>/dev/null || true
pkill -f "next dev"      2>/dev/null || true
pkill -f "vite"          2>/dev/null || true
pkill -f "apps/api/src/main.ts" 2>/dev/null || true

echo "▶ Stopping containers…"
if [ "${1:-}" = "--clean" ]; then
  docker compose -f infra/docker-compose.yml down -v
  echo "  removed Postgres/Redis volumes (data wiped)."
else
  docker compose -f infra/docker-compose.yml down
fi
echo "✔ Stopped."

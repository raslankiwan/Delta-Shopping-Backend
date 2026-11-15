#!/usr/bin/env bash
#
# Mercato — run the whole stack end-to-end locally.
#   ./scripts/dev.sh
#
# Brings up Postgres + Redis (Docker), installs deps, migrates + seeds the demo
# data, wires the storefront to the seeded demo store, then starts the API,
# storefront and admin dev servers together (Turborepo). Ctrl-C stops the servers;
# run ./scripts/stop.sh to also tear down the containers.
set -euo pipefail

# Resolve repo root (this script lives in <root>/scripts).
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

COMPOSE=(docker compose -f infra/docker-compose.yml)

say() { printf '\n\033[1;36m▶ %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

# --- prerequisites -----------------------------------------------------------
command -v bun    >/dev/null || die "bun is required (https://bun.sh)."
command -v docker >/dev/null || die "docker is required and must be running."
docker info >/dev/null 2>&1  || die "docker daemon is not running — start Docker and retry."

# --- env ---------------------------------------------------------------------
if [ ! -f .env ]; then
  say "Creating .env from .env.example"
  cp .env.example .env
fi
# Export the vars the script itself needs (DATABASE_* etc.).
set -a; . ./.env; set +a

# --- dependencies ------------------------------------------------------------
say "Installing dependencies (bun install)"
bun install

# --- infrastructure ----------------------------------------------------------
say "Starting Postgres 18 + Redis 7 (docker compose)"
if ! "${COMPOSE[@]}" up -d --wait 2>/dev/null; then
  # Older docker compose without --wait: start then poll.
  "${COMPOSE[@]}" up -d
  say "Waiting for Postgres to become ready"
  for _ in $(seq 1 60); do
    if "${COMPOSE[@]}" exec -T postgres pg_isready -U postgres -d mercato >/dev/null 2>&1; then break; fi
    sleep 2
  done
fi
if ! "${COMPOSE[@]}" exec -T postgres pg_isready -U postgres -d mercato >/dev/null 2>&1; then
  printf '\n\033[1;31m--- postgres logs (last 20 lines) ---\033[0m\n'
  "${COMPOSE[@]}" logs postgres 2>&1 | tail -20
  die "Postgres did not become ready. Common causes:
  • host port 5432 is already in use → stop the other Postgres, or change the mapping in infra/docker-compose.yml
  • a stale/incompatible data volume → 'docker compose -f infra/docker-compose.yml down -v' then retry ('down -v' WIPES the dev DB)"
fi

# --- database ----------------------------------------------------------------
say "Applying migrations"
bun run db:migrate
say "Seeding demo data (org + two isolated stores + demo owner)"
bun run db:seed

# --- wire the storefront to the freshly-seeded demo store --------------------
STORE_ID="$("${COMPOSE[@]}" exec -T postgres psql -U postgres -d mercato -tAc \
  "select id from store where slug='aurora'" | tr -d '[:space:]')"
[ -n "$STORE_ID" ] || die "Could not read the demo store id after seeding."

API_URL="${NEXT_PUBLIC_API_URL:-http://localhost:9000/v1}"
cat > apps/storefront/.env.local <<EOF
NEXT_PUBLIC_API_URL=$API_URL
NEXT_PUBLIC_DEMO_STORE_ID=$STORE_ID
EOF
cat > apps/admin/.env.local <<EOF
VITE_API_URL=${VITE_API_URL:-http://localhost:9000/v1}
EOF
say "Wired storefront to demo store $STORE_ID"

# --- go ----------------------------------------------------------------------
printf '\n\033[1;32m✔ Ready.\033[0m Starting API + storefront + admin (Ctrl-C to stop)…\n'
cat <<EOF

  API         http://localhost:${API_PORT:-9000}/v1   (health: /v1/health)
  Storefront  http://localhost:9001/en
  Admin       http://localhost:9002     (staff login: owner@demo.test / password123)

  Operator token (X-Operator-Token): ${OPERATOR_TOKEN:-<see .env>}

EOF

# Turborepo runs all three dev servers together (persistent).
exec bun run dev

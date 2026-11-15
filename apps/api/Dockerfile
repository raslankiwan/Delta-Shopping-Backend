# syntax=docker/dockerfile:1
#
# Mercato API (NestJS, apps/api) — multi-stage build on the official Bun image.
#
# This lives inside the Bun workspace monorepo (root package.json declares
# workspaces: ["apps/*", "packages/*"]), so `bun install` needs the *whole*
# repo's package.json files to resolve internal @mercato/* deps correctly,
# and the build needs the full source tree.
#
# IMPORTANT: build context must be the MONOREPO ROOT, not apps/api, e.g.:
#   docker build -f apps/api/Dockerfile -t mercato-api .
#
# apps/api may not exist yet at the time this Dockerfile was written. It is
# written against the two contracts every app in this repo is expected to
# provide (see root package.json / turbo.json):
#   build: "bun run --cwd apps/api build"
#   start: "bun run --cwd apps/api start"
# If apps/api's package.json scripts ever diverge from those names, update
# the RUN/CMD lines below to match.

ARG BUN_VERSION=1.3

# ---------------------------------------------------------------------------
# Stage 1: build — install the full workspace's dependencies, compile apps/api.
#
# We deliberately COPY the whole repo before `bun install` rather than
# hand-picking each workspace's package.json first (the usual trick for a
# manifests-only cache layer): this repo's package set is still growing
# (packages/config exists today; packages/db, packages/core, packages/testing
# etc. are landing next), and enumerating them by name here would silently
# break `bun install`'s workspace resolution the next time a package is
# added and this Dockerfile isn't updated in lockstep. Trading a bit of
# build-cache granularity for that robustness.
# ---------------------------------------------------------------------------
FROM oven/bun:${BUN_VERSION} AS build
WORKDIR /app

COPY . .

RUN bun install --frozen-lockfile

ENV NODE_ENV=production

# Builds apps/api only; Turborepo (invoked transitively if apps/api's own
# "build" script shells out to it) resolves ^build for any @mercato/*
# packages it depends on. If apps/api needs its workspace deps built first
# and its own script doesn't already handle that via turbo, prefer:
#   bunx turbo run build --filter=@mercato/api...
# over the plain bun script below.
RUN bun run --cwd apps/api build

# ---------------------------------------------------------------------------
# Stage 2: runtime — slim final image, just enough to run the built API.
# ---------------------------------------------------------------------------
FROM oven/bun:${BUN_VERSION}-slim AS runtime
WORKDIR /app

ENV NODE_ENV=production
ENV API_PORT=4000

# Copy the whole built workspace rather than hand-picking dist/node_modules:
# Bun workspaces hoist + symlink node_modules across packages, and apps/api's
# build output layout isn't known yet (source doesn't exist at time of
# writing) — copying the full /app from the build stage is the robust
# choice until the app's actual dist/runtime footprint is established, at
# which point this can be trimmed to just the needed paths.
COPY --from=build /app /app

# The official Bun images ship a non-root "bun" user (uid 1000) — run as
# that rather than root.
USER bun

EXPOSE 4000

# Storefront/admin both talk to the API over /v1 at this port (see
# .env.example: API_PORT=4000, NEXT_PUBLIC_API_URL/VITE_API_URL point at
# http://localhost:4000/v1).
CMD ["bun", "run", "--cwd", "apps/api", "start"]

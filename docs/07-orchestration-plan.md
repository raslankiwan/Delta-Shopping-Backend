# Orchestration Plan — Models, Agents & Subagents

**Version:** 1.0 · **Date:** 2026-07-17

How the build is executed: which work runs on which model, what is delegated to
subagents, and where the deterministic multi-agent Workflow is used. The goal is
to spend the strongest model on the decisions that are expensive to get wrong and
cheaper models on bounded, well-specified execution — without sacrificing a
verifiable result.

---

## 1. Roles

| Role | Model tier | Responsibility |
|------|-----------|----------------|
| **Orchestrator / architect** | Opus (this session) | Sequences the build, owns the schema + RLS + tenant-context integration, writes the isolation test, does final verification. The "expensive to get wrong" core. |
| **Leaf scaffolders** | Sonnet | Bounded, independent codegen with clear specs and disjoint output paths (app shells, CI/Docker). Parallelized. |
| **Mechanical edits** | Haiku | Repetitive, low-ambiguity transforms (rename sweeps, boilerplate) — used as needed. |

Principle: **model tier tracks the cost of a mistake, not the size of the task.**
Schema/RLS bugs are silent and dangerous → Opus. A Next.js skeleton is visible and
cheap to redo → Sonnet.

---

## 2. Critical path vs. leaves

The build splits into a **sequential critical path** (kept on the orchestrator,
because each step constrains the next) and **independent leaves** (fanned out).

```
critical path (orchestrator, inline):
  foundation → @mercato/config → @mercato/core → @mercato/db (schema/RLS/migrations)
             → @mercato/testing (isolation test) → apps/api (tenant mw + Catalog)
             → verification (install · docker · migrate · seed · typecheck · RLS test)

leaves (subagents, parallel, no critical-path dependency):
  apps/storefront skeleton   apps/admin skeleton   .github CI + api Dockerfile
```

Leaves write to **disjoint directories**, so they need no git-worktree isolation
(paths never collide) and no lockfile coordination (they only write files; the
single `bun install` happens once, on the critical path). This is the cheapest
safe form of parallelism.

---

## 3. The Workflow

The leaves were built by a background **Workflow** (`mercato-scaffold-leaves`) —
a deterministic multi-agent script rather than ad-hoc dispatch, so it is auditable
and re-runnable:

- **Fan-out:** `parallel()` of three Sonnet subagents (storefront, admin,
  CI/Docker), each given the repo conventions (Bun, `@mercato/*` naming, ports,
  Money shape) and hard rules (**write files only; never run installs or servers**
  — so no lockfile race with the orchestrator's concurrent work).
- **Join:** the orchestrator continues the critical path while the Workflow runs,
  then integrates and verifies everything together.

Why a Workflow and not inline subagent calls: it encodes the fan-out/join
structure once, runs in the background while the orchestrator works, and can be
resumed from cache if a leaf needs to be re-run with an edited prompt.

### Scaling this pattern to later phases

The same shape scales to the rest of the backlog, where the work is genuinely
parallel across bounded modules:

- **Per-module vertical slices** (inventory, cart, orders, customers) → one
  subagent per module against the frozen OpenAPI contract, each verifying its own
  typecheck/tests as it completes (a `pipeline()` of generate → verify).
- **Adversarial verification** for security-sensitive work (RLS additions, auth):
  a second agent whose only job is to try to break tenant isolation on the new
  tables before the change is accepted.
- **Contract-first**: once `@mercato/api-client` is generated from OpenAPI,
  frontend and backend slices proceed in parallel with the contract as the seam.

---

## 4. Verification discipline

No step is marked done on assertion alone. The foundation is proven by a real
Postgres running the isolation test; the API by exercising its endpoints. The
orchestrator runs the environment-sensitive steps (install, docker, migrations,
tests) directly rather than delegating them, because they need judgment when they
fail and share the same filesystem regardless.

---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/project-context.md
workflowType: 'architecture'
project_name: 'FunnelShop'
user_name: 'Root'
date: '2026-02-26'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

36 FRs across 8 capability areas:

1. **User Account Management** (FR1–6): Registration, email verification, login/logout, password reset, profile update, GDPR self-serve account deletion
2. **Funnel Simulation** (FR7–14, FR36): Create, configure, run, view results, save named funnels, rename/delete, Free tier cap (1 funnel), upgrade prompt, duplicate-as-unsaved
3. **Blueprint Library** (FR15–20): Browse/filter, view description + rationale, apply to new simulation, customise parameters, Pro share via public URL, unauthenticated public URL view
4. **Workspace & Funnel Management** (FR21–22): List saved funnels, unlimited saves (Pro)
5. **Subscription & Billing** (FR23–28): Upgrade to Pro, view plan + billing cycle, update payment method, cancel, email confirmations, billing history
6. **Export & Reporting** (FR29–30): PDF export (Pro only), includes all input params + computed metrics + visual funnel diagram
7. **Agency Waitlist** (FR31–32): Email capture on pricing page, operator notification on signup
8. **Compliance & Communication** (FR33–35): Transactional emails (verify, reset, sub confirm, cancel confirm), cookie/analytics consent management, self-serve account deletion

**Non-Functional Requirements:**

26 NFRs driving architectural decisions:

- **Performance:** Simulation < 500ms p95 server-side (NFR1); dashboard < 3s (NFR2); blueprint library < 2s (NFR3); PDF < 10s (NFR4)
- **Security:** HTTPS/TLS 1.2+ (NFR5); bcrypt/argon2 passwords (NFR6); Stripe webhook signature verification (NFR7); parameterised queries only (NFR8); JWT 30-day expiry + refresh token rotation (NFR9); `org_id`-scoped queries on all tenant data — architecturally impossible to cross tenants without explicit org context (NFR10); Sentry PII scrubbing (NFR11); rate limiting 60 req/min authenticated / 10 req/min unauthenticated (NFR26)
- **Reliability:** 99.5% uptime (NFR12); Stripe webhook idempotency (NFR13); daily DB backups + PITR (NFR14)
- **Scalability:** 1,000 concurrent users at launch (NFR15); `org_id`/`user_id` indexes on all tenant tables, sub-100ms at 100k+ rows (NFR16); stateless application layer (NFR17)
- **Compliance:** Cascade delete within single DB transaction, completes immediately (NFR18); PostHog does not initialise without explicit consent (NFR19); EU-only data storage and processing (NFR20); DPAs with Stripe, Resend, Sentry before first paying user (NFR21)
- **Integration Resilience:** Clear Stripe error surfacing (NFR22); Resend retry + Sentry logging on auth email failure (NFR23); PostHog SDK failure non-blocking (NFR24); Sentry SDK failure non-blocking (NFR25)

**Scale & Complexity:**

- Primary domain: Full-stack B2B SaaS (React/Vite frontend + Express API + PostgreSQL)
- Complexity level: **Medium-High** — bounded feature scope but multi-tenancy + billing + GDPR + auth + brownfield migration all interact and share risk surface
- Estimated major architectural components: 9 (Auth, Billing/Stripe, Funnel CRUD, Blueprint Library, PDF Export, Agency Waitlist, GDPR/Account Deletion, Analytics/PostHog, Structured Logging)

### Technical Constraints & Dependencies

- **Brownfield:** v1 delivers working drag-drop canvas + simulation engine. v2 adds the commercial layer without breaking v1 functionality.
- **Server TS migration decision required:** Server is plain CommonJS JS; all new v2 server code must not be written until the TS migration decision is made and documented. This is the #1 prerequisite that gates all other server implementation.
- **Route module refactor required:** `server/index.js` is a single-file monolith. New endpoints (auth, billing, funnels, GDPR) cannot be added to it. A modular route structure must be established first.
- **DB test strategy required:** All current server tests hit `dataStore` (Map) directly. PostgreSQL replacement will break the entire test suite. A database test strategy (test containers, pg mock, or SQLite swap) must be defined before any new server tests are written.
- **EU-only hosting:** Hetzner Falkenstein, Germany for app servers, PostgreSQL, PostHog (self-hosted), object storage (PDF exports), Sentry EU endpoint. No US-domiciled services for user data.
- **External integrations:** Stripe (billing + webhooks), Resend (transactional email), Sentry (error monitoring, EU region), PostHog (product analytics, self-hosted Hetzner)
- **Existing tech stack:** Node.js ≥20, React 19, TypeScript ~5.9.3 (client), Vite 7, Express 5, Tailwind CSS 4 (layout only), design tokens in `tokens.css`

### Cross-Cutting Concerns Identified

1. **Multi-tenancy** *(highest-severity risk)*: `org_id`/`userId` scoping must be applied to every DB read AND write at the repository layer. A single missing query filter is a cross-workspace data leak with no runtime error to signal it.
2. **Authentication**: JWT + refresh token rotation; when auth middleware lands, ALL endpoints must be audited and covered in the same PR — partial auth is a security gap.
3. **Rate limiting**: API-layer middleware; ships with auth, not as a follow-up.
4. **Subscription entitlement enforcement**: Server-side on every protected endpoint — client-side gating is UI-only and never trusted.
5. **GDPR cascade deletion**: Strict FK-respecting deletion order (simulation_results → funnels → client_workspaces → org_memberships → org → user) wrapped in a single DB transaction.
6. **TypeScript server migration**: Gates all new server implementation; must be resolved before any v2 server story begins.
7. **Structured logging**: Winston/Pino with user ID + org ID context on all request and error paths — required for incident investigation (Journey 3A).
8. **Stripe webhook reliability**: Idempotency key handling on all webhook handlers; duplicate delivery must not create duplicate subscription state.

## Starter Template Evaluation

### Primary Technology Domain

Full-stack SaaS (React/Vite frontend + Express/Node.js API) — brownfield extension of v1 codebase.

### Starter Options Considered

No new project scaffold is applicable. This is a brownfield project with an established v1 codebase. The "starter" decision is the server TypeScript migration approach, which is the #1 prerequisite gating all v2 server implementation.

### Selected Approach: Server TS Migration via tsup + tsx

**Rationale:** The project-context explicitly flags server TS migration as the prerequisite for all v2 server implementation. `tsup` (esbuild-powered) + `tsx` is the current standard for Express/Node TypeScript projects — fast builds, zero config, ESM output, source maps.

**Initialization — Story 0 (must be first):**
Server TS migration is the first implementation story. No new v2 server code is written until this story is complete and merged.

**Architectural Decisions Provided by Migration:**

**Language & Runtime:**
All new server files are TypeScript (`.ts`), ESM `import`/`export`. Server transitions from CommonJS `require()` to ESM.

**Build Tooling:**
- `tsup` (esbuild-powered) for production builds — zero config, fast, source maps, ESM output
- `tsx --watch` for dev hot reload (replaces `nodemon` + `ts-node` combo)
- `tsc --noEmit` for type checking only (not used as compiler)
- Output compiled to `dist/` for production

**Validation Layer:**
Zod for all request body/param validation — replaces ad-hoc validation middleware, provides type-safe parse at system boundaries.

**New Packages for v2:**

| Package | Purpose |
|---|---|
| `drizzle-orm` | TypeScript ORM — PostgreSQL, zero-dep, type-safe schema |
| `drizzle-kit` | Migration CLI + schema management |
| `postgres` | PostgreSQL driver (recommended by Drizzle for Node) |
| `tsup` | Server build tooling (esbuild-powered) |
| `tsx` | Dev server TS runner (replaces nodemon + ts-node) |
| `stripe` | Stripe SDK for billing + webhooks |
| `resend` | Transactional email SDK |
| `winston` | Structured logging with user_id + org_id context |
| `express-rate-limit` | Rate limiting middleware |
| `jsonwebtoken` + `@types/jsonwebtoken` | JWT auth tokens |
| `bcryptjs` + `@types/bcryptjs` | Password hashing |
| `zod` | Request validation at system boundaries |

**Note:** Server TS migration (Story 0) is the prerequisite that unblocks all other v2 server stories. No v2 server code is written before this story is merged.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Server TypeScript migration — gates all v2 server stories
- PostgreSQL + Drizzle ORM — gates all data persistence stories
- JWT + DB refresh token table — gates auth story
- Pino structured logging — ships with auth (required for incident investigation NFR)
- Hybrid DB test strategy — gates writing any new server tests

**Important Decisions (Shape Architecture):**
- Puppeteer for PDF generation — drives server memory allocation planning
- No Redis for v2 — simplifies infrastructure, revisit post-launch with PostHog metrics
- Zod validation at all request boundaries — shapes every endpoint implementation

**Deferred Decisions (Post-MVP):**
- Redis caching — deferred until PostHog metrics identify a specific bottleneck
- CDN for static assets — not required at 1,000 concurrent users on Hetzner
- Horizontal scaling / load balancer — stateless app layer (NFR17) makes this ready when needed

---

### Data Architecture

**Database:** PostgreSQL (EU-only, Hetzner Falkenstein)
- Rationale: PRD mandates; relational model fits multi-tenant org/user/funnel hierarchy; strong FK enforcement enables GDPR cascade delete

**ORM:** Drizzle ORM (latest stable) + drizzle-kit for migrations
- Rationale: TypeScript-first, zero-overhead query builder, schema-as-code, direct Drizzle migrations avoid runtime surprises; supports parameterised queries exclusively (NFR8)
- Migration approach: `drizzle-kit generate` → version-controlled SQL migration files → `drizzle-kit migrate` on deploy. No schema push in production.

**Driver:** `postgres` (npm) — recommended by Drizzle for Node.js

**Validation:** Zod at all request boundaries (HTTP body, params, query strings). Never trust client input beyond Zod parse.

**Caching:** None for v2. PostgreSQL + `org_id`/`user_id` compound indexes (NFR16) are sufficient at launch scale. Redis added only when PostHog metrics surface a specific query bottleneck.

**Multi-tenancy enforcement:** Every repository function receives `orgId` as an explicit parameter. No query is written without `WHERE org_id = $orgId`. Enforced at the repository layer, not the service layer.

---

### Authentication & Security

**Auth method:** JWT (30-day access token) + refresh token rotation (NFR9)
- Access token: signed JWT, 30-day expiry, carries `userId` + `orgId` + `plan` claims
- Refresh token: stored in `refresh_tokens` DB table (hashed), rotated on every use, deleted on logout and GDPR account deletion

**Refresh token storage decision:** DB `refresh_tokens` table
- Rationale: clean revocation (delete row = immediate invalidation), fits GDPR cascade delete transaction, consistent with DB-first approach, avoids CSRF complexity of httpOnly cookies

**Password hashing:** bcrypt via `bcryptjs` (NFR6). Work factor 12.

**Rate limiting:** `express-rate-limit` middleware — 60 req/min authenticated, 10 req/min unauthenticated (NFR26). Ships in the same PR as auth middleware.

**Stripe webhook security:** Signature verification on every webhook handler (NFR7). Raw body preserved for Stripe HMAC validation before any parsing.

**Multi-tenant isolation:** `org_id` scoping at repository layer (NFR10). Auth middleware extracts `orgId` from JWT and attaches to `req.auth`. All downstream repository calls use `req.auth.orgId` — never a client-supplied org ID.

**PII:** Sentry SDK configured with PII scrubbing enabled (NFR11). No user emails, names, or payment data in error payloads.

---

### API & Communication Patterns

**API style:** REST over HTTPS/TLS 1.2+ (NFR5)
- URL prefix: `/api/` (no versioning prefix for v2; add `/v2/` if breaking changes arise post-launch)
- JSON request/response throughout

**Error response standard:**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "...", "field": "email" } }
```
Machine-readable `code` string + human-readable `message`. HTTP status codes semantically correct.

**Route structure:** Modular Express routers — `auth`, `funnels`, `blueprints`, `billing`, `exports`, `gdpr`, `waitlist`. Mounted on `app.use('/api/...')`. Replaces monolithic `server/index.js`.

**Stripe webhook handler:** Separate Express route with raw body parser (`express.raw()`), signature verification before any business logic.

**Transactional email:** Resend SDK (NFR23). Auth emails (verify, reset) retry on failure with Sentry error logging. Non-blocking — email failure does not fail the originating HTTP request, except account verification flow.

---

### Frontend Architecture

**Framework:** React 19 + Vite 7 + TypeScript (existing — unchanged)

**State management:**
- Server state (funnel list, blueprints, billing info): TanStack Query (React Query) — cache, background refetch, loading/error states without prop drilling
- UI/local state: React `useState`/`useReducer` — no global client store needed
- Auth state: React Context (lightweight — just `user`, `plan`, `orgId` from JWT decode)

**Routing:** React Router v7 (existing — extend with protected route wrappers for auth and Pro entitlement guards)

**Pro entitlement gating (frontend):** UI-only — hides/disables features for Free users. Server enforces entitlement independently. Never trust client-side plan state for access control.

**Analytics:** PostHog SDK (self-hosted Hetzner). Does not initialise until explicit cookie consent (NFR19). Non-blocking — SDK failure does not affect app functionality (NFR24).

**Bundle:** Vite handles code splitting. No additional optimisation required at launch scale.

---

### Infrastructure & Deployment

**Hosting:** Hetzner Falkenstein, Germany — EU-only (NFR20)
- App server: Node.js process (stateless — NFR17, enables horizontal scaling when needed)
- PostgreSQL: Hetzner managed or self-hosted on dedicated server
- Object storage: Hetzner Object Storage for Puppeteer-generated PDF exports
- PostHog: self-hosted on Hetzner

**Logging:** Pino + `pino-http` middleware
- Rationale: async non-blocking logging (~5x throughput vs Winston) — non-negotiable at 1,000 concurrent users. `pino-http` is one middleware line on the Express app.
- Every log entry includes: `userId`, `orgId`, `requestId`, `statusCode`, `responseTime`
- Log level: `info` in production, `debug` in development

**Error monitoring:** Sentry EU region endpoint. PII scrubbing enabled. Non-blocking SDK (NFR25).

**PDF generation:** Puppeteer (headless Chrome)
- Rationale: renders existing React/SVG funnel diagram directly — no PDF DSL duplication
- Memory: ~150MB per instance; acceptable on Hetzner
- Concurrency: capped at 1 Puppeteer instance with an in-process queue for Pro users — keeps PDF generation within NFR4 (< 10s p95)
- Storage: generated PDFs streamed to Hetzner Object Storage, pre-signed URL returned to client

**Database reliability:** Daily automated backups + PITR enabled (NFR14). Backup storage: Hetzner EU.

**DB test strategy:** Hybrid
- Testcontainers (real PostgreSQL): integration tests for auth flows, Stripe webhook handlers, GDPR cascade deletion, multi-tenant query scoping — full fidelity where cross-table behaviour matters
- `pg-mem` (in-memory PG emulator): fast unit tests for repository layer query logic — preserves CI speed

---

### Decision Impact Analysis

**Implementation Sequence (dependency order):**
1. Server TS migration (Story 0) — unblocks everything
2. Drizzle schema + PostgreSQL connection + migration pipeline — unblocks all data stories
3. Auth (JWT + refresh_tokens table + Pino + rate limiting) — unblocks all protected endpoint stories
4. Billing/Stripe integration — depends on auth (user must exist before subscription)
5. Funnel CRUD (Pro entitlement enforcement) — depends on auth + billing plan in JWT
6. Blueprint Library — depends on Drizzle schema (read-only, minimal auth dependency)
7. PDF export (Puppeteer + object storage) — depends on Funnel CRUD
8. GDPR account deletion — depends on full schema (must know all tables to cascade)
9. Agency waitlist — independent of auth (email capture only)

**Cross-Component Dependencies:**
- Auth JWT claims (`userId`, `orgId`, `plan`) flow into every protected route and repository call
- `org_id` from JWT is the multi-tenancy enforcer — auth and data architecture are tightly coupled
- Pino `requestId` context must be threaded through async chains (use `AsyncLocalStorage` or pass explicitly)
- Puppeteer instance queue is shared infrastructure — PDF export story must implement queue before exposing endpoint
- Testcontainers setup is a shared test utility — DB test strategy story must land before any integration tests are written

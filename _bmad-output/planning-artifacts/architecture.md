---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/project-context.md
workflowType: 'architecture'
project_name: 'FunnelShop'
user_name: 'Root'
date: '2026-02-26'
---

# Architecture Decision Document

_FunnelShop v2 — Full Architecture for the Commercial Layer (Auth, Persistence, Billing, Multi-Tenancy)_

---

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**

FunnelShop v2 adds a commercial layer on top of a validated v1 simulation engine. The 36 functional requirements organise into six domains:

- **User Account Management (FR1–FR6):** Full auth lifecycle — registration, email verification, login/logout, password reset, profile update, GDPR-compliant self-serve account deletion with cascade
- **Funnel Simulation (FR7–FR14, FR36):** Existing v1 capability (drag-drop canvas, component config, simulation engine) persisted to PostgreSQL per user/org; Free tier capped at 1 saved funnel
- **Blueprint Library (FR15–FR20):** Blueprint browsing, application, customisation; Pro-only public shareable URLs
- **Workspace & Funnel Management (FR21–FR22):** Funnel list view, unlimited saves for Pro/Agency
- **Subscription & Billing (FR23–FR28):** Stripe-managed Free→Pro upgrade, cancellation, payment method update, billing history
- **Export & Reporting (FR29–FR30):** Pro-only PDF export of simulation results
- **Agency Waitlist (FR31–FR32):** Email capture on pricing page; operator notification via Resend
- **Compliance & Communication (FR33–FR35):** GDPR data consent, transactional emails (Resend), self-serve deletion

**Non-Functional Requirements:**

| NFR | Constraint | Architectural Impact |
|---|---|---|
| 99.5% uptime | Paid subscribers | Stateless app layer; DB on managed Hetzner; Sentry alerting |
| Simulation <500ms | ≤20 components | Stays client-side (no server round-trip for simulation compute) |
| Zero cross-tenant leaks | Multi-tenancy | `org_id` scoping at repository layer; enforced by Drizzle query builders |
| Rate limiting | All authed endpoints | express-rate-limit middleware on every API route |
| ≥90% server test coverage | Continuous | Jest + Supertest maintained through v2 |
| EU-only data | GDPR | Hetzner Falkenstein for all compute, storage, DB |
| All DB queries parameterised | Security | Drizzle ORM — no raw SQL string interpolation |
| Session tokens 30-day expiry | Security | JWT with explicit exp; refresh token rotation |
| Stripe webhooks idempotent | Billing reliability | Idempotency key on all webhook handlers |
| Account deletion cascade <24h | GDPR | Synchronous DB transaction on deletion request |

**Scale & Complexity:**

- **Primary domain:** Full-stack SaaS B2B web application
- **Complexity level:** Low-to-medium (no ML, no real-time collaboration, no mobile-native)
- **Architectural components:** ~8 (Auth, Billing, Funnel CRUD, Blueprint, PDF Export, Email, Analytics, Logging)
- **Team profile:** Solo developer or 2-person team

### Technical Constraints & Dependencies

- **Existing v1 codebase:** React 19 + Vite (client) and Node.js/Express 5 (server) — must preserve or deliberately migrate
- **Server is plain JavaScript (CommonJS):** Explicit architecture decision pending before v2 implementation begins (see Migration Decision below)
- **EU-only hosting:** Hetzner Falkenstein — no AWS, no Vercel, no US-domiciled services
- **External service lock-in:** Stripe (billing), Resend (email), Sentry EU (errors), PostHog self-hosted (analytics)
- **No state manager:** v1 uses React local state in `App.tsx`; v2 adds server-side session state only

### Cross-Cutting Concerns Identified

1. **Multi-tenancy isolation** — `org_id` scoping touches every data access layer
2. **Authentication middleware** — JWT verification required on all protected routes
3. **Subscription tier enforcement** — entitlement checks cross auth + billing + feature gating layers
4. **Structured logging** — user ID and org ID must appear in every server log entry
5. **Rate limiting** — applied globally at the Express middleware level
6. **GDPR cascade delete** — deletion logic spans all domain models in a single transaction
7. **TypeScript migration** — the server JS→TS decision affects every implementation story

---

## Starter Template Evaluation

### Primary Technology Domain

**Full-stack web SaaS** — existing React + Vite frontend communicating with an Express REST API backend. The question for v2 is whether to retain this split architecture or consolidate to a unified Next.js full-stack application.

### Options Evaluated

**Option A: Retain Express + Vite split (evolve in place)**
- Keep `/client` (Vite + React 19 + TypeScript) as-is
- Migrate `/server` from JavaScript to TypeScript (CommonJS → ESM)
- Add PostgreSQL, Drizzle ORM, JWT auth middleware to Express
- No framework change; lowest disruption; full ownership of server structure

**Option B: Migrate to Next.js App Router (full-stack consolidation)**
- Replace Express + Vite with a single Next.js application
- Server Components + API Route Handlers replace the Express layer
- Vercel-optimised deployment model (conflicts with EU-only Hetzner requirement)
- High migration cost; higher operational complexity for self-hosted Hetzner

**Option C: Hono + Vite (lightweight Express alternative)**
- Replace Express with Hono (faster, TypeScript-first, edge-ready)
- Keep Vite frontend unchanged
- Lower migration cost than Next.js; cleaner TypeScript foundation than Express
- Less battle-tested for monolith SaaS patterns; smaller ecosystem

### Selected Approach: Option A — Express + Vite (Evolve In Place)

**Rationale:**

- Zero framework migration cost — the simulation engine, drag-drop canvas, and blueprint CRUD are already validated at 92.5% test coverage. Rewriting them in Next.js buys nothing.
- EU-only Hetzner deployment constraint eliminates the primary advantage of Next.js (Vercel edge network). Next.js self-hosted on a bare VPS loses all its SSR performance optimisations.
- Express 5 is production-ready, widely understood, and sufficient for the REST API surface v2 requires.
- The v2 initiative is adding a commercial layer — auth, billing, persistence — not rebuilding the product. Architectural stability is a feature.
- TypeScript migration of the server (see Migration Decision) is a one-sprint investment that pays compound returns on type safety without the cost of a full framework swap.

**Initialization:** No project regeneration required. Evolve existing monorepo in place.

**Architectural Decisions Provided by Existing Foundation:**
- Language/Runtime: Node.js ≥20, TypeScript (client), JavaScript→TypeScript (server after migration)
- Build tooling: Vite 7 (client), ts-node / tsx (server dev after migration), tsc (server build)
- Testing: Vitest (client), Jest + Supertest (server) — unchanged
- Styling: Tailwind CSS 4 via PostCSS — unchanged
- Monorepo: Root `package.json` with `concurrently` orchestration — unchanged

---

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
1. Server TypeScript migration — blocks all v2 server stories
2. ORM and database migration tooling — blocks schema creation and all persistence stories
3. Authentication strategy — blocks all authenticated endpoint stories
4. Multi-tenancy data model — blocks schema and all CRUD stories

**Important Decisions (Shape Architecture):**
5. API versioning and structure
6. PDF generation approach
7. Stripe integration pattern
8. Session storage strategy

**Deferred Decisions (Post-MVP):**
- Client portal / viewer role (v3)
- Blueprint public URL CDN strategy (post-launch)
- WebSocket / real-time collaboration (v3)

---

### Decision 1: Server TypeScript Migration

**Decision: MIGRATE server to TypeScript (ESM)**

**Context:** The v1 server is plain JavaScript (CommonJS). The project context flags this explicitly as a blocking architecture decision for v2. The migration decision must be made before any v2 server code is written.

**Options Considered:**

| Option | Pros | Cons |
|---|---|---|
| Keep JavaScript/CommonJS | Zero migration effort | No type safety on Drizzle schemas, Stripe event payloads, JWT tokens, multi-tenant queries — all high-complexity v2 concerns |
| Migrate to TypeScript/ESM | Full type safety; consistent with client; required for Drizzle schema definitions; enables shared types across monorepo | One-sprint migration cost; module system change requires updating `require()` → `import` throughout |

**Decision:** Migrate to TypeScript + ESM.

**Rationale:**
- Drizzle ORM's schema definitions and query builders are TypeScript-native. Using Drizzle with a JavaScript server means losing all compile-time safety on the most critical layer of the application (multi-tenant data queries).
- Stripe's Node.js SDK ships with comprehensive TypeScript types for all webhook event payloads. Type-safe webhook handlers are materially safer for billing logic.
- JWT payload typing (user ID, org ID, tier) is a security concern — TypeScript interfaces prevent type confusion bugs at compile time.
- v2 introduces the most complex server code in the project's history (auth flows, billing webhooks, tenant isolation). This is exactly the context where TypeScript ROI is highest.
- The client is already TypeScript/ESM. Unifying both sides of the monorepo eliminates the cognitive overhead of switching mental models between the two packages.

**Migration Scope:**
- Convert `/server` `package.json` to `"type": "module"` (ESM)
- Rename `index.js` → `index.ts` and all server files
- Replace all `require()` with `import`
- Replace all `module.exports` with `export`
- Add `tsconfig.json` to `/server` (strict mode, `target: ES2022`, `module: NodeNext`)
- Update server `scripts`: `dev` → `tsx watch index.ts`, `build` → `tsc`, `start` → `node dist/index.js`
- Update Jest config for TypeScript (`ts-jest` or `@swc/jest`)
- This migration is **Story 0** — the first implementation story, before any v2 feature work begins

**Affected Epics:** All server-side epics

---

### Decision 2: Database ORM and Migration Tooling

**Decision: Drizzle ORM + Drizzle Kit**

**Options Considered:**

| ORM | Pros | Cons |
|---|---|---|
| Drizzle ORM | SQL-first (no magic), TypeScript schema definitions, lightweight (<50kb), excellent Hetzner PostgreSQL support, Drizzle Kit for migrations | Smaller ecosystem than Prisma; fewer community examples |
| Prisma | Largest ecosystem, excellent docs, Prisma Migrate well-proven | Heavy abstraction over SQL, larger binary footprint, slower query generation, `@prisma/client` generated code is less transparent for complex multi-tenant queries |
| Kysely | Type-safe query builder, no ORM overhead | No built-in migration system; more manual schema management |

**Decision:** Drizzle ORM.

**Rationale:**
- FunnelShop's multi-tenant query patterns require explicit `org_id` scoping on every query. Drizzle's SQL-first builder makes this scoping visible and verifiable at code review time. Prisma's abstracted query API can obscure whether tenant scoping is correctly applied.
- Drizzle schema definitions are plain TypeScript — schemas are version-controlled, diff-able, and understandable without a Prisma-specific DSL.
- Drizzle Kit provides schema migrations with explicit, reviewable SQL migration files — no migration engine "magic".
- Solo/small team benefits from Drizzle's lightweight footprint and direct PostgreSQL control.

**Implementation:**
```
npm install drizzle-orm pg
npm install -D drizzle-kit @types/pg
```

**Migration workflow:**
```bash
# Generate migration from schema changes
npx drizzle-kit generate

# Apply migrations (dev)
npx drizzle-kit migrate

# Production: migrations run as part of deploy script
```

**Migration files location:** `/server/db/migrations/` — committed to git, reviewed before production deploy

**Affects:** All persistence stories; Story 0 (TypeScript migration) is a prerequisite

---

### Decision 3: Database Schema — Multi-Tenant Design

**Decision: Row-level multi-tenancy with `org_id` on all tenant-scoped tables**

**Schema Overview:**

```sql
-- Core identity
users (id, email, password_hash, display_name, email_verified, created_at, updated_at)
orgs (id, name, tier, stripe_customer_id, stripe_subscription_id, created_at)
org_memberships (id, org_id, user_id, role, created_at)

-- Funnel data (org-scoped)
client_workspaces (id, org_id, name, created_at)  -- Agency only; v2 schema ready, UI deferred to v2.1
funnels (id, org_id, workspace_id NULLABLE, name, canvas_state JSONB, created_at, updated_at)
simulation_results (id, funnel_id, org_id, result_snapshot JSONB, created_at)

-- Billing & waitlist
agency_waitlist (id, email, created_at)

-- Blueprints (system-owned, not org-scoped)
blueprints (id, name, description, industry, canvas_state JSONB, is_active, created_at)
```

**Tenancy rules enforced by architecture:**
- All repository functions accept `orgId` as a required parameter
- Drizzle `where` clauses always include `.where(eq(table.orgId, orgId))`
- No repository function exposes unscoped queries to the service layer
- Cross-tenant queries are architecturally impossible without explicit org context

**JSONB for canvas state:**
- `canvas_state` stores the full React canvas serialisation (components + connections + positions)
- JSONB allows the simulation engine to evolve its internal format without schema migrations
- Indexed on `funnel_id` for fast retrieval; no query filtering needed inside the JSON blob

---

### Decision 4: Authentication Strategy

**Decision: Email/password auth with JWT (httpOnly cookie transport)**

**Options Considered:**

| Approach | Pros | Cons |
|---|---|---|
| JWT in Authorization header | Stateless, simple | Requires frontend JS to manage token; XSS vulnerability if stored in localStorage |
| JWT in httpOnly cookie | XSS-safe; CSRF-protected with SameSite=Strict; stateless server | CSRF token needed for non-GET requests (handled by SameSite=Strict on Hetzner same-origin deployment) |
| Session-based (DB sessions) | Easy revocation | Statefulness conflicts with NFR17 (stateless horizontal scaling) |
| Supabase Auth / Auth0 | Zero auth implementation | US-domiciled services; violates EU-only data requirement |

**Decision:** JWT in httpOnly cookie.

**Implementation:**
- **Access token:** 15-minute expiry, httpOnly, SameSite=Strict, Secure
- **Refresh token:** 30-day expiry, httpOnly, stored in `user_sessions` table for rotation and revocation
- **JWT payload:** `{ userId, orgId, role, tier }` — all entitlement checks derive from this payload
- **Library:** `jsonwebtoken` (Node.js) for signing/verification
- **Password hashing:** `bcrypt` (12 rounds)
- **Email verification:** Time-limited token (24h) sent via Resend; stored in `email_verification_tokens` table
- **Password reset:** Time-limited token (1h) sent via Resend; single-use, invalidated on use

**Auth middleware pattern:**
```typescript
// Applied to all /api/v1/* routes except /auth/register, /auth/login, /auth/verify-email, /auth/reset-password
export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.cookies['access_token']
  if (!token) return res.status(401).json({ error: 'Unauthorized' })

  const payload = verifyJWT(token)
  req.user = payload  // { userId, orgId, role, tier }
  next()
}
```

---

### Decision 5: API Structure

**Decision: REST API with `/api/v1/` prefix; no GraphQL**

**Versioning:** All endpoints prefixed with `/api/v1/`. Breaking changes → `/api/v2/`. The v1 prefix was identified in the PRD as a pre-launch hygiene requirement.

**Route organisation (Express Router):**
```
/api/v1/auth/*         — register, login, logout, verify-email, forgot-password, reset-password
/api/v1/users/me       — profile read/update, account delete
/api/v1/funnels/*      — CRUD, list, duplicate
/api/v1/blueprints/*   — list, get-by-id, get-by-slug (public shareable URL)
/api/v1/simulations/*  — save result, get history
/api/v1/billing/*      — create checkout session, manage subscription, billing portal
/api/v1/webhooks/stripe — Stripe webhook receiver (no auth middleware; signature verification instead)
/api/v1/waitlist       — Agency waitlist email capture
/api/v1/export/pdf/*   — PDF generation (Pro-gated)
```

**Error response contract:**
```typescript
interface ApiError {
  error: string      // human-readable message
  code?: string      // machine-readable code (e.g. 'FUNNEL_LIMIT_REACHED')
  field?: string     // validation errors: which field failed
}
```

**Rate limiting (express-rate-limit):**
- Auth endpoints: 10 req/15min per IP
- API endpoints: 100 req/min per authenticated user
- Stripe webhook: no rate limit (Stripe IPs; signature verification is the guard)

---

### Decision 6: Subscription Tier Enforcement

**Decision: Server-side entitlement check via JWT tier claim; no client-side trust**

**Pattern:**
```typescript
export const requireTier = (minTier: 'free' | 'pro' | 'agency') => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const tierOrder = { free: 0, pro: 1, agency: 2 }
    if (tierOrder[req.user.tier] < tierOrder[minTier]) {
      return res.status(403).json({
        error: 'Upgrade required',
        code: 'UPGRADE_REQUIRED',
        requiredTier: minTier
      })
    }
    next()
  }
}

// Usage
router.post('/funnels', requireAuth, requireTier('free'), createFunnel)
router.post('/export/pdf', requireAuth, requireTier('pro'), exportPDF)
```

**Free tier funnel cap enforcement:**
- On `POST /api/v1/funnels`, before creating: count existing funnels for org where `tier = 'free'`
- If count ≥ 1: return 403 with `code: 'FUNNEL_LIMIT_REACHED'` and upgrade prompt data
- Client renders upgrade modal on this specific error code

---

### Decision 7: Stripe Integration Pattern

**Decision: Stripe Checkout + Customer Portal (hosted); webhook-driven entitlement updates**

**Rationale:** Building a custom payment form requires PCI DSS SAQ-A-EP compliance. Stripe Checkout (hosted) reduces PCI scope to SAQ-A. For a solo/2-person team, this is the only viable approach.

**Flow:**
1. User clicks "Upgrade to Pro" → POST `/api/v1/billing/create-checkout-session`
2. Server creates Stripe Checkout Session with `customer_id` and `price_id`
3. User redirected to Stripe-hosted checkout page
4. On payment success: Stripe sends `checkout.session.completed` webhook
5. Webhook handler updates `orgs.tier` and `orgs.stripe_subscription_id` in DB
6. User redirected to success URL; frontend polls `/api/v1/users/me` to get updated tier
7. JWT refresh triggered to update tier claim in access token

**Webhook idempotency:**
- All handlers check `stripe_event_id` against `processed_stripe_events` table before processing
- Duplicate events → 200 OK with no state change

**Critical events handled:**
- `checkout.session.completed` — activate Pro subscription
- `customer.subscription.updated` — handle plan changes, renewals
- `customer.subscription.deleted` — downgrade to Free, remove entitlements
- `invoice.payment_failed` — flag account, send Resend dunning email

---

### Decision 8: PDF Export Approach

**Decision: Puppeteer (headless Chromium) server-side rendering**

**Options Considered:**

| Approach | Pros | Cons |
|---|---|---|
| Puppeteer (server-side) | Pixel-perfect render matching the React UI | Chromium binary ~170MB; higher memory on Hetzner VPS; cold start on first render |
| `pdfkit` (programmatic) | Lightweight; no browser dependency | Must duplicate all layout logic; diverges from UI visually |
| Client-side `html2canvas` + `jsPDF` | No server dependency | Quality limited by canvas rendering; requires Pro JS in browser |
| React-pdf (`@react-pdf/renderer`) | React-native PDF DSL | Separate component tree; layout effort comparable to programmatic |

**Decision:** Puppeteer — server-side headless Chromium.

**Rationale:** The PDF must match the simulation canvas output exactly, including the funnel diagram. Only headless browser rendering delivers this without maintaining a parallel layout system.

**Implementation:**
- Puppeteer installed as server dependency; Chromium bundled via `puppeteer` (not system Chromium)
- PDF endpoint renders a server-side HTML template populated with simulation data
- Template is a minimal standalone HTML/CSS document (not the React app) for fast render
- Rendered PDF stored temporarily in `/tmp`; streamed to client; deleted after response
- Memory guard: PDF generation runs in a worker-scoped browser instance (one browser per request, closed after use)

---

### Decision 9: Structured Logging

**Decision: Pino**

**Rationale:** Pino is the fastest JSON logger for Node.js. It outputs structured JSON natively (no additional formatter needed), which is the format expected by log aggregation tools. Simpler than Winston for this project's needs.

**Implementation:**
```typescript
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['req.headers.authorization', 'body.password', 'body.password_hash']
})

// Every request log includes: userId, orgId, method, path, status, duration
```

**Log levels in use:**
- `error` — uncaught exceptions, Stripe webhook failures, DB connection errors
- `warn` — auth failures, rate limit hits, payment failures
- `info` — request lifecycle, subscription state changes
- `debug` — query plans, performance timing (dev only)

---

## Implementation Patterns

### Repository Pattern (Data Access Layer)

All database queries are encapsulated in repository functions. No Drizzle query code appears in route handlers or service functions directly.

**Pattern:**
```typescript
// /server/db/repositories/funnels.repository.ts
export const funnelRepository = {
  findAllByOrg: async (orgId: string): Promise<Funnel[]> => {
    return db.select().from(funnels).where(eq(funnels.orgId, orgId))
  },

  findById: async (id: string, orgId: string): Promise<Funnel | null> => {
    // orgId always required — no query without tenant scope
    const result = await db.select().from(funnels)
      .where(and(eq(funnels.id, id), eq(funnels.orgId, orgId)))
    return result[0] ?? null
  },

  create: async (data: NewFunnel): Promise<Funnel> => {
    const result = await db.insert(funnels).values(data).returning()
    return result[0]
  }
}
```

**Rule:** Repository functions always include `orgId` in scope. Functions that don't accept `orgId` are system-level only (blueprints, Stripe events).

---

### Service Layer Pattern

Business logic lives in service functions that compose repository calls, enforce invariants, and trigger side effects (email, analytics).

```typescript
// /server/services/funnels.service.ts
export const funnelsService = {
  createFunnel: async (orgId: string, userId: string, data: CreateFunnelInput): Promise<Funnel> => {
    // Enforce Free tier funnel cap
    const org = await orgRepository.findById(orgId)
    if (org.tier === 'free') {
      const count = await funnelRepository.countByOrg(orgId)
      if (count >= 1) throw new FunnelLimitError()
    }

    const funnel = await funnelRepository.create({ orgId, userId, ...data })

    // PostHog event (non-blocking, fire-and-forget)
    posthog.capture({ distinctId: userId, event: 'funnel_created', properties: { orgId, tier: org.tier } })

    return funnel
  }
}
```

---

### Route Handler Pattern

Route handlers are thin — validate input, call service, return response.

```typescript
// /server/routes/funnels.router.ts
router.post('/', requireAuth, requireTier('free'), async (req: AuthenticatedRequest, res: Response) => {
  const parsed = createFunnelSchema.safeParse(req.body)
  if (!parsed.success) return res.status(400).json({ error: parsed.error.format() })

  try {
    const funnel = await funnelsService.createFunnel(req.user.orgId, req.user.userId, parsed.data)
    return res.status(201).json(funnel)
  } catch (err) {
    if (err instanceof FunnelLimitError) {
      return res.status(403).json({ error: 'Funnel limit reached', code: 'FUNNEL_LIMIT_REACHED' })
    }
    logger.error({ err, userId: req.user.userId }, 'Failed to create funnel')
    return res.status(500).json({ error: 'Internal server error' })
  }
})
```

---

### Input Validation Pattern

**Zod** for all request body validation. Schemas defined adjacent to routes and shared with TypeScript types.

```typescript
import { z } from 'zod'

export const createFunnelSchema = z.object({
  name: z.string().min(1).max(100),
  canvasState: z.object({
    components: z.array(z.unknown()),
    connections: z.array(z.unknown())
  })
})

export type CreateFunnelInput = z.infer<typeof createFunnelSchema>
```

**Dependencies:**
```
npm install zod
```

---

### Error Handling Pattern

**Domain errors** are typed classes thrown by services and caught in route handlers:

```typescript
export class FunnelLimitError extends Error {
  constructor() { super('Funnel limit reached for Free tier') }
}

export class UnauthorizedError extends Error {
  constructor() { super('Unauthorized') }
}
```

**Global error handler** catches any unhandled errors:

```typescript
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  logger.error({ err, path: req.path, method: req.method }, 'Unhandled error')
  Sentry.captureException(err)
  res.status(500).json({ error: 'Internal server error' })
})
```

---

### Frontend State Management Pattern (v2 additions)

The existing v1 pattern (all state in `App.tsx`, passed via props) is preserved for the simulation canvas. v2 adds auth state as a cross-cutting concern.

**Auth state:**
- `AuthContext` (React Context) wraps the app above the router
- Provides `{ user, isLoading, login, logout }` to all components
- Auth state hydrated on app load via `GET /api/v1/users/me` (validates the httpOnly cookie)
- No token stored in localStorage or sessionStorage

**Protected routing:**
```tsx
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth()
  if (isLoading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
```

---

## Project Structure

```
/FunnelShop
├── client/
│   ├── src/
│   │   ├── App.tsx                    # Root — simulation canvas state (unchanged from v1)
│   │   ├── main.tsx
│   │   ├── components/
│   │   │   ├── Canvas.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── ConfigPanel.tsx
│   │   │   ├── auth/                  # NEW: Login, Register, ResetPassword components
│   │   │   ├── billing/               # NEW: UpgradeModal, PricingPage, BillingPortal
│   │   │   └── export/                # NEW: ExportButton, PDF preview
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx        # NEW: user session state
│   │   ├── hooks/
│   │   │   └── useAuth.ts             # NEW: auth context hook
│   │   ├── types/
│   │   │   └── index.ts               # Shared domain types (extended for v2 user/org types)
│   │   └── utils/
│   │       └── calculateMetrics.ts    # Unchanged from v1
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.app.json
│
├── server/
│   ├── index.ts                       # App entry point (migrated from index.js)
│   ├── app.ts                         # Express app setup (separated for testability)
│   ├── tsconfig.json                  # NEW: strict TS config for server
│   ├── db/
│   │   ├── schema.ts                  # Drizzle schema definitions (all tables)
│   │   ├── index.ts                   # DB connection pool
│   │   ├── migrations/                # Drizzle Kit generated SQL migrations
│   │   └── repositories/
│   │       ├── users.repository.ts
│   │       ├── orgs.repository.ts
│   │       ├── funnels.repository.ts
│   │       ├── blueprints.repository.ts
│   │       └── billing.repository.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts         # requireAuth, requireTier
│   │   ├── rateLimit.middleware.ts    # per-route rate limiting
│   │   └── validation.middleware.ts  # request body validation
│   ├── routes/
│   │   ├── auth.router.ts
│   │   ├── users.router.ts
│   │   ├── funnels.router.ts
│   │   ├── blueprints.router.ts
│   │   ├── billing.router.ts
│   │   ├── webhooks.router.ts         # Stripe webhook receiver
│   │   ├── export.router.ts           # PDF export
│   │   └── waitlist.router.ts
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── funnels.service.ts
│   │   ├── billing.service.ts
│   │   ├── email.service.ts           # Resend wrapper
│   │   ├── pdf.service.ts             # Puppeteer PDF generation
│   │   └── analytics.service.ts      # PostHog event emission
│   ├── errors/
│   │   └── domain.errors.ts           # Typed domain error classes
│   ├── lib/
│   │   ├── jwt.ts                     # sign/verify helpers
│   │   ├── logger.ts                  # Pino instance
│   │   └── stripe.ts                  # Stripe SDK instance
│   ├── package.json
│   └── index.test.ts                  # Supertest integration tests (migrated from v1)
│
├── package.json                       # Monorepo root
├── .env.example                       # Extended with v2 vars
└── drizzle.config.ts                  # Drizzle Kit config (root level)
```

---

## Architecture Validation

### NFR Coverage Checklist

| NFR | Architecture Element | Status |
|---|---|---|
| 99.5% uptime | Stateless Express + Hetzner managed PostgreSQL + Sentry alerting | ✅ |
| Simulation <500ms | Simulation stays client-side (no server round-trip) | ✅ |
| Zero cross-tenant leaks | Repository pattern enforces `orgId` on every query | ✅ |
| Rate limiting | express-rate-limit on all routes | ✅ |
| ≥90% server test coverage | Jest + Supertest; repository pattern enables unit testability | ✅ |
| EU-only data | Hetzner Falkenstein for app, DB, PostHog, object storage | ✅ |
| All DB queries parameterised | Drizzle ORM — no raw SQL string interpolation | ✅ |
| Session tokens 30-day expiry | JWT `exp` claim; refresh token in `user_sessions` table | ✅ |
| Stripe webhooks idempotent | `processed_stripe_events` deduplication table | ✅ |
| GDPR deletion cascade <24h | Single DB transaction on account delete | ✅ |

### Security Review

| Threat | Mitigation |
|---|---|
| XSS token theft | httpOnly cookies — JS cannot access tokens |
| CSRF | SameSite=Strict on cookies; same-origin deployment |
| SQL injection | Drizzle parameterised queries; no dynamic SQL |
| Brute force auth | Rate limit: 10 req/15min on auth endpoints |
| Cross-tenant data access | Repository-layer `orgId` scoping; architectural impossibility |
| Stripe webhook replay | Idempotency key deduplication |
| Weak passwords | bcrypt (12 rounds); minimum length enforced by Zod |
| Path traversal | Express serves no static paths with user-supplied segments |

### Implementation Sequence (Story Order Guidance)

1. **Sprint 0:** Server TypeScript migration (Story 0) — prerequisite for all v2 work
2. **Sprint 1:** Database schema + Drizzle setup + user auth (register, login, JWT)
3. **Sprint 2:** Funnel CRUD with persistence + Free tier enforcement
4. **Sprint 3:** Stripe billing (Checkout, webhooks, tier enforcement)
5. **Sprint 4:** Blueprint library + public shareable URLs
6. **Sprint 5:** PDF export (Puppeteer)
7. **Sprint 6:** GDPR compliance (deletion cascade, cookie consent)
8. **Sprint 7:** Agency waitlist + structured logging + Sentry integration

### Cross-Component Dependencies

```
TypeScript Migration (Story 0)
  └── All server-side stories

Drizzle Schema
  ├── User auth (users, orgs, org_memberships tables)
  ├── Funnel CRUD (funnels, simulation_results tables)
  ├── Billing (stripe fields on orgs)
  └── Agency waitlist (agency_waitlist table)

Auth Middleware (requireAuth)
  ├── All protected endpoints
  └── JWT tier claim → Tier enforcement middleware

Stripe Webhooks
  ├── Must be live before any Pro-gated feature ships
  └── Idempotency table (processed_stripe_events)

PDF Export
  └── Requires Pro tier enforcement (billing must be live first)
```

---

## Environment Variables (v2 additions to `.env.example`)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/funnelshop

# Auth
JWT_SECRET=<256-bit random secret>
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=30d

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_PRICE_ID=price_...

# Email (Resend)
RESEND_API_KEY=re_...
RESEND_FROM_EMAIL=noreply@funnelshop.io

# Sentry
SENTRY_DSN=https://...@sentry.io/...

# PostHog
POSTHOG_API_KEY=phc_...
POSTHOG_HOST=https://analytics.funnelshop.io  # self-hosted

# App
APP_URL=https://funnelshop.io
NODE_ENV=production
LOG_LEVEL=info
```

---

_Architecture document complete. All critical decisions are resolved. Implementation begins with Story 0: Server TypeScript Migration._

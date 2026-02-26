---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics']
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/project-context.md
---

# FunnelShop - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for FunnelShop, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: A visitor can register for an account using an email address and password
FR2: A registered user can verify their email address to activate their account
FR3: A registered user can log in and out of their account
FR4: A registered user can reset their password via a link sent to their email
FR5: A registered user can update their account profile (display name, email address)
FR6: A registered user can permanently delete their account and all associated data through the product interface
FR7: A user can create a new funnel simulation
FR8: A user can configure funnel input parameters (advertising budget, CPC or CPM, click-through rate, conversion rate, average order value / ARPU)
FR9: A user can run a simulation to compute output metrics (projected revenue, ROAS, CAC, LTV, payback period, leads generated, conversions)
FR10: A user can view simulation results as a visual funnel breakdown and a key metric summary
FR11: A user can save a named funnel simulation to their workspace
FR12: A user can rename or delete a saved funnel simulation
FR13: A Free user is capped at 1 saved funnel simulation
FR14: A Free user is shown an upgrade prompt when the saved funnel limit is reached
FR15: A user can browse the available blueprint library, filtered by industry or use case
FR16: A user can view a blueprint's description including its industry context and default parameter rationale
FR17: A user can apply a blueprint to a new simulation, pre-populating default parameter values
FR18: A user can customise any blueprint-applied parameter before running the simulation
FR19: A Pro user can share a blueprint via a unique public URL
FR20: An unauthenticated visitor can view a shared blueprint and its default parameters via its public URL
FR21: A user can view their list of saved funnels in their workspace
FR22: A Pro user can save an unlimited number of funnel simulations
FR23: A Free user can upgrade to Pro by entering payment details
FR24: A Pro user can view their current plan, billing cycle, and next payment date
FR25: A Pro user can update their saved payment method
FR26: A Pro user can cancel their subscription
FR27: A user receives an email confirmation for subscription activation and cancellation
FR28: A user can view their billing history
FR29: A Pro user can export a simulation as a PDF report
FR30: A PDF export includes all funnel input parameters, computed output metrics, and a visual funnel diagram
FR31: A visitor can submit their email address to join the Agency tier waitlist on the pricing page
FR32: The operator receives a notification when a new Agency waitlist signup is submitted
FR33: A user receives transactional emails for: email verification, password reset, subscription confirmation, and cancellation confirmation
FR34: A user can manage their cookie and analytics consent preferences
FR35: A user can request permanent deletion of their account and all associated data through a self-serve interface
FR36: A Free user can duplicate an existing saved funnel as a new unsaved simulation

### NonFunctional Requirements

NFR1: Simulation results returned to the user within 2 seconds end-to-end; server-side computation within 500ms at p95
NFR2: Dashboard and workspace views load within 3 seconds on a standard broadband connection
NFR3: Blueprint library renders within 2 seconds of page load
NFR4: PDF export generates and initiates download within 10 seconds
NFR5: All data transmitted over HTTPS (TLS 1.2 minimum)
NFR6: User passwords stored using bcrypt or argon2; never in plaintext
NFR7: Stripe webhook payloads verified via signature on every inbound request
NFR8: All database queries parameterised; no dynamic SQL string construction
NFR9: Session tokens expire after 30 days; refresh tokens rotate on use
NFR10: All repository-layer queries scoped by org_id; cross-tenant data access architecturally impossible without explicit org context
NFR11: Sentry error payloads scrubbed of PII (email addresses, names) before transmission
NFR12: Application targets 99.5% monthly uptime on Hetzner infrastructure
NFR13: Stripe webhook processing includes idempotency handling; duplicate event delivery does not create duplicate subscription state
NFR14: Daily automated database backups with point-in-time recovery capability
NFR15: System handles 1,000 concurrent users without measurable performance degradation at launch
NFR16: All tenant-scoped tables indexed on org_id and user_id; queries remain sub-100ms at 100k+ funnel records
NFR17: Application layer is stateless; horizontal scaling requires no session migration
NFR18: Account deletion cascade completes within 24 hours of user request (target: immediately within single transaction)
NFR19: PostHog session tracking does not initialise until explicit user consent is captured
NFR20: All user data stored and processed exclusively in EU (Hetzner Falkenstein, Germany)
NFR21: Data Processing Agreements with Stripe, Resend, and Sentry executed before first paying user
NFR22: Stripe payment failures surface a clear user-facing error message; no silent failures
NFR23: Resend delivery failures for critical auth emails retried automatically; failures logged in Sentry
NFR24: PostHog SDK failure does not block or degrade any user-facing functionality (fire-and-forget, non-blocking)
NFR25: Sentry SDK failure does not affect application performance or user experience
NFR26: Rate limiting — 60 req/min per authenticated user; 10 req/min per unauthenticated IP

### Additional Requirements

**From Architecture — Technical Prerequisites:**
- Server TypeScript migration (CommonJS → ESM) is Story 0 — prerequisite for ALL v2 server work; no new server files in plain JS after this decision
- Drizzle ORM + Drizzle Kit: schema definitions in TypeScript, explicit reviewable SQL migration files in `/server/db/migrations/`
- Drizzle config at root-level `drizzle.config.ts`

**From Architecture — Multi-Tenancy (Highest-severity implementation concern):**
- Row-level multi-tenancy: every tenant-scoped table carries `org_id` FK
- All repository functions require `orgId` as a mandatory parameter; no unscoped queries exposed to the service layer
- `org_id` and `user_id` indexes on all tenant tables (sub-100ms at 100k+ rows)
- Database schema tables: `users`, `orgs`, `org_memberships`, `client_workspaces` (v2.1 UI, schema day-one), `funnels`, `simulation_results`, `blueprints` (system-scoped), `agency_waitlist`, `processed_stripe_events` (idempotency)

**From Architecture — Auth Implementation Detail:**
- JWT: access token 15-min expiry httpOnly SameSite=Strict Secure cookie; refresh token 30-day expiry stored in `user_sessions` table for rotation + revocation
- JWT payload: `{ userId, orgId, role, tier }` — all entitlement checks derive from this
- bcrypt 12 rounds for password hashing
- `email_verification_tokens` table: 24-hour TTL
- Password reset tokens: 1-hour TTL, single-use, invalidated on use

**From Architecture — API Structure:**
- All endpoints prefixed `/api/v1/`; route modules: auth, users, funnels, blueprints, simulations, billing, webhooks, export, waitlist
- express-rate-limit: 10 req/15min on auth endpoints (per IP); 100 req/min per authenticated user; no rate limit on Stripe webhook route
- Standard error contract: `{ error: string, code?: string, field?: string }`

**From Architecture — Stripe Pattern:**
- Stripe Checkout (hosted) + Customer Portal (no custom PCI scope)
- Webhook-driven entitlement updates: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
- `processed_stripe_events` table for idempotency deduplication

**From Architecture — PDF Export:**
- Puppeteer (headless Chromium bundled via npm); renders standalone HTML/CSS template (not the React app)
- PDF stored in `/tmp`, streamed to client, deleted post-response
- One browser instance per request, closed after use

**From Architecture — Observability:**
- Pino structured logger; every request log includes userId, orgId, method, path, status, duration
- PII redaction: `req.headers.authorization`, `body.password`, `body.password_hash`
- Sentry EU endpoint; PII scrubbed from payloads before transmission

**From Architecture — Code Patterns (Agent Rules):**
- Repository pattern: all Drizzle query code in repository files; NEVER in route handlers or services
- Service layer: business logic, tier enforcement, side-effects (email, analytics events)
- Route handlers: thin — validate (Zod), call service, return response
- Typed domain error classes (`FunnelLimitError`, `UnauthorizedError`, etc.) in `/server/errors/domain.errors.ts`
- Zod schemas for all request body validation; `z.infer<>` for shared TypeScript types
- No barrel `index.ts` re-export files

**From Architecture — Frontend (v2 additions):**
- `AuthContext` (React Context) wraps app above router; provides `{ user, isLoading, login, logout }`
- Auth state hydrated via `GET /api/v1/users/me` on app load (validates httpOnly cookie)
- `ProtectedRoute` wrapper component for authenticated routes
- No token in localStorage/sessionStorage — httpOnly cookie only

**From Project Context — Dev Agent Must-Know:**
- Existing v1 test suite hits in-memory `dataStore` (Map); when PostgreSQL lands, full test strategy must be in place (test containers or pg mock) before writing new server tests against a real DB
- When auth middleware lands, ALL endpoints must be audited and covered in the same story — no partial auth
- Design tokens system: all color/spacing/typography via CSS variables in `tokens.css`; Tailwind for layout only

### FR Coverage Map

FR1: E1 — Registration with email + password
FR2: E1 — Email verification with time-limited token
FR3: E1 — Login/logout with JWT httpOnly cookies
FR4: E1 — Password reset via email token
FR5: E1 — Profile update (display name, email)
FR6: E8 — Permanent account deletion with data cascade
FR7: E3 — Create new funnel simulation (persisted)
FR8: E3 — Configure funnel input parameters
FR9: E3 — Run simulation and compute output metrics
FR10: E3 — View simulation results (visual funnel + metric summary)
FR11: E3 — Save named funnel to workspace
FR12: E3 — Rename or delete a saved funnel
FR13: E3 — Free tier cap: 1 saved funnel enforced server-side
FR14: E3 — Upgrade prompt when Free tier limit reached
FR15: E5 — Browse blueprint library by industry/use case
FR16: E5 — View blueprint description and parameter rationale
FR17: E5 — Apply blueprint to new simulation (pre-populate params)
FR18: E5 — Customise blueprint parameters before running simulation
FR19: E5 — Pro user shares blueprint via unique public URL
FR20: E5 — Unauthenticated visitor views shared blueprint via public URL
FR21: E3 — View list of saved funnels in workspace
FR22: E3 — Pro user: unlimited saved funnels (no cap enforced)
FR23: E4 — Free user upgrades to Pro via Stripe Checkout
FR24: E4 — View current plan, billing cycle, next payment date
FR25: E4 — Update saved payment method via Stripe Customer Portal
FR26: E4 — Cancel subscription via Stripe Customer Portal
FR27: E4 — Email confirmation for subscription activation and cancellation
FR28: E4 — View billing history
FR29: E6 — Pro user exports simulation as PDF report
FR30: E6 — PDF includes all input params, computed metrics, visual funnel diagram
FR31: E7 — Agency waitlist email capture on pricing page
FR32: E7 — Operator notified via email on new Agency waitlist signup
FR33: E1 (email verification + password reset emails) / E4 (subscription confirmation + cancellation emails)
FR34: E8 — Cookie and analytics consent management (PostHog gated)
FR35: E8 — Self-serve account deletion request interface
FR36: E3 — Free user duplicates saved funnel as new unsaved simulation

## Epic List

### Epic 0: Server TypeScript Migration (Prerequisite)
Migrate the `/server` package from CommonJS JavaScript to TypeScript + ESM, establishing the type-safe foundation required for all v2 server-side development. This is a zero-feature-value story that is a hard prerequisite — no v2 server code is written until this epic is complete.
**FRs covered:** None (technical prerequisite — unblocks FR1–FR36 server-side implementation)
**NFRs addressed:** NFR8 (Drizzle parameterised queries require TypeScript schema types), NFR6 (typed bcrypt integration), NFR7 (typed Stripe webhook payloads)

### Epic 1: User Authentication & Account Management
Users can register for an account, verify their email, log in and out securely, reset their password, and update their profile — establishing a complete, secure identity system that gates all user-specific data and Pro features.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR33 (verification + reset transactional emails)
**NFRs addressed:** NFR5 (HTTPS), NFR6 (bcrypt 12 rounds), NFR9 (JWT 15min access / 30d refresh rotation), NFR26 (auth rate limiting 10/15min), NFR23 (Resend retry for critical auth emails)

### Epic 2: PostgreSQL + Drizzle + Multi-Tenant Foundation
Establish the complete database schema, Drizzle ORM configuration, migration tooling, and repository pattern layer — ensuring zero cross-tenant data leaks by architectural design and providing the persistence layer all subsequent epics depend on.
**FRs covered:** None (infrastructure foundation — enables persistent implementation of FR7–FR36)
**NFRs addressed:** NFR8 (parameterised queries via Drizzle), NFR10 (org_id scoping on all tenant tables), NFR16 (org_id + user_id indexes), NFR17 (stateless app layer — session state in DB only)

### Epic 3: Funnel Persistence & Workspace
Authenticated users can save, name, duplicate, rename, and delete their funnel simulations in a personal workspace. Free users are capped at 1 saved funnel with an upgrade prompt at the limit; Pro users save unlimited funnels.
**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR21, FR22, FR36
**NFRs addressed:** NFR1 (simulation <500ms server-side), NFR2 (workspace loads <3s), NFR10 (all funnel queries org_id scoped)

### Epic 4: Subscription Billing
Free users can upgrade to Pro via Stripe Checkout, view and manage their subscription details, update their payment method, cancel, and view billing history. Entitlements activate immediately on payment via webhook; Pro confirmation and cancellation emails are sent via Resend.
**FRs covered:** FR23, FR24, FR25, FR26, FR27, FR28, FR33 (subscription + cancellation emails)
**NFRs addressed:** NFR7 (Stripe webhook signature verification), NFR13 (idempotency via processed_stripe_events table), NFR22 (clear payment failure error messages), NFR21 (DPAs with Stripe executed before first paying user)

### Epic 5: Blueprint Library
All authenticated users can browse, preview, and apply pre-built funnel blueprints to new simulations. Pro users can share blueprints via unique public URLs; unauthenticated visitors can view shared blueprints and their default parameters without an account.
**FRs covered:** FR15, FR16, FR17, FR18, FR19, FR20
**NFRs addressed:** NFR3 (blueprint library renders <2s)

### Epic 6: PDF Export
Pro users can export any saved simulation as a professionally formatted PDF report that includes all input parameters, computed output metrics, and the visual funnel diagram — matching the in-app canvas output pixel-for-pixel.
**FRs covered:** FR29, FR30
**NFRs addressed:** NFR4 (PDF generates and downloads <10s)

### Epic 7: Agency Waitlist
Visitors on the pricing page can submit their email address to join the Agency tier waitlist. The operator receives an immediate email notification via Resend for each new signup, enabling manual follow-up before the Agency tier launches.
**FRs covered:** FR31, FR32
**NFRs addressed:** NFR23 (Resend delivery retry + failure logging)

### Epic 8: GDPR Compliance
Users have full, self-serve control over their data: they can manage cookie and analytics consent (PostHog gated until consent), request permanent account deletion with full cascade across all tables in a single transaction, and view their data rights. Operator has DPAs in place with all EU-data processors.
**FRs covered:** FR6, FR34, FR35
**NFRs addressed:** NFR18 (deletion cascade <24h, target: immediate), NFR19 (PostHog consent-gated init), NFR20 (EU-only data), NFR21 (DPAs with Stripe/Resend/Sentry), NFR11 (Sentry PII scrubbing)

---

## Epic 0: Server TypeScript Migration (Prerequisite)

Migrate the `/server` package from CommonJS JavaScript to TypeScript + ESM, establishing the type-safe foundation required for all v2 server-side development. Hard prerequisite — no v2 server code is written until this epic is complete.

### Story 0.1: Migrate Server to TypeScript + ESM

As a **developer**,
I want the `/server` package migrated from CommonJS JavaScript to TypeScript + ESM,
So that all v2 server code is type-safe and compatible with Drizzle ORM, Stripe SDK types, and JWT payload typing.

**Acceptance Criteria:**

**Given** the v1 server is plain CommonJS JavaScript
**When** the migration is complete
**Then** `/server/package.json` contains `"type": "module"`
**And** all server source files are renamed from `.js` → `.ts`
**And** `/server/tsconfig.json` exists with `strict: true`, `target: "ES2022"`, `module: "NodeNext"`
**And** all `require()` calls replaced with `import`; all `module.exports` replaced with `export`
**And** `scripts.dev` = `tsx watch index.ts`, `scripts.build` = `tsc`, `scripts.start` = `node dist/index.js`
**And** Jest configured for TypeScript via `ts-jest` or `@swc/jest`; `npm test` from root passes with all existing tests green
**And** `npm run build` completes with zero TypeScript errors
**And** `/server/eslint.config.js` updated for TypeScript ESM — `typescript-eslint` rules applied, no `.eslintrc` format used
**And** `tsup.config.ts` scaffolded at `/server/tsup.config.ts` for production builds
**And** `/server/.env.example` updated with `DATABASE_URL=postgresql://user:password@localhost:5432/funnelshop` placeholder (required by E2)
**And** `GET /api/scenarios` (v1 regression endpoint) returns 200 with correct data — no v1 functionality broken
**And** Jest coverage report shows ≥92.5% coverage — no regression from v1 baseline


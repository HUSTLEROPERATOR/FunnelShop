---
stepsCompleted: ['step-01-validate-prerequisites']
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
NFR26: Rate limiting — 60 req/min per authenticated user; 10 req/min for unauthenticated endpoints

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

{{requirements_coverage_map}}

## Epic List

{{epics_list}}


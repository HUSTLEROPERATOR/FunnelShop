---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories', 'step-04-final-validation']
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

| FR | Epic | Description |
|----|------|-------------|
| FR1 | Epic 1 | User registration (email + password) |
| FR2 | Epic 1 | Email verification on registration |
| FR3 | Epic 1 | Login / logout |
| FR4 | Epic 1 | Password reset via email link |
| FR5 | Epic 1 | Update profile (display name, email) |
| FR6 | Epic 1 | Self-serve account deletion |
| FR7 | Epic 3 | Create new funnel simulation |
| FR8 | Epic 3 | Configure funnel input parameters |
| FR9 | Epic 3 | Run simulation, compute output metrics |
| FR10 | Epic 3 | View results (visual funnel + metric summary) |
| FR11 | Epic 3 | Save named funnel to workspace |
| FR12 | Epic 3 | Rename or delete saved funnel |
| FR13 | Epic 3 | Free tier: 1 saved funnel cap enforced |
| FR14 | Epic 3 | Upgrade prompt at free tier limit |
| FR15 | Epic 5 | Browse blueprint library (filtered by industry/use case) |
| FR16 | Epic 5 | View blueprint description |
| FR17 | Epic 5 | Apply blueprint, pre-populate parameters |
| FR18 | Epic 5 | Customise blueprint-applied parameters |
| FR19 | Epic 5 | Pro: share blueprint via unique public URL |
| FR20 | Epic 5 | Unauthenticated visitor: view shared blueprint |
| FR21 | Epic 3 | View saved funnels list in workspace |
| FR22 | Epic 3 | Pro: unlimited saved funnels |
| FR23 | Epic 4 | Upgrade Free → Pro (payment entry) |
| FR24 | Epic 4 | View plan, billing cycle, next payment date |
| FR25 | Epic 4 | Update saved payment method |
| FR26 | Epic 4 | Cancel subscription |
| FR27 | Epic 4 | Subscription activation/cancellation emails |
| FR28 | Epic 4 | View billing history |
| FR29 | Epic 6 | Pro: export simulation as PDF |
| FR30 | Epic 6 | PDF includes inputs, metrics, visual funnel diagram |
| FR31 | Epic 7 | Agency waitlist email submission |
| FR32 | Epic 7 | Operator notification on waitlist signup |
| FR33 | Epic 1 | Transactional auth emails (verify, reset) |
| FR34 | Epic 8 | Cookie and analytics consent management |
| FR35 | Epic 8 | Self-serve GDPR data deletion request |
| FR36 | Epic 3 | Free: duplicate saved funnel as new unsaved simulation |

**Coverage:** 36/36 FRs mapped. Zero gaps.
**Infrastructure epics** (E0, E2) carry no direct FRs — they are foundational prerequisites enabling FR coverage in all subsequent epics.

## Epic List

### Epic 0: Server TypeScript Migration

Migrate the existing Express server codebase from CommonJS to ESM TypeScript, establishing the technical foundation required for all v2 server work. No new server files may be written in plain JS after this epic completes.

**User/system outcome:** All server code is type-safe ESM TypeScript; dev toolchain is consistent; all subsequent epics can be built on a stable foundation without JS/TS interop friction.
**FRs covered:** None directly — technical prerequisite
**NFRs enabled:** NFR5, NFR6, NFR7, NFR8
**Dependencies:** None — this must be completed first

---

### Epic 1: User Authentication & Account Management

Users can register with email and password, verify their email, log in and out, reset their password, update their profile, and permanently delete their account. All auth-related transactional emails are delivered via Resend.

**User/system outcome:** A complete, secure auth system is live. Users have full control over their account lifecycle. No partial auth — when auth middleware lands, ALL endpoints are audited and protected in the same epic.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR33 (email verification + password reset emails)
**NFRs addressed:** NFR5, NFR6, NFR9, NFR23, NFR26
**Dependencies:** E0 (TypeScript server foundation)

---

### Epic 2: PostgreSQL + Drizzle + Multi-Tenant Schema

Production PostgreSQL database is provisioned with all schema tables defined in Drizzle TypeScript, explicit SQL migration files committed to `/server/db/migrations/`, and row-level multi-tenancy enforced via `org_id` FK on every tenant-scoped table. Repository layer enforces org-scoping on all queries.

**User/system outcome:** All data is persisted in a production-grade, multi-tenant database. The data foundation is in place for all subsequent feature epics. Test strategy (test containers or pg mock) is established before any new server tests are written against a real DB.
**FRs covered:** None directly — data infrastructure
**NFRs addressed:** NFR8, NFR10, NFR14, NFR16, NFR17, NFR20
**Schema tables:** `users`, `orgs`, `org_memberships`, `client_workspaces`, `funnels`, `simulation_results`, `blueprints`, `agency_waitlist`, `processed_stripe_events`, `user_sessions`, `email_verification_tokens`
**Dependencies:** E0, E1

---

### Epic 3: Funnel Simulation & Workspace

Users can create, configure, run, view, save, rename, delete, and duplicate funnel simulations. Free tier is capped at 1 saved simulation with an upgrade prompt. Pro tier has unlimited saves. Workspace displays the full list of saved funnels.

**User/system outcome:** The core product loop is fully functional. A user can arrive, run a simulation, see meaningful results (ROAS, CAC, LTV, payback period), and save their work. Tier enforcement is live.
**FRs covered:** FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR14, FR21, FR22, FR36
**NFRs addressed:** NFR1 (simulation < 2s e2e, < 500ms server p95), NFR2 (dashboard < 3s), NFR15, NFR16
**Dependencies:** E0, E1, E2

---

### Epic 4: Subscription & Billing

Free users can upgrade to Pro via Stripe Checkout. Pro users can view plan details, update their payment method via Stripe Customer Portal, cancel their subscription, and view billing history. Subscription lifecycle emails are sent. Stripe webhooks are verified and processed idempotently.

**User/system outcome:** The business model is live. Revenue can be collected. Tier entitlements are driven by webhook events, not client-side state. Payment failures surface clear error messages.
**FRs covered:** FR23, FR24, FR25, FR26, FR27, FR28
**NFRs addressed:** NFR7, NFR13, NFR21, NFR22
**Stripe events handled:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
**Dependencies:** E0, E1, E2

---

### Epic 5: Blueprint Library

Users can browse and filter system blueprints by industry or use case, view a blueprint's description and default parameter rationale, apply a blueprint to a new simulation with pre-populated defaults, and customise any parameter before running. Pro users can share a blueprint via a unique public URL. Unauthenticated visitors can view shared blueprints via that URL.

**User/system outcome:** New users can get started faster with credible defaults. Pro users can share their curated parameter sets. Blueprint discovery is fast (< 2s page load).
**FRs covered:** FR15, FR16, FR17, FR18, FR19, FR20
**NFRs addressed:** NFR3
**Dependencies:** E0, E1, E2, E3

---

### Epic 6: PDF Export

Pro users can export any saved or unsaved simulation as a PDF report. The report includes all input parameters, all computed output metrics, and a visual funnel diagram. Export generates and initiates download within 10 seconds.

**User/system outcome:** Pro users can share simulation results outside the product — with clients, stakeholders, or investors — without requiring them to have a FunnelShop account.
**FRs covered:** FR29, FR30
**NFRs addressed:** NFR4
**Implementation:** Puppeteer renders a standalone HTML/CSS template (not the React app); PDF streamed from `/tmp` and deleted post-response
**Dependencies:** E0, E1, E2, E3, E4 (Pro tier required)

---

### Epic 7: Agency Waitlist

Visitors on the pricing page can submit their email address to join the Agency tier waitlist. The operator receives a notification (email via Resend) for each new signup.

**User/system outcome:** The operator can gauge demand for the Agency tier before building it. Interested leads are captured before the product is ready.
**FRs covered:** FR31, FR32
**Dependencies:** E0, E2 (for `agency_waitlist` table)

---

### Epic 8: GDPR & Privacy Compliance

Users can manage their cookie and analytics consent preferences from within the product. PostHog does not initialise until explicit consent is captured. Users can submit a self-serve account and data deletion request. All data is confirmed stored and processed in the EU only.

**User/system outcome:** FunnelShop is GDPR-compliant and ready for EU users. No analytics tracking occurs without consent. Users have clear, accessible rights over their data.
**FRs covered:** FR34, FR35
**NFRs addressed:** NFR11, NFR18, NFR19, NFR20, NFR21
**Dependencies:** E0, E1, E2

---

## Epic 0: Server TypeScript Migration

Migrate the existing Express server codebase from CommonJS to ESM TypeScript, establishing the technical foundation required for all v2 server work. No new server files may be written in plain JS after this epic completes.

### Story 0.1: TypeScript and ESM Build Toolchain Setup

As a developer,
I want the server build toolchain configured for strict ESM TypeScript,
So that all subsequent v2 server development can be written in type-safe TypeScript with ESM module syntax.

**Acceptance Criteria:**

**Given** the server currently runs as CommonJS JavaScript
**When** the TypeScript and ESM configuration is applied
**Then** `npm run build` compiles server TypeScript to ESM JavaScript without errors
**And** `npm run dev` starts the server using tsx or ts-node with hot reload
**And** `tsconfig.json` is committed with strict mode enabled and ESM module resolution configured
**And** `package.json` contains `"type": "module"` and updated `build`, `dev`, and `test` scripts
**And** the test runner (Jest or Vitest) is configured to handle ESM TypeScript
**And** all existing v1 tests continue to pass after toolchain changes

### Story 0.2: Migrate All Existing Server Modules to ESM TypeScript

As a developer,
I want all existing CommonJS server source files converted to ESM TypeScript modules,
So that the entire server codebase is consistent, type-safe, and no plain `.js` files remain in the server source.

**Acceptance Criteria:**

**Given** the TypeScript and ESM toolchain is configured (Story 0.1 complete)
**When** all existing server `.js` files are migrated
**Then** every file in `/server/` is a `.ts` file using `import`/`export` ESM syntax
**And** no `require()` calls remain in any server source file
**And** all TypeScript strict-mode type errors are resolved
**And** the entire existing v1 test suite passes without modification
**And** the server starts and handles all existing requests correctly after migration
**And** a linting rule or tsconfig setting prevents new `.js` files from being added to `/server/`

---

## Epic 1: User Authentication & Account Management

Users can register with email and password, verify their email, log in and out, reset their password, update their profile, and permanently delete their account. All auth-related transactional emails are delivered via Resend.

### Story 1.1: User Registration with Email Verification Dispatch

As a visitor,
I want to create an account using my email address and password,
So that I can access the FunnelShop platform and have my data persisted.

**Acceptance Criteria:**

**Given** a visitor submits `POST /api/v1/auth/register` with a valid email and password (minimum 8 characters)
**When** the request is processed
**Then** a user record is created with the password hashed using bcrypt at 12 rounds — never stored in plaintext (NFR6)
**And** a personal org record is created and an `org_memberships` record links the user to that org
**And** the Drizzle schema for `users`, `orgs`, `org_memberships`, and `email_verification_tokens` is established in this story as the first DB migration
**And** an `email_verification_tokens` record is inserted with a 24-hour TTL
**And** a verification email is dispatched via Resend to the registered email address (FR33)
**And** the response returns `201 Created` with `{ message: "Verification email sent" }` — no tokens or session issued yet
**And** registering with an already-registered email returns `409 Conflict` with `{ error: "Email already registered" }`
**And** invalid inputs return `400` with Zod field-level validation errors following the standard error contract `{ error, code?, field? }`
**And** Resend delivery failures are logged to Sentry and retried automatically (NFR23); registration succeeds regardless
**And** all data is transmitted over HTTPS (NFR5) and stored in the EU (NFR20)

### Story 1.2: Email Verification

As a registered user,
I want to verify my email address by clicking the link sent to my inbox,
So that my account is activated and I can log in.

**Acceptance Criteria:**

**Given** a user has registered and received a verification email containing a verification link
**When** the user clicks the link (`GET /api/v1/auth/verify-email?token={token}`)
**Then** the user's account is marked `email_verified = true`
**And** the `email_verification_tokens` record is deleted (single-use enforcement)
**And** the response redirects the user to the login page with `?verified=true`
**And** a token that has expired (older than 24 hours) returns `400` with `{ error: "Token expired" }` and a UI option to resend verification
**And** an already-used or non-existent token returns `400` with `{ error: "Invalid or expired token" }`
**And** a user with an unverified email who attempts to log in receives `403` with `{ error: "Email not verified", code: "EMAIL_UNVERIFIED" }`

### Story 1.3: Login, Logout, Token Refresh, and Auth Middleware

As a registered user,
I want to log in and out of my account securely,
So that my session is protected and managed without exposing tokens to client-side JavaScript.

**Acceptance Criteria:**

**Given** a user has a verified account
**When** the user submits `POST /api/v1/auth/login` with valid credentials
**Then** a JWT access token is issued as an `httpOnly`, `SameSite=Strict`, `Secure` cookie with 15-minute expiry
**And** the `user_sessions` table is created as part of this story (migration: `id`, `user_id` FK, `token_hash`, `expires_at`, `created_at`)
**And** a refresh token is stored in the `user_sessions` table with 30-day expiry and returned as a separate `httpOnly` cookie
**And** the JWT payload contains `{ userId, orgId, role, tier }` — all entitlement checks derive from this
**And** login with an unrecognised email or wrong password returns `401 Unauthorized` with a generic message (no user enumeration)
**And** `POST /api/v1/auth/logout` clears both cookies and deletes the session from `user_sessions`
**And** `POST /api/v1/auth/refresh` validates the refresh token, rotates it (new token stored, old invalidated — NFR9), and issues a new access token cookie
**And** an Express `requireAuth` middleware verifies the JWT on every protected route and attaches `req.user = { userId, orgId, role, tier }`
**And** ALL existing API endpoints are reviewed and either protected with `requireAuth` or explicitly marked as public — no partial auth (project-context rule)
**And** `GET /api/v1/users/me` returns the current user's profile and requires auth
**And** rate limiting of 10 req/15min per IP is applied to all `/api/v1/auth/*` endpoints (NFR26)
**And** the frontend `AuthContext` is created, hydrated via `GET /api/v1/users/me` on app load, and exposes `{ user, isLoading, login, logout }`
**And** a `ProtectedRoute` React component wraps all authenticated pages and redirects unauthenticated users to `/login`
**And** no tokens are stored in `localStorage` or `sessionStorage` — httpOnly cookies only

### Story 1.4: Password Reset

As a registered user,
I want to reset my password via a link sent to my email,
So that I can regain access to my account if I forget my password.

**Acceptance Criteria:**

**Given** a user submits `POST /api/v1/auth/forgot-password` with their email address
**When** the request is processed
**Then** a password reset token is generated with a 1-hour TTL and stored (separate from verification tokens)
**And** a password reset email is dispatched via Resend containing the reset link (FR33)
**And** the response always returns `200` with `{ message: "If an account exists, a reset link has been sent" }` — no email enumeration
**And** Resend delivery failures are logged to Sentry; the `200` response is still returned to the user

**Given** a user submits `POST /api/v1/auth/reset-password` with a valid token and new password
**When** the request is processed
**Then** the user's password is updated (bcrypt 12 rounds) and the token is immediately deleted (single-use)
**And** all existing sessions in `user_sessions` for that user are deleted (force re-login on all devices)
**And** an expired token (older than 1 hour) returns `400` with `{ error: "Token expired or invalid" }`
**And** an already-used or non-existent token returns the same `400` error

### Story 1.5: Profile Management

As a registered user,
I want to update my display name and email address,
So that my account reflects my current details.

**Acceptance Criteria:**

**Given** the user is authenticated
**When** the user submits `PATCH /api/v1/users/me` with an updated display name and/or email address
**Then** the display name is updated immediately in the `users` table
**And** if the email address is changed, a new email verification email is dispatched via Resend and `email_verified` is set to `false` until re-verified
**And** the updated user profile is returned in the response
**And** attempting to change email to an address already registered by another user returns `409 Conflict`
**And** `GET /api/v1/users/me` returns the full profile: `{ displayName, email, emailVerified, tier, role }`
**And** an unauthenticated request returns `401 Unauthorized`

### Story 1.6: Account Deletion

As a registered user,
I want to permanently delete my account and all associated data,
So that my personal information is fully removed from the system.

**Acceptance Criteria:**

**Given** the user is authenticated
**When** the user submits `DELETE /api/v1/users/me` with confirmation payload `{ confirm: true }`
**Then** the user's account and ALL associated data are deleted in a single database transaction: user record, org, org_memberships, user_sessions, email_verification_tokens, funnels, simulation_results
**And** the deletion completes immediately within that single transaction (NFR18)
**And** both auth cookies are cleared on success
**And** the response returns `200` with `{ message: "Account deleted" }`
**And** if the user has an active Pro subscription, the subscription is cancelled in Stripe before the deletion transaction begins (or a `409` is returned instructing the user to cancel first)
**And** if the database transaction fails, a full rollback occurs and the user receives a `500` error — no partial deletion

---

## Epic 2: PostgreSQL + Drizzle + Multi-Tenant Schema

Production PostgreSQL database is live with all schema tables defined in Drizzle TypeScript, explicit SQL migration files in `/server/db/migrations/`, and row-level multi-tenancy enforced at the repository layer.

### Story 2.1: Drizzle ORM Formalisation and Auth Schema Migration

As the development team,
I want all auth-related tables formalised in Drizzle ORM with explicit migration files,
So that the database schema is version-controlled, type-safe, and managed consistently via Drizzle Kit.

**Acceptance Criteria:**

**Given** the PostgreSQL instance is running and auth tables exist from E1
**When** Drizzle ORM and Drizzle Kit are installed and configured
**Then** `drizzle.config.ts` exists at the project root pointing to `/server/db/migrations/`
**And** Drizzle TypeScript schema definitions exist for all E1 tables: `users`, `orgs`, `org_memberships`, `user_sessions`, `email_verification_tokens`
**And** `drizzle-kit generate` produces a valid first migration SQL file in `/server/db/migrations/`
**And** `drizzle-kit migrate` applies the migration cleanly
**And** all auth repository code from E1 uses the Drizzle client — no raw pg client remaining in auth code
**And** daily automated database backup is configured (NFR14)
**And** a test strategy document is written (test containers or pg mock approach) before any new DB-dependent server tests are added

### Story 2.2: Business Entity Schema — Funnels and Workspace

As the development team,
I want the `funnels`, `simulation_results`, and `client_workspaces` tables defined in Drizzle schema with full multi-tenancy enforcement,
So that all funnel and workspace data is stored with org-scoped isolation architecturally enforced at the repository layer.

**Acceptance Criteria:**

**Given** the Drizzle configuration and auth schema are in place (Story 2.1 complete)
**When** the business entity schema migration is applied
**Then** the `funnels` table exists with: `id`, `org_id` (FK → orgs), `user_id` (FK → users), `name`, `inputs` (jsonb), `created_at`, `updated_at`
**And** the `simulation_results` table exists with: `id`, `funnel_id` (FK → funnels), `org_id` (FK), `outputs` (jsonb), `created_at`
**And** the `client_workspaces` table exists with: `id`, `org_id` (FK), `name`, `created_at`
**And** composite indexes on `(org_id, user_id)` are created on `funnels` and `simulation_results` — queries remain sub-100ms at 100k+ rows (NFR16)
**And** all repository functions for funnels require `orgId` as a mandatory parameter — no unscoped query signatures exposed to the service layer (NFR10)
**And** a migration file is committed to `/server/db/migrations/`
**And** cross-tenant data access is architecturally impossible via the repository interface (no escape hatch)

### Story 2.3: Supporting Tables Schema — Blueprints, Waitlist, and Stripe Idempotency

As the development team,
I want the `blueprints`, `agency_waitlist`, and `processed_stripe_events` tables defined in Drizzle schema,
So that the blueprint library, agency waitlist, and Stripe webhook idempotency are fully supported by the data layer before those features are built.

**Acceptance Criteria:**

**Given** the Drizzle configuration and prior schema migrations are in place
**When** the supporting tables migration is applied
**Then** the `blueprints` table exists with: `id`, `name`, `industry`, `use_case`, `description`, `default_inputs` (jsonb), `is_system` (bool), `share_token` (nullable, unique), `org_id` (nullable FK — null for system blueprints), `created_at`
**And** the `agency_waitlist` table exists with: `id`, `email` (unique), `created_at`
**And** the `processed_stripe_events` table exists with: `id` (Stripe event ID as primary key), `processed_at`
**And** a unique constraint on `agency_waitlist.email` prevents duplicate insertions
**And** seed data creates at minimum 3 system blueprints (`is_system = true`) covering different industries with realistic `default_inputs`
**And** a migration file is committed to `/server/db/migrations/`

---

## Epic 3: Funnel Simulation & Workspace

Users can create, configure, run, view, save, rename, delete, and duplicate funnel simulations. Free tier is capped at 1 saved simulation with an upgrade prompt. Pro tier has unlimited saves.

### Story 3.1: Funnel Simulation Engine — Compute and Display Results

As a logged-in user,
I want to enter funnel parameters and run a simulation to see projected revenue metrics,
So that I can evaluate the profitability of my advertising campaign.

**Acceptance Criteria:**

**Given** the user is authenticated and on the simulation page
**When** the user enters funnel inputs (advertising budget, CPC or CPM, click-through rate, conversion rate, average order value / ARPU) and submits
**Then** `POST /api/v1/simulations/run` accepts the inputs and returns computed metrics within 500ms at p95 server-side (NFR1)
**And** the full end-to-end response (including UI render) completes within 2 seconds (NFR1)
**And** computed outputs include: leads generated, conversions, projected revenue, ROAS, CAC, LTV, and payback period
**And** the frontend displays results as a visual funnel breakdown (each stage showing counts and conversion percentages) and a key metrics summary panel
**And** simulation results are NOT persisted at this point — this endpoint is stateless (saving is Story 3.2)
**And** invalid inputs (negative budget, rate > 100%, missing required fields) return `400` with Zod field-level validation errors
**And** the simulation UI is accessible within 3 seconds of page load (NFR2)

### Story 3.2: Save, Rename, and Delete Funnel Simulations

As a logged-in user,
I want to save my simulation with a name, rename it, and delete simulations I no longer need,
So that I can organise and revisit my work over time.

**Acceptance Criteria:**

**Given** the user is authenticated and has run a simulation
**When** the user clicks "Save" and provides a name
**Then** `POST /api/v1/funnels` persists the funnel inputs and the latest simulation outputs, scoped to `org_id` and `user_id`
**And** the saved funnel appears immediately in the workspace list

**Given** the user has a saved funnel
**When** the user renames it via `PATCH /api/v1/funnels/:id`
**Then** the funnel name is updated and the response returns the updated funnel record

**When** the user deletes it via `DELETE /api/v1/funnels/:id`
**Then** the funnel and all associated `simulation_results` records are deleted
**And** all funnel operations require `org_id` scoping — attempting to access another org's funnel returns `403 Forbidden`

### Story 3.3: Free Tier Cap and Upgrade Prompt

As a Free-tier user,
I want to see a clear upgrade prompt when I reach my saved funnel limit,
So that I understand my options and can choose to upgrade to Pro.

**Acceptance Criteria:**

**Given** a Free-tier user already has 1 saved funnel (the maximum)
**When** the user attempts to save a new simulation
**Then** an upgrade prompt modal is displayed before the save request is made
**And** the modal states the Free limit (1 simulation), the Pro benefit (unlimited), and a CTA linking to the upgrade flow
**And** the backend enforces the cap independently: `POST /api/v1/funnels` for a Free user with ≥ 1 saved funnel returns `403` with `{ error: "Funnel limit reached", code: "FUNNEL_LIMIT_EXCEEDED" }` (using the `FunnelLimitError` domain error class)
**And** a Pro-tier user's save requests are never blocked regardless of saved funnel count (NFR22 / FR22)
**And** the tier check derives from the JWT payload `{ tier }` — no additional DB lookup required for the check itself

### Story 3.4: Workspace — View and Load Saved Funnels

As a logged-in user,
I want to view all my saved simulations in one place and reload any of them,
So that I can continue working on past simulations without re-entering parameters.

**Acceptance Criteria:**

**Given** the user is authenticated
**When** the user navigates to their workspace
**Then** `GET /api/v1/funnels` returns all saved funnels for the user's org, ordered by most recently updated
**And** each funnel card displays: name, key metrics (ROAS, projected revenue), and last updated date
**And** the workspace view loads within 3 seconds on a standard broadband connection (NFR2)
**And** clicking a funnel card loads its input parameters and last simulation result into the simulation UI without a full page reload
**And** an empty workspace shows a "Create your first simulation" empty state with a CTA
**And** the `GET /api/v1/funnels` endpoint is org-scoped — users cannot retrieve funnels belonging to other orgs

### Story 3.5: Duplicate Funnel as New Unsaved Simulation

As a Free-tier user,
I want to duplicate an existing saved funnel as a new unsaved simulation,
So that I can explore parameter variations without consuming my saved funnel limit.

**Acceptance Criteria:**

**Given** the user is authenticated and has at least one saved funnel
**When** the user selects "Duplicate" on a saved funnel
**Then** the funnel's input parameters are loaded into the simulation UI as an unsaved draft — no new database record is created
**And** the simulation is automatically run with the duplicated inputs so results are displayed immediately
**And** the user can modify any parameter and re-run freely
**And** saving the duplicate follows the standard save flow (Story 3.2), subject to tier cap enforcement (Story 3.3)
**And** Pro users can also duplicate funnels using the same behaviour, saving freely without cap

---

## Epic 4: Subscription & Billing

Free users can upgrade to Pro via Stripe Checkout. Pro users can view plan details, update payment method, cancel, and view billing history. Webhook events drive all tier changes idempotently.

### Story 4.1: Upgrade to Pro via Stripe Checkout

As a Free-tier user,
I want to upgrade to Pro by entering my payment details through a secure checkout,
So that I can unlock unlimited saved funnels and Pro features.

**Acceptance Criteria:**

**Given** an authenticated Free-tier user
**When** the user clicks "Upgrade to Pro" and proceeds
**Then** `POST /api/v1/billing/checkout` creates a Stripe Checkout Session and returns a redirect URL
**And** the user is redirected to the Stripe-hosted Checkout page (no custom PCI scope)
**And** on successful payment, Stripe sends a `checkout.session.completed` webhook to `/api/v1/webhooks/stripe`
**And** the webhook handler verifies the Stripe signature on every inbound request (NFR7)
**And** the handler checks `processed_stripe_events` for the event ID before processing (idempotency — NFR13)
**And** if not already processed, the user's `tier` is updated to `pro` in the `users` table and the event ID is inserted into `processed_stripe_events`
**And** a subscription confirmation email is dispatched via Resend (FR27, FR33)
**And** Stripe payment failures surface a clear user-facing error message — no silent failures (NFR22)
**And** the user is redirected back to the app with a success message after checkout completes

### Story 4.2: Billing Portal — View Plan and Manage Payment Method

As a Pro-tier user,
I want to view my current plan details and manage my payment method,
So that I have full visibility and control over my billing.

**Acceptance Criteria:**

**Given** an authenticated Pro-tier user
**When** the user navigates to the billing settings page
**Then** `GET /api/v1/billing/subscription` returns their current plan, billing cycle, and next payment date (retrieved from the Stripe API)
**And** the page displays: plan name, billing cycle (monthly/annual), next payment date, and last 4 digits of the saved payment method
**And** a "Manage Billing" button triggers `POST /api/v1/billing/portal` which returns a Stripe Customer Portal session URL
**And** the user is redirected to the Stripe Customer Portal where they can update their payment method (FR25)
**And** the billing page renders within 3 seconds

### Story 4.3: Subscription Cancellation and Webhook Lifecycle Handling

As a Pro-tier user,
I want to cancel my subscription,
So that I am not billed again after my current billing period ends.

**Acceptance Criteria:**

**Given** a Pro-tier user cancels via the Stripe Customer Portal (Story 4.2)
**When** Stripe sends `customer.subscription.deleted` to the webhook endpoint
**Then** the webhook is signature-verified, recorded in `processed_stripe_events` (idempotent), and the user's tier is downgraded to `free`
**And** a cancellation confirmation email is dispatched via Resend (FR27)
**And** `customer.subscription.updated` webhooks update subscription metadata (plan changes, renewal dates) idempotently
**And** `invoice.payment_failed` webhooks log the failure and trigger a user notification email but do NOT immediately downgrade the user (Stripe manages the grace period)
**And** duplicate webhook delivery for any event does not produce duplicate state changes (NFR13)
**And** after downgrade, the user is subject to the Free tier cap (1 saved funnel); existing funnels above the limit are retained but saving new ones is blocked

### Story 4.4: Billing History

As a Pro-tier user,
I want to view my billing history,
So that I can track my payments and access invoices.

**Acceptance Criteria:**

**Given** an authenticated user who has had a Pro subscription (current or past)
**When** the user views the billing history section
**Then** `GET /api/v1/billing/invoices` returns a paginated list of invoices retrieved from the Stripe API
**And** each invoice entry shows: date, amount charged, payment status (paid / failed), and a link to the Stripe-hosted invoice PDF
**And** billing history is accessible even after the subscription has been cancelled (historical record preserved)
**And** a Free-tier user with no prior Pro subscription sees an empty billing history (not an error)

---

## Epic 5: Blueprint Library

Users can browse blueprints, view descriptions, apply blueprints to new simulations, and customise parameters. Pro users can share blueprints via public URL.

### Story 5.1: Browse and View Blueprints

As a logged-in user,
I want to browse available blueprints filtered by industry or use case,
So that I can quickly find a relevant starting point for my funnel simulation.

**Acceptance Criteria:**

**Given** the user is on the blueprint library page
**When** the page loads
**Then** `GET /api/v1/blueprints` returns all system blueprints and renders within 2 seconds (NFR3)
**And** blueprints can be filtered using `?industry=` and `?use_case=` query parameters
**And** each blueprint card displays: name, industry tag, use case tag, and a brief description
**And** clicking a blueprint opens a detail view showing the full description, industry context, and the rationale for each default parameter value (FR16)
**And** the blueprint list is accessible to all authenticated users (Free and Pro)

### Story 5.2: Apply Blueprint to Simulation

As a logged-in user,
I want to apply a blueprint to a new simulation with pre-populated default parameters,
So that I can start with industry-relevant defaults rather than blank fields.

**Acceptance Criteria:**

**Given** the user is viewing a blueprint detail page
**When** the user clicks "Apply Blueprint"
**Then** a new simulation is opened with all input parameters pre-populated from the blueprint's `default_inputs`
**And** `POST /api/v1/simulations/run` is automatically triggered with the default inputs so results are displayed immediately
**And** every pre-populated parameter is editable — the user can modify any value and re-run (FR18)
**And** applying a blueprint creates an unsaved draft; saving follows the standard Story 3.2 flow subject to tier enforcement

### Story 5.3: Pro Blueprint Sharing via Public URL

As a Pro-tier user,
I want to share a blueprint via a unique public URL,
So that colleagues or prospects can view my curated parameter set without needing a FunnelShop account.

**Acceptance Criteria:**

**Given** a Pro-tier user has a saved funnel simulation
**When** the user clicks "Share as Blueprint"
**Then** `POST /api/v1/blueprints` creates a blueprint record with `is_system = false` and a unique `share_token`, scoped to the user's org
**And** a public share URL is returned (e.g., `/blueprints/share/{shareToken}`) and is copyable from the UI
**And** a Free-tier user attempting to share receives `403` with `{ error: "Pro feature", code: "UPGRADE_REQUIRED" }` and an upgrade prompt

**Given** an unauthenticated visitor opens the public share URL
**When** their browser requests `GET /api/v1/blueprints/share/{shareToken}`
**Then** the endpoint returns the blueprint name, description, and default input parameters without requiring authentication (FR20)
**And** the visitor sees a read-only view with a CTA to sign up and apply the blueprint

---

## Epic 6: PDF Export

Pro users can export any simulation as a PDF report containing all inputs, computed metrics, and a visual funnel diagram.

### Story 6.1: PDF Export of Simulation Report

As a Pro-tier user,
I want to export any simulation as a PDF report,
So that I can share results with clients or stakeholders who don't have a FunnelShop account.

**Acceptance Criteria:**

**Given** a Pro-tier user is viewing a simulation (saved or unsaved)
**When** the user clicks "Export PDF"
**Then** `POST /api/v1/export/pdf` receives the funnel inputs and simulation outputs, generates a PDF using Puppeteer (headless Chromium bundled via npm), and streams it to the client
**And** the PDF is generated and download initiated within 10 seconds (NFR4)
**And** the exported PDF includes: all labelled input parameters with their values, all computed output metrics (revenue, ROAS, CAC, LTV, payback period, leads, conversions), and a visual funnel diagram
**And** the PDF is rendered from a standalone HTML/CSS template — not the React application
**And** the PDF file is stored in `/tmp`, streamed to the client as `application/pdf` with appropriate `Content-Disposition` headers, and deleted from disk after the response is sent
**And** one Puppeteer browser instance is opened per request and closed immediately after use
**And** a Free-tier user attempting to export receives `403` with `{ error: "Pro feature", code: "UPGRADE_REQUIRED" }` and an upgrade prompt in the UI

---

## Epic 7: Agency Waitlist

Visitors can submit their email to join the Agency tier waitlist; the operator receives a notification per signup.

### Story 7.1: Agency Tier Waitlist Signup and Operator Notification

As a visitor interested in the Agency tier,
I want to submit my email address to join the waitlist from the pricing page,
So that I am notified when the Agency tier becomes available.

**Acceptance Criteria:**

**Given** a visitor is on the pricing page (no authentication required)
**When** the visitor enters their email and submits the waitlist form
**Then** `POST /api/v1/waitlist/agency` validates the email format and inserts a record into `agency_waitlist`
**And** the response returns `201 Created` with `{ message: "You're on the list!" }`
**And** a duplicate email submission returns `200` with the same success message — the unique constraint prevents a second insert (idempotent, no error shown to user)
**And** the operator receives a notification email via Resend containing the submitted email address and submission timestamp (FR32)
**And** Resend delivery failure for the operator notification is logged to Sentry but does NOT fail the user-facing `201` response
**And** the endpoint is accessible to unauthenticated visitors

---

## Epic 8: GDPR & Privacy Compliance

Users can manage analytics consent preferences. PostHog only initialises after explicit consent. Users can submit a self-serve data deletion request.

### Story 8.1: Cookie and Analytics Consent Management

As a user,
I want to manage my cookie and analytics consent preferences,
So that I have control over my personal data and the platform respects my privacy choices.

**Acceptance Criteria:**

**Given** a user visits FunnelShop for the first time (or has no stored consent)
**When** the consent banner is displayed
**Then** PostHog analytics does NOT initialise until the user explicitly accepts analytics cookies (NFR19)
**And** the user can accept all, reject all, or customise individual consent preferences (analytics vs. necessary)
**And** consent preferences are persisted in a cookie and, for authenticated users, in the `users` table
**And** `GET /api/v1/users/me/consent` returns the user's current consent state
**And** `PATCH /api/v1/users/me/consent` updates stored consent preferences
**And** on subsequent visits, PostHog is initialised only if analytics consent was previously granted
**And** PostHog SDK failure does not block or degrade any user-facing functionality — fire-and-forget, non-blocking (NFR24)

### Story 8.2: Self-Serve GDPR Data Deletion Request

As a user,
I want to submit a self-serve request to permanently delete my account and all associated data,
So that I can exercise my right to erasure under GDPR.

**Acceptance Criteria:**

**Given** the user is authenticated and on the privacy settings page
**When** the user confirms and submits a data deletion request via `POST /api/v1/users/me/deletion-request`
**Then** the request triggers immediate account and data deletion using the same cascade as Story 1.6 (`DELETE /api/v1/users/me`)
**And** the deletion cascade completes within a single database transaction — target immediate (NFR18)
**And** all user data is removed: profile, org, org_memberships, funnels, simulation_results, user_sessions, email_verification_tokens, consent records
**And** the user receives confirmation that their data has been deleted
**And** all user data is confirmed to be stored and processed exclusively in the EU — Hetzner Falkenstein, Germany (NFR20)
**And** Data Processing Agreements with Stripe, Resend, and Sentry are documented as a prerequisite acceptance condition for this story to be signed off
**And** Sentry error payloads are confirmed to be scrubbed of PII (email addresses, names) before transmission (NFR11)

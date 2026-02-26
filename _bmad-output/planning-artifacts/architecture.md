---
stepsCompleted: [1, 2]
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

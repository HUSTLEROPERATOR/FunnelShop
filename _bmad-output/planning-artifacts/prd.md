---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional']
inputDocuments:
  - README.md
  - IMPROVEMENTS.md
  - GEMINI.md
  - ANALISI-COMPLETA-IT.md
briefCount: 0
researchCount: 0
brainstormingCount: 0
projectDocsCount: 4
workflowType: 'prd'
classification:
  projectType: saas_b2b
  domain: martech
  complexity: low
  projectContext: brownfield
  monetization: subscription_tiers
  tiers:
    - name: Free
      price: 0
      notes: 1 funnel, no persistence, no export (current state)
    - name: Pro
      price: 29_eur_mo
      notes: unlimited funnels, persistence, PDF export, all blueprints
    - name: Agency
      price: 99_eur_mo
      notes: multi-client workspaces, white-label, API access
  multiTenancy: day-one
  primaryBuyer: SMBs running digital marketing funnels (restaurants, retail, services, agencies)
---

# Product Requirements Document - FunnelShop

**Author:** Root
**Date:** 2026-02-25

## Executive Summary

FunnelShop is a B2B SaaS funnel planning and simulation platform for SMBs and digital marketing agencies. It enables users to visually design marketing funnels and simulate projected ROI — leads, conversions, bookings, and revenue — before committing ad spend. The core value proposition: **structured marketing reasoning for businesses that currently rely on intuition**.

The v1 codebase delivers a working drag-and-drop funnel builder with a live simulation engine, blueprint library, and full CRUD API — validated with 92.5% test coverage, zero persistence, and zero authentication. v2 adds the commercial layer: multi-tenant persistence, user auth, subscription billing, and agency workspace management.

**Target users:**
- **SMB owners** (restaurants, retail, local services) who allocate marketing budget without a structured planning process
- **Digital marketing agencies** who build and present funnel strategies for 10–20 SMB clients and need a professional backstage tool
- **Freelance marketers** positioning themselves as data-driven strategists

**Problem:** SMBs do not model their marketing funnels before spending. The de-facto "tool" is a gut feeling plus informal advice. There is no lightweight, affordable instrument for pre-spend ROI simulation at the SMB level.

**Monetization:** Three subscription tiers — Free (1 funnel, current capability), Pro €29/mo (unlimited funnels, persistence, PDF export, full blueprint library), Agency €99/mo (multi-client workspaces, white-label, API access). Multi-tenancy is a day-one architectural requirement.

### What Makes This Special

The real differentiator is not the funnel builder — it is the **simulation engine**. Competitors (ClickFunnels, Leadpages) are funnel *execution* tools; they help you run funnels after the strategy is set. FunnelShop operates one step earlier: it is the **planning instrument** that tells you whether your funnel strategy will generate positive ROI before you spend a euro.

The "aha moment" is watching projected metrics update in real time as you configure funnel components — the invisible becomes visible. For an SMB owner who has never modelled a campaign, this is a fundamentally new capability, not an incremental improvement on something they already do.

For agencies, FunnelShop is a client-facing **credibility tool**: they walk into a pitch showing simulated ROI projections built on the client's actual parameters, not generic benchmarks. The Agency tier is designed around this use case — multi-client workspaces, not white-label resale.

## Project Classification

| Attribute | Value |
|---|---|
| Project Type | SaaS B2B |
| Domain | Martech / Growth Tools |
| Complexity | Low (no regulatory requirements) |
| Project Context | Brownfield — v1 simulation engine validated, adding commercial layer |
| Architecture Constraint | Multi-tenancy day-one |

## Success Criteria

### User Success

- **Activation:** User completes first simulation run within 5 minutes of signup. No onboarding wizard, no required tutorial — land on canvas, drag components, hit Simulate. Time-to-first-simulation is the activation metric.
- **Retention signal:** Pro subscriber returns to build or modify a funnel within 7 days of initial activation.
- **Value realisation:** Pro subscriber exports at least one PDF report within first 30 days (indicates funnel used in a real business context, not just trial).
- **Agency activation:** Agency account has ≥3 client workspaces populated with simulations within 14 days of signup.

### Business Success

| Milestone | Target | Key Metric |
|---|---|---|
| Month 3 | €500 MRR | 30 paying users (Free→Pro conversions) |
| Month 6 | €2,000 MRR | 3 Agency accounts active |
| Month 12 | €5,000 MRR | 150 paying users, monthly churn < 5% |

**North-star metric:** Monthly Recurring Revenue (MRR). Secondary: Free-to-Pro conversion rate (target ≥8% of active Free users).

### Technical Success

- **Availability:** 99.5% uptime (protects paid subscriber trust; data loss on a paid plan is a cancellation trigger)
- **Performance:** Simulation recalculation < 500ms on funnels with ≤20 components (maintains the real-time "watching metrics update" aha moment)
- **Security:** Rate limiting on all authenticated endpoints shipped with v2 launch — multi-tenant without rate limiting is a day-one liability
- **Data integrity:** Zero cross-tenant data leaks — user A cannot access user B's funnels under any condition
- **Test coverage:** Maintain ≥90% server-side coverage through v2 (current baseline: 92.5%)

### Measurable Outcomes

- Time-to-first-simulation ≤ 5 minutes from account creation
- Free-to-Pro conversion ≥ 8% of monthly active Free users
- MRR: €500 @ M3 → €2,000 @ M6 → €5,000 @ M12
- Monthly churn < 5% at 12 months
- Simulation response time < 500ms (p95)
- Zero critical security incidents in first 12 months

## Product Scope

### MVP — Minimum Viable Product

The v2 MVP adds the commercial layer to the validated v1 simulation engine. Everything required to charge money and retain paying customers:

- **Multi-tenant user authentication** — registration, login, JWT sessions, password reset
- **Persistent funnel storage** — PostgreSQL-backed CRUD replacing in-memory store; funnels survive browser refresh and belong to a user
- **Subscription billing** — Stripe integration; Free, Pro, and Agency tier enforcement; upgrade/downgrade flows
- **Rate limiting** — per-user and per-IP limits on all API endpoints (shipped with auth, not after)
- **Pro tier features** — unlimited funnels per user, full blueprint library access, PDF export
- **Agency tier features** — multi-client workspace management (create/switch/manage client accounts from one login)
- **Pre-launch hygiene** — resolve npm moderate vulnerabilities, structured logging (Winston/Pino), API versioning at `/api/v1/`

### Growth Features (Post-MVP)

Competitive enhancements once paying users are retained:

- **White-label export** — agency-branded PDF reports (Agency tier upsell)
- **Public API** — REST API for Agency tier; enables integrations with agency reporting tools
- **Advanced simulation** — component interdependencies, multi-path funnels, A/B scenario comparison
- **Blueprint marketplace** — user-submitted blueprints, industry-specific packs (restaurant, e-commerce, SaaS)
- **Collaboration** — share funnel view-only links; comment on components
- **Export formats** — JSON, CSV data export alongside PDF

### Vision (Future)

The long-term product trajectory if the core thesis is validated:

- **Optimisation engine** — auto-suggest funnel parameter changes to maximise projected ROI
- **Real data integration** — connect to Google Ads, Meta Ads to seed simulation with actual CPCs and conversion rates
- **Real-time collaboration** — multi-user simultaneous funnel editing (Google Docs model)
- **Predictive benchmarks** — industry-average conversion rates by sector as simulation starting points
- **Mobile app** — lightweight simulation viewer for SMB owner client meetings

## User Journeys

### Persona 1: Marco — SMB Owner (Free → Pro)

**Profile:** Marco owns a mid-size restaurant in Milan. He spends €800/month on Instagram ads. He has never modelled a marketing campaign in his life. His analytics strategy is: boost the post, check how many people called.

---

**Journey 1A: First Simulation (Activation — Free Tier)**

*Opening Scene:* It's Monday morning. Marco checks his bank statement and sees another €800 debit to Meta. He got 12 bookings last month. He has no idea if those came from the ad or from regulars who would have booked anyway. He types "marketing ROI calculator for restaurant" into Google. He finds FunnelShop.

*Rising Action:* He lands on the canvas. No onboarding wizard. He sees component blocks in the sidebar — "Paid Ad", "Landing Page", "Booking Form". He drags three onto the canvas, connects them left to right. A configuration panel appears. He enters: CPC €0.80, monthly budget €800, landing page conversion 4%, booking conversion 12%. The numbers he actually knows from his Meta dashboard.

*Climax:* He hits Simulate. The right panel fills with numbers: 1,000 impressions, 40 landing page visits, 5 bookings projected. His eyes go to the ROI line: –€640. He stares at it. Then he drags the booking conversion slider from 12% to 18% — just to see — and the ROI flips to +€120. He didn't know that moving one number could change everything. He's never seen his funnel as a system before.

*Resolution:* He saves the funnel. Browser refresh — it's gone. (He's on the Free tier with no persistence.) He upgrades to Pro that afternoon. He exports a PDF of the simulation and shows it to his wife. "This is why we need to fix the booking form." He hasn't changed his ad spend yet. But for the first time he knows *where* the problem is.

**Capabilities revealed:** Auth/signup, drag-drop canvas, component configuration, simulation engine, Free tier 1-funnel limit, upgrade prompt, Pro persistence, PDF export.

---

**Journey 1B: Free Tier Limit (Edge Case — Upgrade Trigger)**

*Scene:* Marco is on the Free tier, two weeks in. He's already used his one funnel slot for the restaurant. A friend with a retail shop asks him to model her funnel too. He opens FunnelShop to create a second funnel. A modal appears: "You've reached the Free tier limit of 1 funnel. Upgrade to Pro for unlimited funnels."

*Decision point:* Marco has already seen ROI from his own funnel work. The upgrade prompt arrives at the moment of highest motivation — he wants to help someone else. He upgrades. The new funnel is created immediately.

**Capabilities revealed:** Tier enforcement, upgrade modal with clear value framing, seamless upgrade flow, immediate feature unlock post-payment.

---

### Persona 2: Sarah — Agency Principal / Account Manager (Agency Tier)

**Profile:** Sarah runs a 4-person digital marketing agency. She manages 14 SMB clients — restaurants, beauty salons, a gym, two e-commerce stores. She wins new clients by presenting "data-driven campaign strategies." Until now, her data was a competitor benchmark spreadsheet she built in 2022.

---

**Journey 2A: Agency Setup (Onboarding — Setup Mode)**

*Opening Scene:* Sarah has been on FunnelShop's Pro tier for 3 weeks. She's been using it solo to build client proposals. The Agency tier with multi-client workspaces goes live. She upgrades that same day.

*Rising Action:* She lands on an Agency dashboard — a workspace switcher she hasn't seen before. She creates her first client workspace: "Bella Pasta — Milano". Loads the Restaurant blueprint. Customises the parameters to Bella Pasta's actual numbers from their Meta account: CPC €0.65, 5% landing page conversion, 9% booking conversion. Runs simulation. Projected ROI: +€380/month. She creates two more workspaces for other clients. Takes 25 minutes total.

*Climax:* She opens the Bella Pasta workspace the morning of the client meeting. Exports the PDF. The report shows her agency's name in the header (white-label, post-MVP). She presents it across the table: "This is your current funnel modelled on your actual numbers. If we raise the landing page conversion by 3 points — here's what happens to your ROI." The client signs a 3-month contract.

*Resolution:* Sarah now has FunnelShop open in a tab at all times. It has become the artefact that justifies her agency's strategy fees. She refers two other agency owners.

**Capabilities revealed:** Agency tier workspace management, client workspace creation/switching, blueprint library, parameter customisation, simulation, PDF export, workspace isolation (client A cannot see client B).

---

**Journey 2B: Daily Work Mode (Returning User — Work Mode)**

*Scene:* Sarah opens FunnelShop at 9am, switches to her "Green Gym — Roma" workspace. The client called yesterday — their Facebook ad costs increased. She opens the existing funnel, updates the CPC from €0.90 to €1.40, hits Simulate. ROI drops from +€200 to –€90. She adjusts the monthly budget up and tweaks the email sequence conversion rate. Finds a configuration that returns positive ROI at the new CPC. Sends the client a revised PDF before 10am.

**Capabilities revealed:** Persistent funnel state across sessions, quick re-simulation on parameter changes, PDF re-export, workspace context retention.

---

### Persona 3: Internal SaaS Operator

**Profile:** The platform operator (initially the founder). Monitors system health, manages billing issues, investigates incidents, handles edge cases.

---

**Journey 3A: Incident Investigation**

*Scene:* A Pro subscriber emails support: "My funnels disappeared after I upgraded." The operator checks server logs — a Stripe webhook fired before the user record was fully committed, causing a race condition on tier upgrade. The operator manually corrects the user's tier in the database, confirms their funnels are intact, and replies to support within 30 minutes. Files a bug for the race condition.

**Capabilities revealed:** Structured server logging (Winston/Pino), database admin access, Stripe webhook observability, error traceability by user ID.

---

**Journey 3B: Subscription Health Monitoring**

*Scene:* End of month. The operator reviews MRR dashboard: 3 new Pro upgrades, 1 Agency downgrade to Pro, 1 cancellation. Reviews the cancellation reason (collected in offboarding flow: "too expensive"). Checks whether the cancelled user ever ran more than 1 simulation. They didn't. Notes: activation failure, not price sensitivity.

**Capabilities revealed:** Subscription event logging, cancellation offboarding with reason collection, usage analytics per user (simulation run count), MRR visibility.

---

### Journey Requirements Summary

| Capability | Revealed By |
|---|---|
| Auth (register/login/JWT/password reset) | All journeys |
| Multi-tenant data isolation | All journeys (cross-tenant leak = critical failure) |
| Persistent funnel storage (PostgreSQL) | Journey 1A, 2B |
| Free tier enforcement (1 funnel limit) + upgrade prompt | Journey 1B |
| Stripe billing (upgrade/downgrade/cancel) | Journey 1B, 2A, 3B |
| Rate limiting on all endpoints | Platform security baseline |
| Subscription tier feature gating | Journeys 1B, 2A |
| Agency workspace management (create/switch/isolate) | Journey 2A, 2B |
| Blueprint library (full access on Pro/Agency) | Journey 2A |
| PDF export | Journey 1A, 2A, 2B |
| Structured logging with user ID context | Journey 3A |
| Stripe webhook reliability + idempotency | Journey 3A |
| Cancellation offboarding with reason capture | Journey 3B |
| Usage event tracking (simulations run per user) | Journey 3B |

## Innovation & Novel Patterns

### Detected Innovation Areas

**1. Pre-Spend Simulation — Category Creation**

FunnelShop introduces a behaviour (model funnel ROI before committing ad spend) that does not currently exist as an affordable SMB product. Existing tools in the market operate post-commitment: ad platforms show performance after spend, CRM tools track conversion after leads are captured, analytics tools report after traffic is generated. FunnelShop occupies the empty upstream slot — the planning instrument that informs whether to spend at all, and how.

This is not an incremental improvement on an existing category. It is a category creation opportunity in the SMB segment. The comparable analogy: financial modelling software for non-financial managers (early tools like LivePlan or Baremetrics created usage patterns that didn't previously exist).

**2. Blueprint Library as Distribution Engine**

Blueprints are not templates — they are pre-validated funnel strategies for specific industry contexts. A Restaurant blueprint pre-populated with industry-average CPCs, conversion rates, and booking flows reduces time-to-first-simulation for the target user (who has no modelling background) from minutes to seconds. Over time, a library of validated blueprints becomes a moat: competitors can copy the builder, but they cannot copy a curated, real-world-tested strategy library.

The distribution implication: industry-specific blueprints are shareable artefacts. A marketer who discovers a "SaaS Trial Funnel" blueprint through a blog post or a Google search arrives at FunnelShop with an immediate, concrete use case. Blueprint depth drives organic acquisition.

### Market Context & Competitive Landscape

The SMB marketing tools market is crowded in the execution layer (ad platforms, email tools, CRMs) and empty in the planning layer. The closest approximations:
- **Spreadsheet ROI calculators** — free, exist on marketing blogs, no interactivity, no persistence, no visual interface
- **Enterprise marketing mix models** — exist (Nielsen, Analytic Partners), priced for Fortune 500, inaccessible to SMBs
- **Consultant-built decks** — expensive, one-off, not interactive

FunnelShop's competitive moat is not technology — it is the combination of accessibility (no modelling background required), interactivity (live simulation), and affordability (€29/mo vs €500/hr consulting).

### Validation Approach

The core innovation assumption to validate: **SMBs will change their pre-spend behaviour if given the right tool.**

- **Leading indicator:** Time-to-first-simulation ≤5 min (measures barrier to behaviour change)
- **Lagging indicator:** Return visits within 7 days (measures whether new behaviour becomes habit)
- **Category validation:** Free-to-Pro conversion driven by persistence need (users who save their funnel are users who have internalised the planning behaviour)

### Risk Mitigation

| Risk | Likelihood | Mitigation |
|---|---|---|
| SMBs don't change behaviour (use tool once, never return) | Medium | Activation metric (≤5 min first sim) designed to minimise friction; return visit tracking as early warning |
| Blueprints not detailed enough for real-world use | Medium | Validate 3 blueprints with real users before launch; collect simulation parameters from early users to calibrate defaults |
| Category education cost too high (no one searches for "funnel simulator") | High | SEO strategy must target problem-aware queries ("marketing ROI calculator", "how to calculate ad ROI") not solution-aware |
| Distribution dependency on content SEO is slow (6–12 months to rank) | High | Blueprint-led distribution as primary channel. Each industry blueprint is a standalone shareable URL — "Restaurant Funnel Blueprint" shared in F&B Facebook groups, WhatsApp communities, industry newsletters. Zero SEO dependency, immediate targeted distribution. Also validates the category faster than content marketing. |

## SaaS B2B Specific Requirements

### Project-Type Overview

FunnelShop is a multi-tenant SaaS B2B product. For v2 it operates with a single authenticated user role — there is no client-facing login, no viewer role, and no public workspace access. Clients of Agency-tier accounts receive PDF exports only; all simulation work is performed by the Agency Account Manager. The permission model is intentionally minimal for v2, deferring any client portal capability to v3 if demand is validated.

### Tenant Model

| Tier | Tenancy Pattern | Workspace Isolation |
|---|---|---|
| Free | Single user, single workspace | User-scoped |
| Pro | Single user, single workspace | User-scoped |
| Agency | Multiple AM seats, per-client workspaces | Org-scoped; each client workspace isolated within the Agency org |

**Database implementation:** Row-level multi-tenancy in PostgreSQL from day one. Every funnel and workspace row carries a `org_id` foreign key. Queries are always org-scoped at the repository layer — no cross-tenant data access is architecturally possible without explicit org context.

Agency client workspaces are logical containers within a single Agency org. The AM creates a client workspace, builds funnels inside it, and exports PDFs. Client workspaces are never surfaced to end-clients in v2.

### RBAC Matrix

| Role | Tier | Permissions |
|---|---|---|
| Owner | Free, Pro | Full CRUD on own workspace and funnels |
| Agency Owner | Agency | Full CRUD on org, all client workspaces, all funnels; manage seats |
| Agency Member | Agency | CRUD on assigned client workspaces; read-only on org settings |

No client-facing roles exist in v2. No admin/super-admin role exists in v2 (operator access handled directly at DB level). Role expansion deferred to v3.

### Subscription Tiers

| Tier | Price | Saved Funnels | Blueprint Access | PDF Export | Seats |
|---|---|---|---|---|---|
| Free | €0 | Up to 3 | None | None | 1 |
| Pro | €29/mo | Unlimited | Full library | Yes | 1 |
| Agency | €99/mo | Unlimited | Full library | White-label PDF | Up to 5 (expandable) |

Billing managed entirely through Stripe. Plan entitlements enforced server-side on every API request — client-side gating is UI-only and never trusted.

### Integration List

| Service | Purpose | Hosting | Notes |
|---|---|---|---|
| Stripe | Billing, subscriptions, webhooks | Stripe-hosted | Day-one requirement; webhook signature verification mandatory |
| Resend | Transactional email (auth flows, billing receipts) | Resend cloud | Simpler API than SendGrid; free tier sufficient for MVP volume |
| Sentry | Error monitoring and alerting | Sentry cloud (EU region) | Standard in TS/Next.js stack; EU data residency configured |
| PostHog | Product analytics, funnel events, feature flags | Self-hosted on Hetzner | GDPR compliant; zero third-party data transfer; runs on existing Docker infrastructure |

No Mixpanel, Amplitude, Google Analytics, or other US-domiciled analytics services. PostHog self-hosted is the single source of product truth.

### Compliance Requirements

**GDPR — Hard Requirements for v2 MVP:**

| Requirement | Scope | Implementation |
|---|---|---|
| Self-serve account deletion | In scope, MVP | Cascade delete: user → workspaces → funnels → simulation data. Confirmation modal + 30-second undo window. Stripe subscription cancelled on deletion. |
| Data portability | Deferred post-MVP | JSON export of user's funnel data. Not blocking v2 launch. |
| Cookie consent | In scope, MVP | Consent banner for PostHog session tracking. No tracking without explicit consent. |
| Privacy policy | In scope, MVP | EU-compliant policy referencing data processors (Stripe, Resend, Sentry EU). |
| DPA with processors | In scope, pre-launch | Data Processing Agreements with Stripe, Resend, Sentry before accepting paying users. |

**EU-Only Hosting — Hard Requirement:**

All user data processed and stored exclusively in the EU. No US-based services for user data.

| Infrastructure Component | Location | Provider |
|---|---|---|
| Application servers | Falkenstein, Germany | Hetzner |
| PostgreSQL database | Falkenstein, Germany | Hetzner |
| PostHog analytics | Falkenstein, Germany | Hetzner (self-hosted) |
| Object storage (PDF exports) | Falkenstein, Germany | Hetzner Object Storage |
| Error monitoring | EU region | Sentry (EU endpoint configured) |

### Implementation Considerations

- **Stripe webhook idempotency:** All Stripe webhook handlers must be idempotent. Events are processed with an idempotency key; duplicate delivery must not create duplicate subscription state.
- **Seat enforcement:** Agency tier seat limits enforced at invite time server-side. Attempting to add a seat beyond the plan limit returns a 403 with an upgrade prompt.
- **PostHog event schema:** Define and document a standard event taxonomy before launch (e.g. `simulation_run`, `blueprint_applied`, `pdf_exported`, `plan_upgraded`). Consistent naming enables reliable funnel analysis.
- **Resend transactional emails:** Minimum required templates for v2: email verification, password reset, subscription confirmation, cancellation confirmation. All templates plain-text fallback required.
- **Cascade delete order:** Deletion must respect FK constraints. Order: simulation_results → funnels → client_workspaces → org_memberships → org → user. Wrapped in a single database transaction.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Revenue MVP — ship the minimum that delivers genuine simulator value to SMB owners and validates Free→Pro conversion before expanding the product surface.

**Core philosophy:** The innovation to validate is the simulator + blueprint behaviour change, not the multi-seat wrapper. Ship Free and Pro clean. Measure conversion. Unlock Agency when the signal is there.

**Agency greenlight trigger:** If Free→Pro conversion exceeds 10% in Month 1, Agency tier (v2.1) is immediately prioritised.

**Resource profile:** Solo developer or 2-person team. Next.js + PostgreSQL stack already in place. Schema is multi-tenant from day one — Agency becomes a billing + UI unlock, not a schema rebuild.

### MVP Feature Set — v2 (Phase 1)

**Tiers in scope:** Free + Pro only. Agency tier deferred to v2.1.

**Core User Journeys Supported:**
- Journey 1: SMB first simulation (Free activation, ≤5 min)
- Journey 2: Pro simulation builder (unlimited saves, parameter control)
- Journey 3A: Blueprint quick-start (apply industry blueprint, customise, simulate)
- Journey 4: Funnel result interpretation (output reading, scenario comparison)

**Must-Have Capabilities:**

| Capability | Justification |
|---|---|
| Funnel simulation engine | Core product — without this nothing works |
| Blueprint library (3 blueprints at launch) | Primary distribution and activation mechanism |
| Free tier (3 saved funnels cap) | Acquisition and trial |
| Pro tier (€29/mo, unlimited funnels, PDF export) | Primary revenue vehicle |
| Stripe billing (Free→Pro upgrade, cancellation) | Revenue infrastructure |
| Email auth (register, verify, password reset) | Access control baseline |
| PDF export (Pro) | Key Pro differentiator; enables offline sharing |
| GDPR self-serve account deletion | Non-negotiable for EU market |
| Resend transactional emails | Auth and billing communication |
| Sentry error monitoring | Operational reliability |
| PostHog product analytics (self-hosted) | Conversion funnel visibility from day one |
| Agency tier waitlist on pricing page | Zero-cost demand signal; warm pipeline for v2.1 |

**Agency waitlist spec:** Single email capture form on the pricing page Agency card. Label: "Join the waitlist — Agency launch coming soon." Submissions stored in the database (no third-party form service). No Stripe integration. Operator notified via email (Resend) on each signup. Target: 20+ waitlist signups before v2.1 build starts.

### Post-MVP Roadmap

**v2.1 — Agency Tier (trigger: Free→Pro conversion >10% in Month 1)**

| Feature | Notes |
|---|---|
| Agency tier billing (€99/mo) | Stripe product + plan addition |
| Multi-seat management (up to 5 AMs) | Invite flow, seat enforcement |
| Per-client workspace isolation | Schema ready day one; UI unlock |
| White-label PDF export | Logo + brand colour on export cover |
| Agency waitlist conversion | Email waitlist → paid invite flow |

**v3 — Platform Expansion (trigger: Agency MRR >€5k)**

| Feature | Notes |
|---|---|
| Client portal (client login, view-only) | New user role; read-only workspace access |
| Google Ads / Meta Ads data import | Pre-populate funnel with real CPC/CTR data |
| Saved scenario comparison (A/B view) | Multiple simulations side-by-side |
| Blueprint submission by users | Community-contributed blueprints with curation |
| API access (Pro+) | Headless simulation for integrators |

### Scoping Risk Register

| Risk | Type | Mitigation |
|---|---|---|
| Agency scope creep into v2 | Resource | Hard boundary: Agency is v2.1. Waitlist is the only Agency surface in v2. |
| Blueprint quality too low for real-world use | Market | Validate 3 blueprints with 5 real users before launch; reject any blueprint with >2 min confusion time |
| Stripe webhook complexity delays billing launch | Technical | Build and test webhook handlers in staging with Stripe CLI before any Pro gating |
| Free→Pro conversion below 10% | Market | PostHog funnel analysis from day one identifies drop-off point; iterate on upgrade prompt placement and Pro value communication |
| Schema multi-tenancy performance at scale | Technical | Row-level isolation with indexed `org_id` on all tenant tables; benchmark with 10k simulated rows before launch |

## Functional Requirements

### User Account Management

- **FR1:** A visitor can register for an account using an email address and password
- **FR2:** A registered user can verify their email address to activate their account
- **FR3:** A registered user can log in and out of their account
- **FR4:** A registered user can reset their password via a link sent to their email
- **FR5:** A registered user can update their account profile (display name, email address)
- **FR6:** A registered user can permanently delete their account and all associated data through the product interface

### Funnel Simulation

- **FR7:** A user can create a new funnel simulation
- **FR8:** A user can configure funnel input parameters (advertising budget, CPC or CPM, click-through rate, conversion rate, average order value / ARPU)
- **FR9:** A user can run a simulation to compute output metrics (projected revenue, ROAS, CAC, LTV, payback period, leads generated, conversions)
- **FR10:** A user can view simulation results as a visual funnel breakdown and a key metric summary
- **FR11:** A user can save a named funnel simulation to their workspace
- **FR12:** A user can rename or delete a saved funnel simulation
- **FR13:** A Free user is capped at 1 saved funnel simulation
- **FR14:** A Free user is shown an upgrade prompt when the saved funnel limit is reached
- **FR36:** A Free user can duplicate an existing saved funnel as a new unsaved simulation

### Blueprint Library

- **FR15:** A user can browse the available blueprint library, filtered by industry or use case
- **FR16:** A user can view a blueprint's description including its industry context and default parameter rationale
- **FR17:** A user can apply a blueprint to a new simulation, pre-populating default parameter values
- **FR18:** A user can customise any blueprint-applied parameter before running the simulation
- **FR19:** A Pro user can share a blueprint via a unique public URL
- **FR20:** An unauthenticated visitor can view a shared blueprint and its default parameters via its public URL

### Workspace & Funnel Management

- **FR21:** A user can view their list of saved funnels in their workspace
- **FR22:** A Pro user can save an unlimited number of funnel simulations

### Subscription & Billing

- **FR23:** A Free user can upgrade to Pro by entering payment details
- **FR24:** A Pro user can view their current plan, billing cycle, and next payment date
- **FR25:** A Pro user can update their saved payment method
- **FR26:** A Pro user can cancel their subscription
- **FR27:** A user receives an email confirmation for subscription activation and cancellation
- **FR28:** A user can view their billing history

### Export & Reporting

- **FR29:** A Pro user can export a simulation as a PDF report
- **FR30:** A PDF export includes all funnel input parameters, computed output metrics, and a visual funnel diagram

### Agency Waitlist

- **FR31:** A visitor can submit their email address to join the Agency tier waitlist on the pricing page
- **FR32:** The operator receives a notification when a new Agency waitlist signup is submitted

### Compliance & Communication

- **FR33:** A user receives transactional emails for: email verification, password reset, subscription confirmation, and cancellation confirmation
- **FR34:** A user can manage their cookie and analytics consent preferences
- **FR35:** A user can request permanent deletion of their account and all associated data through a self-serve interface


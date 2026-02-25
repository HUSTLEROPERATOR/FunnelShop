---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain']
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



---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success']
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



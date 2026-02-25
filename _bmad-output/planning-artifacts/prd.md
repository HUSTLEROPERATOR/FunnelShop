---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary']
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



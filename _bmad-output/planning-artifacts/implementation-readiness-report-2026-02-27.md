---
stepsCompleted: ["step-01-document-discovery", "step-02-prd-analysis", "step-03-epic-coverage-validation", "step-04-ux-alignment", "step-05-epic-quality-review", "step-06-final-assessment"]
documentsInventoried:
  prd: "_bmad-output/planning-artifacts/prd.md"
  architecture: "_bmad-output/planning-artifacts/architecture.md"
  epics: "_bmad-output/planning-artifacts/epics.md"
  ux: null
  projectContext: "_bmad-output/project-context.md"
uxGapStatus: "accepted-omission"
---

# Implementation Readiness Assessment Report

**Date:** 2026-02-27
**Project:** FunnelShop

---

## Section 1: Document Inventory

| Document | File | Status |
|---|---|---|
| PRD | `_bmad-output/planning-artifacts/prd.md` (36K) | ✅ Present |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` (34K) | ✅ Present |
| Epics & Stories | `_bmad-output/planning-artifacts/epics.md` (10K) | ✅ Present |
| Project Context | `_bmad-output/project-context.md` (16K) | ✅ Present (supplementary) |
| UX Design | — | ⚠️ Absent (accepted omission) |

**UX Gap Note:** No UX design document was commissioned for FunnelShop v2. This phase extends the existing v1 UI — the canvas, simulation output, and blueprint picker are v1 components carried forward unchanged. New UI surfaces (auth pages, workspace, billing) follow the existing `tokens.css` design system documented in `project-context.md`. This omission is **accepted and does not block implementation**.

---

## Section 2: PRD Analysis

### Functional Requirements (36 total)

#### User Account Management
- **FR1:** A visitor can register for an account using an email address and password
- **FR2:** A registered user can verify their email address to activate their account
- **FR3:** A registered user can log in and out of their account
- **FR4:** A registered user can reset their password via a link sent to their email
- **FR5:** A registered user can update their account profile (display name, email address)
- **FR6:** A registered user can permanently delete their account and all associated data through the product interface

#### Funnel Simulation
- **FR7:** A user can create a new funnel simulation
- **FR8:** A user can configure funnel input parameters (advertising budget, CPC or CPM, click-through rate, conversion rate, average order value / ARPU)
- **FR9:** A user can run a simulation to compute output metrics (projected revenue, ROAS, CAC, LTV, payback period, leads generated, conversions)
- **FR10:** A user can view simulation results as a visual funnel breakdown and a key metric summary
- **FR11:** A user can save a named funnel simulation to their workspace
- **FR12:** A user can rename or delete a saved funnel simulation
- **FR13:** A Free user is capped at 1 saved funnel simulation
- **FR14:** A Free user is shown an upgrade prompt when the saved funnel limit is reached
- **FR36:** A Free user can duplicate an existing saved funnel as a new unsaved simulation

#### Blueprint Library
- **FR15:** A user can browse the available blueprint library, filtered by industry or use case
- **FR16:** A user can view a blueprint's description including its industry context and default parameter rationale
- **FR17:** A user can apply a blueprint to a new simulation, pre-populating default parameter values
- **FR18:** A user can customise any blueprint-applied parameter before running the simulation
- **FR19:** A Pro user can share a blueprint via a unique public URL
- **FR20:** An unauthenticated visitor can view a shared blueprint and its default parameters via its public URL

#### Workspace & Funnel Management
- **FR21:** A user can view their list of saved funnels in their workspace
- **FR22:** A Pro user can save an unlimited number of funnel simulations

#### Subscription & Billing
- **FR23:** A Free user can upgrade to Pro by entering payment details
- **FR24:** A Pro user can view their current plan, billing cycle, and next payment date
- **FR25:** A Pro user can update their saved payment method
- **FR26:** A Pro user can cancel their subscription
- **FR27:** A user receives an email confirmation for subscription activation and cancellation
- **FR28:** A user can view their billing history

#### Export & Reporting
- **FR29:** A Pro user can export a simulation as a PDF report
- **FR30:** A PDF export includes all funnel input parameters, computed output metrics, and a visual funnel diagram

#### Agency Waitlist
- **FR31:** A visitor can submit their email address to join the Agency tier waitlist on the pricing page
- **FR32:** The operator receives a notification when a new Agency waitlist signup is submitted

#### Compliance & Communication
- **FR33:** A user receives transactional emails for: email verification, password reset, subscription confirmation, and cancellation confirmation
- **FR34:** A user can manage their cookie and analytics consent preferences
- **FR35:** A user can request permanent deletion of their account and all associated data through a self-serve interface

---

### Non-Functional Requirements (26 total)

#### Performance
- **NFR1:** Simulation results returned to user within 2 seconds end-to-end; server-side computation completes within 500ms at p95
- **NFR2:** Dashboard and workspace views load within 3 seconds on a standard broadband connection
- **NFR3:** Blueprint library renders within 2 seconds of page load
- **NFR4:** PDF export generates and initiates download within 10 seconds

#### Security
- **NFR5:** All data transmitted over HTTPS (TLS 1.2 minimum)
- **NFR6:** User passwords stored using bcrypt or argon2; never in plaintext
- **NFR7:** Stripe webhook payloads verified via signature on every inbound request
- **NFR8:** All database queries parameterised; no dynamic SQL string construction
- **NFR9:** Session tokens expire after 30 days; refresh tokens rotate on use
- **NFR10:** All repository-layer queries scoped by `org_id`; cross-tenant data access architecturally impossible without explicit org context
- **NFR11:** Sentry error payloads scrubbed of PII (email addresses, names) before transmission
- **NFR26:** Rate limiting applied at API layer — max 60 req/min per authenticated user, 10 req/min for unauthenticated endpoints

#### Reliability
- **NFR12:** Application targets 99.5% monthly uptime on Hetzner infrastructure
- **NFR13:** Stripe webhook processing includes idempotency handling; duplicate event delivery does not create duplicate subscription state
- **NFR14:** Daily automated database backups with point-in-time recovery capability

#### Scalability
- **NFR15:** System handles 1,000 concurrent users without measurable performance degradation at launch
- **NFR16:** All tenant-scoped tables indexed on `org_id` and `user_id`; queries remain sub-100ms at 100k+ funnel records
- **NFR17:** Application layer is stateless; horizontal scaling requires no session migration

#### Compliance
- **NFR18:** Account deletion cascade completes within 24 hours of user request (target: immediately within single transaction)
- **NFR19:** PostHog session tracking does not initialise until explicit user consent is captured
- **NFR20:** All user data stored and processed exclusively in EU (Hetzner Falkenstein, Germany)
- **NFR21:** Data Processing Agreements with Stripe, Resend, and Sentry executed before first paying user

#### Integration Resilience
- **NFR22:** Stripe payment failures surface a clear user-facing error message; no silent failures
- **NFR23:** Resend delivery failures for critical auth emails retried automatically; failures logged in Sentry
- **NFR24:** PostHog SDK failure does not block or degrade any user-facing functionality (fire-and-forget, non-blocking)
- **NFR25:** Sentry SDK failure does not affect application performance or user experience

---

### Additional Requirements & Constraints

- **Multi-tenancy (day-one):** Row-level isolation in PostgreSQL; every funnel/workspace row carries `org_id`; all queries scoped at repository layer
- **Agency deferred to v2.1:** Only Agency waitlist (email capture) is in scope for v2 MVP
- **EU-only hosting (hard):** Hetzner Falkenstein, Germany for all infrastructure components
- **Cascade delete order:** `simulation_results → funnels → client_workspaces → org_memberships → org → user` — wrapped in single DB transaction
- **PostHog event taxonomy pre-launch:** `simulation_run`, `blueprint_applied`, `pdf_exported`, `plan_upgraded` — must be defined and documented before launch
- **Transactional email templates (min 4):** Email verification, password reset, subscription confirmation, cancellation confirmation — all with plain-text fallback
- **Stripe webhook idempotency key:** All handlers must process with idempotency key; duplicate delivery must not create duplicate state
- **Seat enforcement (Agency v2.1):** Server-side at invite time; exceeding limit returns 403 with upgrade prompt
- **GDPR data portability:** Deferred post-MVP (JSON export); not blocking v2 launch

---

---

## Section 3: Epic Coverage Validation

### ⛔ CRITICAL BLOCKER: Epics Document Is Incomplete

The `epics.md` file was opened and read in full. While it correctly reproduces the Requirements Inventory (all 36 FRs, 26 NFRs, and additional architecture constraints), the two core sections are **unfilled template placeholders**:

- `FR Coverage Map` section contains: `{{requirements_coverage_map}}` — **no content**
- `Epic List` section contains: `{{epics_list}}` — **no content**

**There are zero epics and zero stories defined in this document.** The epics workflow was started (frontmatter confirms `step-01-validate-prerequisites` completed) but was never carried through to generating the actual epics and stories.

---

### FR Coverage Matrix

| FR | Requirement (summary) | Epic Coverage | Status |
|---|---|---|---|
| FR1 | Register with email + password | NOT FOUND | ❌ MISSING |
| FR2 | Email verification on signup | NOT FOUND | ❌ MISSING |
| FR3 | Login / logout | NOT FOUND | ❌ MISSING |
| FR4 | Password reset via email | NOT FOUND | ❌ MISSING |
| FR5 | Update profile (name, email) | NOT FOUND | ❌ MISSING |
| FR6 | Self-serve account deletion (cascade) | NOT FOUND | ❌ MISSING |
| FR7 | Create new funnel simulation | NOT FOUND | ❌ MISSING |
| FR8 | Configure funnel input parameters | NOT FOUND | ❌ MISSING |
| FR9 | Run simulation → compute output metrics | NOT FOUND | ❌ MISSING |
| FR10 | View simulation results (visual + summary) | NOT FOUND | ❌ MISSING |
| FR11 | Save named funnel to workspace | NOT FOUND | ❌ MISSING |
| FR12 | Rename / delete saved funnel | NOT FOUND | ❌ MISSING |
| FR13 | Free tier: 1 saved funnel cap | NOT FOUND | ❌ MISSING |
| FR14 | Free tier: upgrade prompt at limit | NOT FOUND | ❌ MISSING |
| FR15 | Browse blueprint library (filtered) | NOT FOUND | ❌ MISSING |
| FR16 | View blueprint description + rationale | NOT FOUND | ❌ MISSING |
| FR17 | Apply blueprint → pre-populate params | NOT FOUND | ❌ MISSING |
| FR18 | Customise blueprint params before sim | NOT FOUND | ❌ MISSING |
| FR19 | Pro: share blueprint via public URL | NOT FOUND | ❌ MISSING |
| FR20 | Unauthenticated: view shared blueprint | NOT FOUND | ❌ MISSING |
| FR21 | View list of saved funnels (workspace) | NOT FOUND | ❌ MISSING |
| FR22 | Pro: save unlimited funnels | NOT FOUND | ❌ MISSING |
| FR23 | Free: upgrade to Pro (Stripe) | NOT FOUND | ❌ MISSING |
| FR24 | Pro: view plan / billing cycle / next date | NOT FOUND | ❌ MISSING |
| FR25 | Pro: update payment method | NOT FOUND | ❌ MISSING |
| FR26 | Pro: cancel subscription | NOT FOUND | ❌ MISSING |
| FR27 | Email confirmation: activation + cancel | NOT FOUND | ❌ MISSING |
| FR28 | View billing history | NOT FOUND | ❌ MISSING |
| FR29 | Pro: export simulation as PDF | NOT FOUND | ❌ MISSING |
| FR30 | PDF includes inputs + outputs + diagram | NOT FOUND | ❌ MISSING |
| FR31 | Agency waitlist email capture | NOT FOUND | ❌ MISSING |
| FR32 | Operator notified on waitlist signup | NOT FOUND | ❌ MISSING |
| FR33 | Transactional emails (4 types) | NOT FOUND | ❌ MISSING |
| FR34 | Cookie / analytics consent management | NOT FOUND | ❌ MISSING |
| FR35 | Self-serve account + data deletion UI | NOT FOUND | ❌ MISSING |
| FR36 | Free: duplicate funnel as unsaved sim | NOT FOUND | ❌ MISSING |

### Coverage Statistics

- **Total PRD FRs:** 36
- **FRs covered in epics:** 0
- **Coverage percentage: 0%**

### Missing Requirements Summary

**ALL 36 FRs are untraced.** This is not a gap in coverage — the epics have not been written at all. The root cause is an incomplete workflow execution: the epics generation workflow halted after step 1 (prerequisites validation) and never produced epics or stories content.

---

---

## Section 4: UX Alignment Assessment

### UX Document Status

**Not Found — Accepted Omission (confirmed by product owner)**

FunnelShop v2 extends an existing v1 UI. No UX redesign was commissioned for this phase.

### Scope of UI surfaces in v2

| UI Surface | Source | Status |
|---|---|---|
| Drag-drop canvas | v1 component, carried forward unchanged | ✅ No redesign needed |
| Simulation output panel | v1 component, carried forward unchanged | ✅ No redesign needed |
| Blueprint picker | v1 component, carried forward unchanged | ✅ No redesign needed |
| Auth pages (login, register, reset, verify) | NEW — v2 | ⚠️ No UX spec; design system covers tokens only |
| Workspace / funnel list | NEW — v2 | ⚠️ No UX spec; design system covers tokens only |
| Billing / upgrade / pricing pages | NEW — v2 | ⚠️ No UX spec; design system covers tokens only |
| Account settings / deletion | NEW — v2 | ⚠️ No UX spec; design system covers tokens only |
| Cookie consent banner | NEW — v2 | ⚠️ No UX spec; design system covers tokens only |
| Agency waitlist form | NEW — v2 | ⚠️ No UX spec; design system covers tokens only |

### Architecture-UX Alignment

The architecture document (`architecture.md`) provides structural coverage for new UI surfaces:

- ✅ `AuthContext` + `ProtectedRoute` pattern defined — auth state flow is specified
- ✅ Frontend file structure defined — new component directories: `auth/`, `billing/`, `export/`
- ✅ `GET /api/v1/users/me` hydration pattern specified — auth state loading behavior defined
- ✅ Stripe Checkout (hosted) and Customer Portal — removes custom billing UI complexity
- ✅ `tokens.css` design system documented in `project-context.md` — color, spacing, typography tokens available
- ✅ Tailwind for layout only (documented constraint)

### Warnings

- ⚠️ **5 new UI surfaces have no page-level UX spec.** Auth pages, workspace, billing, account settings, and consent banner are functional requirements with architecture patterns defined but no wireframe, flow diagram, or component-level specification. Implementation agents will need to make independent layout and interaction decisions for these surfaces.
- ⚠️ **Upgrade modal UX is not specified.** FR13/FR14 (Free tier cap + upgrade prompt) is a critical conversion touchpoint. Its copy, placement, and interaction pattern are undocumented. This is the primary Free→Pro conversion mechanism and warrants at minimum a quick spec before implementation.
- ✅ **Accepted:** All three v1 UI surfaces (canvas, simulation, blueprints) are explicitly scoped as unchanged — zero UX risk on carry-forward components.
- ✅ **Mitigated:** Stripe-hosted Checkout and Customer Portal eliminate custom billing UI design work for the payment flow itself.

### Assessment

The UX gap is **conditionally acceptable** for the v1 carry-forward surfaces and Stripe-hosted flows. For new bespoke surfaces, the absence of UX spec increases implementation variance. This is a **low-severity warning**, not a blocker, given the design system coverage — but the upgrade modal (FR13/FR14) should be treated as an **implementation risk** without a quick spec.

---

### PRD Completeness Assessment

The PRD is well-structured and thorough. Requirements are numbered, categorised, and traceable. Key observations:

- ✅ 36 FRs numbered sequentially (FR1–FR36) — no gaps in numbering noted (FR36 appears in Funnel Simulation section out of sequence; this is cosmetically out of order but not substantively missing)
- ✅ 26 NFRs numbered sequentially (NFR1–NFR26, with NFR26 appearing in the Security section rather than the end — cosmetic ordering only)
- ✅ User journeys align clearly with the FR set
- ✅ Compliance requirements (GDPR, EU hosting) are specific and implementation-ready
- ✅ Out-of-scope items (Agency tier, data portability, v3 features) are explicitly labelled
- ⚠️ FR36 (Free user duplicate funnel) appears out-of-section order — listed under Funnel Simulation but numbered 36; minor authoring artifact, no impact on coverage
- ⚠️ NFR26 (rate limiting) is placed in the Security section but numbered 26 — same minor authoring artifact

---

## Section 5: Epic Quality Review

### ⛔ CRITICAL BLOCKER: No Epics or Stories Exist to Review

The `epics.md` document was confirmed in Section 3 to contain no actual epics or stories — only template placeholders. As a result, no epic quality review is possible.

**Compliance checklist — applied to zero epics:**

| Check | Result |
|---|---|
| Epics deliver user value (not technical milestones) | ❌ N/A — no epics exist |
| Epics are independent | ❌ N/A — no epics exist |
| Stories are appropriately sized | ❌ N/A — no stories exist |
| No forward dependencies | ❌ N/A — no stories exist |
| Database tables created when first needed | ❌ N/A — no stories exist |
| Clear acceptance criteria (BDD format) | ❌ N/A — no stories exist |
| FR traceability maintained | ❌ N/A — no stories exist |

### 🔴 Critical Violations

**VIOLATION-1 — No epics defined (Severity: CRITICAL)**
- The `{{epics_list}}` placeholder in `epics.md` was never replaced with actual content
- There are zero epics, zero stories, and zero acceptance criteria in the entire document
- The create-epics-and-stories workflow was interrupted after step 1 and never completed
- **Impact:** Implementation cannot begin. Dev agents have no work breakdown. There is no sprint plan, no story sequencing, and no definition of done for any feature.
- **Remediation:** Run the `create-epics-and-stories` workflow to completion. All input material (PRD, architecture, additional requirements) is present and already catalogued inside `epics.md` itself.

**VIOLATION-2 — No FR Coverage Map (Severity: CRITICAL)**
- The `{{requirements_coverage_map}}` placeholder was never replaced
- There is no implemented traceability between the 36 FRs and any delivery unit
- **Remediation:** Resolved automatically when epics and stories are written with FR references

### Brownfield-Specific Sequencing Constraints

The architecture identifies several implementation prerequisites that must be reflected in story sequencing:

- **Story 0 — TypeScript/ESM server migration:** Must be the first story executed before any v2 server work. The architecture explicitly states: "no new server files in plain JS after this decision."
- **Route module refactor:** `server/index.js` is a single-file monolith that must be refactored into route modules before any new endpoints are added. This must be its own story.
- **Test strategy decision (before any DB-backed tests):** Test containers vs pg mock must be decided and documented before writing new server tests against PostgreSQL.
- **Auth middleware story scope:** Must audit and cover ALL endpoints simultaneously — no partial auth stories are acceptable.

These are mandatory sequencing anchors. The epic author must encode these as explicit story ordering constraints.

---

## Section 6: Summary and Final Recommendations

### Overall Readiness Status

## ⛔ NOT READY

**Reason:** The epics and stories breakdown does not exist. Implementation cannot begin without a work breakdown structure. All other planning artifacts are complete and of high quality.

---

### Issue Register

| # | Severity | Section | Issue | Blocking? |
|---|---|---|---|---|
| 1 | 🔴 Critical | Epics | `epics.md` Epic List is an unfilled template placeholder — zero epics defined | YES |
| 2 | 🔴 Critical | Epics | `epics.md` FR Coverage Map is an unfilled template placeholder — 0% FR traceability | YES |
| 3 | ⚠️ Warning | UX | 5 new UI surfaces (auth, workspace, billing, account settings, consent) have no UX spec | NO |
| 4 | ⚠️ Warning | UX | Upgrade modal (FR13/FR14) — primary Free→Pro conversion touchpoint — has no UX spec | NO |
| 5 | 🟡 Minor | PRD | FR36 appears out-of-section numeric order (cosmetic authoring artifact) | NO |
| 6 | 🟡 Minor | PRD | NFR26 appears in Security section but numbered 26 (cosmetic authoring artifact) | NO |

**Total issues: 6** — 2 critical (blocking), 2 warnings (non-blocking), 2 minor (cosmetic)

---

### What Is In Excellent Shape

- ✅ **PRD:** Complete, thorough, 36 FRs + 26 NFRs, well-structured, all out-of-scope items labelled, GDPR compliance requirements specific and implementation-ready
- ✅ **Architecture:** Deep, well-reasoned, covers multi-tenancy, auth, billing, PDF export, observability, code patterns, and brownfield migration with explicit technology decisions
- ✅ **Project Context:** Provides dev agent operational rules, codebase conventions, and design system — ready to accompany story files
- ✅ **Epics Requirements Inventory:** The `epics.md` already contains all 36 FRs, 26 NFRs, and all architectural constraints — the epic author has everything they need in one file

---

### Critical Issues Requiring Immediate Action

**ISSUE-1: Complete the create-epics-and-stories workflow**

The workflow was started but halted after prerequisites validation. The document shell exists with all requirements pre-loaded. This is the single blocking issue.

**ISSUE-2: Encode brownfield sequencing constraints in early stories**

TypeScript/ESM server migration, `server/index.js` route refactor, and test strategy decision are load-bearing prerequisites for all v2 server work. They must appear as explicit early stories. Failure to sequence them correctly will cause rework across the entire epic set.

---

### Recommended Next Steps

1. **Immediately:** Run `create-epics-and-stories` to generate epics and stories. All prerequisite inputs are present and pre-loaded inside `epics.md`. The workflow has everything it needs.

2. **Before Story 0 is written:** Confirm the brownfield migration sequence as explicit stories at the head of the backlog — TS/ESM migration, route module refactor, and test strategy decision.

3. **Before implementing FR13/FR14:** Author a quick spec for the upgrade modal. This is the primary Free→Pro conversion mechanism and leaving its copy, placement, and interaction to the implementing agent is a product risk.

4. **After epics are written:** Re-run this implementation readiness check to validate FR coverage and story quality before sprint 1 begins.

---

### Final Note

This assessment identified **6 issues across 3 categories**. The project has a strong, well-reasoned planning foundation — PRD and architecture are production-grade. The single action required to reach implementation readiness is completing the epics workflow. Once epics and stories exist, re-run this readiness check to validate before sprint 1.

---

**Assessment completed:** 2026-02-27
**Assessor:** Winston (BMad Architect Agent)
**Report file:** `_bmad-output/planning-artifacts/implementation-readiness-report-2026-02-27.md`

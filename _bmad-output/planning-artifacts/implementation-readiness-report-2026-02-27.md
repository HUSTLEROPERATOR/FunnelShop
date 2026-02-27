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

| Document | File | Size | Modified | Status |
|---|---|---|---|---|
| PRD | `_bmad-output/planning-artifacts/prd.md` | 36K | Feb 26 23:58 | ✅ Present |
| Architecture | `_bmad-output/planning-artifacts/architecture.md` | 34K | Feb 26 23:58 | ✅ Present |
| Epics & Stories | `_bmad-output/planning-artifacts/epics.md` | 50K | Feb 27 00:54 | ✅ Present |
| Project Context | `_bmad-output/project-context.md` | 16K | Feb 26 23:58 | ✅ Present (supplementary) |
| UX Design | — | — | — | ⚠️ Absent (accepted omission — see Section 4) |

**Duplicate conflicts:** None detected
**Sharded documents:** None detected

---

## Section 2: PRD Analysis

### Functional Requirements (36 total)

#### User Account Management (FR1–FR6)
- **FR1:** A visitor can register for an account using an email address and password
- **FR2:** A registered user can verify their email address to activate their account
- **FR3:** A registered user can log in and out of their account
- **FR4:** A registered user can reset their password via a link sent to their email
- **FR5:** A registered user can update their account profile (display name, email address)
- **FR6:** A registered user can permanently delete their account and all associated data through the product interface

#### Funnel Simulation (FR7–FR14, FR36)
- **FR7:** A user can create a new funnel simulation
- **FR8:** A user can configure funnel input parameters (advertising budget, CPC or CPM, click-through rate, conversion rate, average order value / ARPU)
- **FR9:** A user can run a simulation to compute output metrics (projected revenue, ROAS, CAC, LTV, payback period, leads generated, conversions)
- **FR10:** A user can view simulation results as a visual funnel breakdown and a key metric summary
- **FR11:** A user can save a named funnel simulation to their workspace
- **FR12:** A user can rename or delete a saved funnel simulation
- **FR13:** A Free user is capped at 1 saved funnel simulation
- **FR14:** A Free user is shown an upgrade prompt when the saved funnel limit is reached
- **FR36:** A Free user can duplicate an existing saved funnel as a new unsaved simulation

#### Blueprint Library (FR15–FR20)
- **FR15:** A user can browse the available blueprint library, filtered by industry or use case
- **FR16:** A user can view a blueprint's description including its industry context and default parameter rationale
- **FR17:** A user can apply a blueprint to a new simulation, pre-populating default parameter values
- **FR18:** A user can customise any blueprint-applied parameter before running the simulation
- **FR19:** A Pro user can share a blueprint via a unique public URL
- **FR20:** An unauthenticated visitor can view a shared blueprint and its default parameters via its public URL

#### Workspace & Funnel Management (FR21–FR22)
- **FR21:** A user can view their list of saved funnels in their workspace
- **FR22:** A Pro user can save an unlimited number of funnel simulations

#### Subscription & Billing (FR23–FR28)
- **FR23:** A Free user can upgrade to Pro by entering payment details
- **FR24:** A Pro user can view their current plan, billing cycle, and next payment date
- **FR25:** A Pro user can update their saved payment method
- **FR26:** A Pro user can cancel their subscription
- **FR27:** A user receives an email confirmation for subscription activation and cancellation
- **FR28:** A user can view their billing history

#### Export & Reporting (FR29–FR30)
- **FR29:** A Pro user can export a simulation as a PDF report
- **FR30:** A PDF export includes all funnel input parameters, computed output metrics, and a visual funnel diagram

#### Agency Waitlist (FR31–FR32)
- **FR31:** A visitor can submit their email address to join the Agency tier waitlist on the pricing page
- **FR32:** The operator receives a notification when a new Agency waitlist signup is submitted

#### Compliance & Communication (FR33–FR35)
- **FR33:** A user receives transactional emails for: email verification, password reset, subscription confirmation, and cancellation confirmation
- **FR34:** A user can manage their cookie and analytics consent preferences
- **FR35:** A user can request permanent deletion of their account and all associated data through a self-serve interface

---

### Non-Functional Requirements (26 total)

#### Performance (NFR1–NFR4)
- **NFR1:** Simulation results returned within 2 seconds end-to-end; server-side computation within 500ms at p95
- **NFR2:** Dashboard and workspace views load within 3 seconds on a standard broadband connection
- **NFR3:** Blueprint library renders within 2 seconds of page load
- **NFR4:** PDF export generates and initiates download within 10 seconds

#### Security (NFR5–NFR11, NFR26)
- **NFR5:** All data transmitted over HTTPS (TLS 1.2 minimum)
- **NFR6:** User passwords stored using bcrypt or argon2; never in plaintext
- **NFR7:** Stripe webhook payloads verified via signature on every inbound request
- **NFR8:** All database queries parameterised; no dynamic SQL string construction
- **NFR9:** Session tokens expire after 30 days; refresh tokens rotate on use
- **NFR10:** All repository-layer queries scoped by `org_id`; cross-tenant data access architecturally impossible
- **NFR11:** Sentry error payloads scrubbed of PII before transmission
- **NFR26:** Rate limiting — max 60 req/min per authenticated user; 10 req/min for unauthenticated endpoints

#### Reliability (NFR12–NFR14)
- **NFR12:** Application targets 99.5% monthly uptime on Hetzner infrastructure
- **NFR13:** Stripe webhook processing includes idempotency handling; duplicate event delivery does not create duplicate subscription state
- **NFR14:** Daily automated database backups with point-in-time recovery capability

#### Scalability (NFR15–NFR17)
- **NFR15:** System handles 1,000 concurrent users without measurable performance degradation
- **NFR16:** All tenant-scoped tables indexed on `org_id` and `user_id`; queries remain sub-100ms at 100k+ funnel records
- **NFR17:** Application layer is stateless; horizontal scaling requires no session migration

#### Compliance (NFR18–NFR21)
- **NFR18:** Account deletion cascade completes within 24 hours (target: immediately within single transaction)
- **NFR19:** PostHog session tracking does not initialise until explicit user consent is captured
- **NFR20:** All user data stored and processed exclusively in EU (Hetzner Falkenstein, Germany)
- **NFR21:** Data Processing Agreements with Stripe, Resend, and Sentry executed before first paying user

#### Integration Resilience (NFR22–NFR25)
- **NFR22:** Stripe payment failures surface a clear user-facing error message; no silent failures
- **NFR23:** Resend delivery failures for critical auth emails retried automatically; failures logged in Sentry
- **NFR24:** PostHog SDK failure does not block or degrade any user-facing functionality (fire-and-forget)
- **NFR25:** Sentry SDK failure does not affect application performance or user experience

---

### Additional Requirements & Constraints

- **Multi-tenancy day-one:** Row-level isolation in PostgreSQL; every tenant-scoped table carries `org_id` FK; all queries scoped at repository layer
- **Agency deferred to v2.1:** Only Agency waitlist (email capture) is in scope for v2 MVP
- **EU-only hosting (hard):** Hetzner Falkenstein, Germany for all infrastructure components
- **Cascade delete order:** `simulation_results → funnels → client_workspaces → org_memberships → org → user` — wrapped in single DB transaction
- **PostHog event taxonomy pre-launch:** `simulation_run`, `blueprint_applied`, `pdf_exported`, `plan_upgraded`
- **Transactional email templates (min 4):** Email verification, password reset, subscription confirmation, cancellation confirmation — all with plain-text fallback
- **Stripe webhook idempotency:** All handlers must process with idempotency key; duplicate delivery must not create duplicate state
- **GDPR data portability:** Deferred post-MVP (JSON export); not blocking v2 launch

### PRD Completeness Assessment

- ✅ 36 FRs numbered sequentially (FR1–FR35 + FR36 — FR36 appears out of numeric order in the Funnel Simulation section; cosmetic authoring artifact only)
- ✅ 26 NFRs (NFR1–NFR25 + NFR26 — NFR26 appears in Security section but numbered 26; cosmetic authoring artifact only)
- ✅ User journeys are detailed and map clearly to the FR set
- ✅ Out-of-scope items (Agency tier full build, data portability, v3 features) are explicitly labelled
- ✅ Compliance requirements (GDPR, EU hosting) are specific and implementation-ready
- ✅ Success criteria are measurable (MRR targets, conversion %, performance thresholds)
- ✅ Integration list with rationale provided for all four external services

**PRD verdict: Complete and implementation-ready.**

---

## Section 3: Epic Coverage Validation

### Epics Document Status

**File verified:** `_bmad-output/planning-artifacts/epics.md`
- **Lines:** 824
- **`###` headings:** 40
- **Workflow steps completed:** `step-01-validate-prerequisites`, `step-02-design-epics`, `step-03-create-stories`, `step-04-final-validation` — all four steps complete
- **Epics:** 9 (E0–E8)
- **Stories:** 27 total

**Story count by epic:**

| Epic | Stories |
|---|---|
| E0: Server TypeScript Migration | 2 (0.1, 0.2) |
| E1: User Auth & Account Management | 6 (1.1–1.6) |
| E2: PostgreSQL + Drizzle + Multi-Tenant Schema | 3 (2.1–2.3) |
| E3: Funnel Simulation & Workspace | 5 (3.1–3.5) |
| E4: Subscription & Billing | 4 (4.1–4.4) |
| E5: Blueprint Library | 3 (5.1–5.3) |
| E6: PDF Export | 1 (6.1) |
| E7: Agency Waitlist | 1 (7.1) |
| E8: GDPR & Privacy Compliance | 2 (8.1, 8.2) |
| **Total** | **27** |

---

### FR Coverage Matrix

| FR | PRD Requirement (summary) | Epic | Story | Status |
|---|---|---|---|---|
| FR1 | Register with email + password | Epic 1 | Story 1.1 — `POST /api/v1/auth/register` | ✅ Covered |
| FR2 | Email verification on signup | Epic 1 | Story 1.2 — `GET /api/v1/auth/verify-email?token=` | ✅ Covered |
| FR3 | Login / logout | Epic 1 | Story 1.3 — `POST /api/v1/auth/login`, `POST /api/v1/auth/logout` | ✅ Covered |
| FR4 | Password reset via email | Epic 1 | Story 1.4 — `POST /api/v1/auth/forgot-password` + `reset-password` | ✅ Covered |
| FR5 | Update profile (name, email) | Epic 1 | Story 1.5 — `PATCH /api/v1/users/me` | ✅ Covered |
| FR6 | Self-serve account deletion | Epic 1 | Story 1.6 — `DELETE /api/v1/users/me` | ✅ Covered |
| FR7 | Create new funnel simulation | Epic 3 | Story 3.1/3.2 — `POST /api/v1/simulations/run`, `POST /api/v1/funnels` | ✅ Covered |
| FR8 | Configure funnel input params | Epic 3 | Story 3.1 — inputs in request body | ✅ Covered |
| FR9 | Run simulation, compute outputs | Epic 3 | Story 3.1 — all 7 computed metrics returned | ✅ Covered |
| FR10 | View results (visual + summary) | Epic 3 | Story 3.1 — visual funnel + key metrics panel | ✅ Covered |
| FR11 | Save named funnel to workspace | Epic 3 | Story 3.2 — `POST /api/v1/funnels` with name | ✅ Covered |
| FR12 | Rename or delete saved funnel | Epic 3 | Story 3.2 — `PATCH /api/v1/funnels/:id`, `DELETE /api/v1/funnels/:id` | ✅ Covered |
| FR13 | Free tier: 1 saved funnel cap | Epic 3 | Story 3.3 — backend 403 `FUNNEL_LIMIT_EXCEEDED` | ✅ Covered |
| FR14 | Upgrade prompt at Free limit | Epic 3 | Story 3.3 — upgrade modal with CTA | ✅ Covered |
| FR15 | Browse blueprint library (filtered) | Epic 5 | Story 5.1 — `GET /api/v1/blueprints?industry=&use_case=` | ✅ Covered |
| FR16 | View blueprint description + rationale | Epic 5 | Story 5.1 — detail view showing full description | ✅ Covered |
| FR17 | Apply blueprint → pre-populate params | Epic 5 | Story 5.2 — `default_inputs` pre-populate simulation | ✅ Covered |
| FR18 | Customise blueprint-applied params | Epic 5 | Story 5.2 — every pre-populated parameter is editable | ✅ Covered |
| FR19 | Pro: share blueprint via public URL | Epic 5 | Story 5.3 — `POST /api/v1/blueprints` → `share_token` | ✅ Covered |
| FR20 | Unauthenticated visitor: view shared blueprint | Epic 5 | Story 5.3 — `GET /api/v1/blueprints/share/{shareToken}` no auth | ✅ Covered |
| FR21 | View saved funnels list in workspace | Epic 3 | Story 3.4 — `GET /api/v1/funnels` org-scoped | ✅ Covered |
| FR22 | Pro: unlimited saved funnels | Epic 3 | Story 3.3 — Pro save requests never blocked | ✅ Covered |
| FR23 | Upgrade Free → Pro (Stripe) | Epic 4 | Story 4.1 — `POST /api/v1/billing/checkout` → Stripe Checkout | ✅ Covered |
| FR24 | View plan / billing cycle / next date | Epic 4 | Story 4.2 — `GET /api/v1/billing/subscription` | ✅ Covered |
| FR25 | Update saved payment method | Epic 4 | Story 4.2 — Stripe Customer Portal via `POST /api/v1/billing/portal` | ✅ Covered |
| FR26 | Cancel subscription | Epic 4 | Story 4.3 — Stripe Customer Portal + `customer.subscription.deleted` webhook | ✅ Covered |
| FR27 | Email confirmation: activation + cancel | Epic 4 | Stories 4.1, 4.3 — Resend dispatched on both events | ✅ Covered |
| FR28 | View billing history | Epic 4 | Story 4.4 — `GET /api/v1/billing/invoices` from Stripe API | ✅ Covered |
| FR29 | Pro: export simulation as PDF | Epic 6 | Story 6.1 — `POST /api/v1/export/pdf` via Puppeteer | ✅ Covered |
| FR30 | PDF includes inputs, metrics, diagram | Epic 6 | Story 6.1 — all three components explicitly in AC | ✅ Covered |
| FR31 | Agency waitlist email submission | Epic 7 | Story 7.1 — `POST /api/v1/waitlist/agency` | ✅ Covered |
| FR32 | Operator notification on waitlist signup | Epic 7 | Story 7.1 — Resend notification to operator | ✅ Covered |
| FR33 | Transactional emails (4 types) | Epic 1 | Stories 1.1 (verify), 1.4 (reset), 4.1 (confirm), 4.3 (cancel) | ✅ Covered |
| FR34 | Cookie / analytics consent management | Epic 8 | Story 8.1 — consent banner + `PATCH /api/v1/users/me/consent` | ✅ Covered |
| FR35 | Self-serve GDPR data deletion | Epic 8 | Story 8.2 — `POST /api/v1/users/me/deletion-request` | ✅ Covered |
| FR36 | Free: duplicate funnel as unsaved sim | Epic 3 | Story 3.5 — "Duplicate" → unsaved draft, no DB record | ✅ Covered |

### Coverage Statistics

- **Total PRD FRs:** 36
- **FRs covered in epics:** 36
- **Coverage percentage: 100%**
- **Missing FRs:** 0

### Additional: NFR Coverage in Stories

| NFR | Addressed In | Status |
|---|---|---|
| NFR1 (sim <500ms / <2s e2e) | Story 3.1 AC | ✅ |
| NFR2 (dashboard <3s) | Stories 3.1, 3.4 AC | ✅ |
| NFR3 (blueprint <2s) | Story 5.1 AC | ✅ |
| NFR4 (PDF <10s) | Story 6.1 AC | ✅ |
| NFR5 (HTTPS) | Story 1.1 AC | ✅ |
| NFR6 (bcrypt 12 rounds) | Stories 1.1, 1.4 AC | ✅ |
| NFR7 (Stripe sig verify) | Story 4.1 AC | ✅ |
| NFR8 (parameterized queries) | E2 (Drizzle ORM) | ✅ |
| NFR9 (token rotation) | Story 1.3 AC | ✅ |
| NFR10 (org_id scoping) | Story 2.2 AC | ✅ |
| NFR11 (Sentry PII scrub) | Not in any story AC | ⚠️ Implied by architecture; no explicit test/AC |
| NFR12 (99.5% uptime) | Not in any story AC | ⚠️ Operational target; not story-testable |
| NFR13 (Stripe idempotency) | Stories 4.1, 4.3 AC | ✅ |
| NFR14 (DB backups) | Story 2.1 AC | ✅ |
| NFR15 (1,000 concurrent users) | Not in any story AC | ⚠️ Load testing concern; not story-testable |
| NFR16 (indexes, sub-100ms) | Story 2.2 AC | ✅ |
| NFR17 (stateless) | Architecture decision; all stories inherit | ✅ |
| NFR18 (cascade delete <24h) | Stories 1.6, 8.2 AC | ✅ |
| NFR19 (PostHog consent gate) | Story 8.1 AC | ✅ |
| NFR20 (EU-only data) | Story 8.2 AC + architecture | ✅ |
| NFR21 (DPAs) | Story 8.2 acceptance condition | ✅ |
| NFR22 (Stripe error surface) | Story 4.1 AC | ✅ |
| NFR23 (Resend retry) | Story 1.1 AC | ✅ |
| NFR24 (PostHog non-blocking) | Story 8.1 AC | ✅ |
| NFR25 (Sentry non-blocking) | Not in any story AC | ⚠️ Implied by architecture; no explicit AC |
| NFR26 (rate limiting) | Story 1.3 AC | ✅ |

**NFRs not covered by explicit story ACs:** NFR11, NFR12, NFR15, NFR25 — all four are operational or infrastructure concerns that cannot be expressed as per-story BDD acceptance criteria. NFR12 and NFR15 are infrastructure/scaling targets; NFR11 and NFR25 are SDK configuration concerns handled at architecture level. This is expected and acceptable.

---

## Section 4: UX Alignment Assessment

### UX Document Status

**Not Found — Accepted Omission**

No UX design document exists in `_bmad-output/planning-artifacts/`. This was confirmed in document discovery.

### Is UX Implied?

Yes. FunnelShop is a user-facing web application. The PRD includes rich user journey descriptions (Marco, Sarah, Operator journeys) and multiple UI-implied capabilities (drag-drop canvas, simulation output panel, blueprint picker, upgrade modal, workspace, billing page, consent banner).

### Scope Assessment — New vs. Carry-Forward UI

| UI Surface | Source | UX Risk |
|---|---|---|
| Drag-drop canvas | v1 carry-forward, unchanged | ✅ None — validated |
| Simulation output panel | v1 carry-forward, unchanged | ✅ None — validated |
| Blueprint picker | v1 carry-forward, unchanged | ✅ None — validated |
| Auth pages (register, login, verify, reset) | NEW — v2 | ⚠️ No UX spec; design system covers tokens only |
| Workspace / funnel list | NEW — v2 | ⚠️ No UX spec; design system covers tokens only |
| Billing / upgrade / pricing pages | NEW — v2 | ⚠️ No UX spec; design system covers tokens only |
| Account settings / deletion | NEW — v2 | ⚠️ No UX spec; design system covers tokens only |
| Cookie consent banner | NEW — v2 | ⚠️ No UX spec; design system covers tokens only |
| Agency waitlist form | NEW — v2 | ⚠️ No UX spec; design system covers tokens only |

### Architecture-UX Alignment

The architecture document provides structural coverage for v2 UI surfaces:

- ✅ `AuthContext` + `ProtectedRoute` pattern defined — auth state flow is specified
- ✅ Frontend file structure defined — new component directories: `auth/`, `billing/`, `export/`
- ✅ `GET /api/v1/users/me` hydration pattern specified — auth state loading behavior defined
- ✅ Stripe Checkout (hosted) + Customer Portal — eliminates custom billing UI design work for payment flows
- ✅ `tokens.css` design system documented in `project-context.md` — color, spacing, typography tokens available
- ✅ Tailwind CSS 4 for layout only (documented constraint)

### Upgrade Modal (FR13/FR14) — Primary Conversion Touchpoint

The upgrade modal (Story 3.3) is the single highest-stakes UI surface in the product. It is the primary Free→Pro conversion mechanism. Its copy, placement, and interaction pattern are undocumented — the story's AC specifies the trigger and content categories ("states the Free limit, the Pro benefit, and a CTA") but leaves layout and interaction design to the implementing developer. This is a **low-severity product risk**, not a blocker.

### Warnings

- ⚠️ Five new UI surfaces (auth, workspace, billing, account settings, consent) have no page-level UX spec. Dev agents will make independent layout and interaction decisions for these surfaces. This increases implementation variance but does not block delivery.
- ⚠️ Upgrade modal (Story 3.3) is the highest-stakes conversion surface and has no UX spec beyond AC content requirements.
- ✅ **Accepted:** Three v1 UI surfaces (canvas, simulation output, blueprints) are explicitly scoped as unchanged — zero UX risk on carry-forward components.
- ✅ **Mitigated:** Stripe-hosted Checkout and Customer Portal eliminate custom billing UI design work for payment and subscription management flows.

### UX Assessment Verdict

The UX gap is **conditionally acceptable** given: (1) v1 carry-forward surfaces are unchanged, (2) Stripe-hosted flows eliminate custom billing UI, and (3) the `tokens.css` design system provides a consistent visual foundation. The upgrade modal is a flagged risk but not a blocker. This is a **warning, not a critical issue**.

---

## Section 5: Epic Quality Review

**Beginning Epic Quality Review** — applying create-epics-and-stories best practices rigorously.

### Epic Structure Validation

#### E0: Server TypeScript Migration

| Check | Result |
|---|---|
| User-centric title? | ❌ No — technical migration |
| Describes user outcome? | ❌ No — no direct user value |
| Users benefit from E0 alone? | ❌ No |
| Epic can stand alone? | ✅ Yes — no dependencies |
| Stories appropriately sized? | ✅ Yes — 0.1 (toolchain), 0.2 (migrate) |
| BDD acceptance criteria? | ✅ Yes — specific, testable |
| No forward dependencies? | ✅ None |

**Verdict:** 🟠 Major — Technical infrastructure epic with no user value. **Brownfield justified:** Architecture explicitly designates this as "Story 0 — prerequisite for ALL v2 server work." The epics document is transparent: "FRs covered: None directly — technical prerequisite." For a brownfield TypeScript migration, this pattern is accepted. The deviation from user-value epic standards is **knowingly made and correctly documented**.

---

#### E1: User Authentication & Account Management

| Check | Result |
|---|---|
| User-centric title? | ✅ Yes — "Users can register, verify, log in…" |
| Describes user outcome? | ✅ Yes — complete auth lifecycle |
| Users benefit from E1 alone? | ✅ Yes |
| Epic can stand alone? | ✅ Depends on E0 only |
| Stories appropriately sized? | ✅ Yes — 6 focused stories |
| BDD acceptance criteria? | ✅ Yes — HTTP-level specificity |
| No forward dependencies? | ⚠️ See Story 1.6 below |

**Story 1.6 — Forward Dependency Concern:**
Story 1.6 (Account Deletion) AC states: "if the user has an active Pro subscription, the subscription is cancelled in Stripe before the deletion transaction begins (or a `409` is returned instructing the user to cancel first)." The Stripe cancellation path requires E4 (Billing). However, the AC provides an escape hatch: the `409` path allows Story 1.6 to be implemented independently of E4 — Free-tier users can be deleted without any billing integration. The Stripe cancellation path is addable when E4 is complete. **This is an ambiguity, not a hard blocker,** but the implementing developer must know which path to take in Story 1.6.

**Verdict:** ✅ Passes with one clarification needed on Story 1.6 implementation path.

---

#### E2: PostgreSQL + Drizzle + Multi-Tenant Schema

| Check | Result |
|---|---|
| User-centric title? | ❌ No — technical data infrastructure |
| Describes user outcome? | ❌ No — no direct user value |
| Users benefit from E2 alone? | ❌ No |
| Epic can stand alone? | ✅ Depends on E0, E1 |
| Stories appropriately sized? | ✅ Yes — 3 migration stories |
| BDD acceptance criteria? | ✅ Yes — schema-level specificity |
| No forward dependencies? | ✅ None |

**Drizzle Initialization Sequencing Note:**
Story 1.1 (in E1) includes the AC: "the Drizzle schema for `users`, `orgs`, `org_memberships`, and `email_verification_tokens` is established in this story as the first DB migration." Story 2.1 (in E2) then says "When Drizzle ORM and Drizzle Kit are installed and configured... all auth repository code from E1 uses the Drizzle client." This creates a mild sequencing ambiguity: Drizzle is partially used in E1 but formally set up in E2. In practice, Drizzle ORM must be installed as part of Story 1.1 for the AC to be satisfied, with E2 adding the formal Drizzle Kit migration file management on top. This is workable but the implementing developer should be aware of this two-phase Drizzle onboarding.

**Verdict:** 🟠 Major — Technical infrastructure epic (same brownfield justification as E0). Drizzle sequencing is a minor ambiguity, not a blocker.

---

#### E3: Funnel Simulation & Workspace

| Check | Result |
|---|---|
| User-centric title? | ✅ Yes — core product loop |
| Describes user outcome? | ✅ Yes |
| Users benefit from E3 alone? | ✅ Yes (with E0–E2) |
| Epic can stand alone? | ✅ Depends on E0, E1, E2 |
| Stories appropriately sized? | ✅ Yes — 5 stories, well-scoped |
| BDD acceptance criteria? | ✅ Yes — HTTP endpoints, error codes, behavior |
| No forward dependencies? | ⚠️ Story 3.3 CTA — see below |

**Story 3.3 CTA Forward Reference:**
The upgrade prompt modal (Story 3.3) includes "a CTA linking to the upgrade flow." The upgrade flow is Epic 4. However, a CTA link is not a functional dependency — it is a URL that can render as a placeholder link until E4 is complete. Story 3.3 can be accepted independently: the modal renders, the cap enforces, the link exists. E4 makes the link functional. **Minor UI concern, not a forward dependency blocker.**

**Database creation timing:** Story 1.1 creates auth tables; Story 2.2 creates funnels/simulation_results when first needed for E3. ✅ Correct pattern.

**Verdict:** ✅ Passes.

---

#### E4: Subscription & Billing

| Check | Result |
|---|---|
| User-centric title? | ✅ Yes — "The business model is live" |
| Describes user outcome? | ✅ Yes |
| Users benefit from E4 alone? | ✅ Yes (with E0–E2) |
| Epic can stand alone? | ✅ Depends on E0, E1, E2 |
| Stories appropriately sized? | ✅ Yes — 4 stories |
| BDD acceptance criteria? | ✅ Yes — Stripe events, webhook flows, idempotency |
| No forward dependencies? | ✅ None |

**Stripe event coverage verified:** `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed` — all four architecture-specified events handled in Stories 4.1 and 4.3.

**Verdict:** ✅ Passes.

---

#### E5: Blueprint Library

| Check | Result |
|---|---|
| User-centric title? | ✅ Yes |
| Describes user outcome? | ✅ Yes |
| Users benefit from E5 alone? | ✅ Yes (with E0–E3) |
| Epic can stand alone? | ✅ Depends on E0–E3 |
| Stories appropriately sized? | ✅ Yes — 3 stories |
| BDD acceptance criteria? | ✅ Yes — filter params, share token, auth bypass |
| No forward dependencies? | ✅ None |

**Verdict:** ✅ Passes.

---

#### E6: PDF Export

| Check | Result |
|---|---|
| User-centric title? | ✅ Yes |
| Describes user outcome? | ✅ Yes |
| Users benefit from E6 alone? | ✅ Yes (Pro users) |
| Epic can stand alone? | ✅ Depends on E0–E4 (Pro tier required) |
| Stories appropriately sized? | ✅ Single focused story |
| BDD acceptance criteria? | ✅ Yes — Puppeteer, file handling, stream, cleanup, timing |
| No forward dependencies? | ✅ None |

**Implementation specificity:** Story 6.1 ACs correctly specify: standalone HTML/CSS template (not React app), `/tmp` storage, stream + delete post-response, one browser instance per request. ✅ Implementation-ready.

**Verdict:** ✅ Passes.

---

#### E7: Agency Waitlist

| Check | Result |
|---|---|
| User-centric title? | ✅ Yes (visitor-facing) |
| Describes user outcome? | ✅ Yes |
| Users benefit from E7 alone? | ✅ Yes (with E0, E2) |
| Epic can stand alone? | ✅ Depends on E0, E2 only (table needed) |
| Stories appropriately sized? | ✅ Single focused story |
| BDD acceptance criteria? | ✅ Yes — idempotent duplicate email, operator notification, unauthenticated access |
| No forward dependencies? | ✅ None |

**Verdict:** ✅ Passes.

---

#### E8: GDPR & Privacy Compliance

| Check | Result |
|---|---|
| User-centric title? | ✅ Yes |
| Describes user outcome? | ✅ Yes |
| Users benefit from E8 alone? | ✅ Yes (with E0–E2) |
| Epic can stand alone? | ✅ Depends on E0, E1, E2 |
| Stories appropriately sized? | ✅ 2 stories |
| BDD acceptance criteria? | ✅ Yes — consent persistence, PostHog gate, cascade deletion, DPA prerequisite |
| No forward dependencies? | ✅ None |

**Story 8.2 DPA Note:** "Data Processing Agreements with Stripe, Resend, and Sentry are documented as a prerequisite acceptance condition for this story to be signed off" — this is an operational prerequisite, not a technical dependency. Correctly placed.

**Verdict:** ✅ Passes.

---

### Dependency Graph Validation

```
E0 (TS Migration)
  ↓
E1 (Auth) ← depends on E0
  ↓
E2 (DB Schema) ← depends on E0, E1
  ↓
E3 (Funnel/Workspace) ← depends on E0, E1, E2
E4 (Billing) ← depends on E0, E1, E2
E7 (Waitlist) ← depends on E0, E2
E8 (GDPR) ← depends on E0, E1, E2
  ↓ (from E3 + E4)
E5 (Blueprints) ← depends on E0–E3
E6 (PDF Export) ← depends on E0–E4
```

**Cycle check:** ✅ No circular dependencies.
**Forward reference check:** E3 and E4 can proceed in parallel after E2. E5 and E6 correctly wait for E3/E4 completion.

### Best Practices Compliance Summary

| Epic | User Value | Independent | Sized OK | No Forward Deps | DB Timing OK | BDD ACs | FR Traced |
|---|---|---|---|---|---|---|---|
| E0 | ❌ | ✅ | ✅ | ✅ | n/a | ✅ | n/a |
| E1 | ✅ | ✅ | ✅ | ⚠️ 1.6 ambiguous | ✅ | ✅ | ✅ |
| E2 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ | n/a |
| E3 | ✅ | ✅ | ✅ | ⚠️ 3.3 minor | ✅ | ✅ | ✅ |
| E4 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| E5 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| E6 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| E7 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| E8 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

### Quality Violations Register

| # | Severity | Epic/Story | Violation | Remediation |
|---|---|---|---|---|
| 1 | 🟠 Major | E0 | Technical infrastructure epic — no user value | Brownfield-justified; correctly labelled as "technical prerequisite"; no action required |
| 2 | 🟠 Major | E2 | Technical infrastructure epic — no user value | Brownfield-justified; correctly labelled as "technical prerequisite"; no action required |
| 3 | 🟡 Minor | Story 1.6 | Implementation path ambiguity: 409 path vs. Stripe-cancel path — which does the dev implement? | Add a clarifying note to Story 1.6: implement the 409 path in E1; add Stripe cancellation integration as an AC amendment when E4 is merged |
| 4 | 🟡 Minor | Story 3.3 | CTA "linking to the upgrade flow" references E4 functionality | Acceptable — CTA is a URL; Story 3.3 can pass with a placeholder route; no action required |
| 5 | 🟡 Minor | E1/E2 | Drizzle initialization split across E1 (first use) and E2 (formal setup) creates sequencing ambiguity | Add implementation note: Drizzle ORM is installed as part of Story 1.1; E2 Story 2.1 adds Drizzle Kit and migration file management |
| 6 | 🟡 Minor | NFR11, NFR25 | Sentry PII scrubbing and Sentry non-blocking behaviour not covered by explicit story ACs | Add Sentry configuration as an AC in E0 Story 0.1 or E1 Story 1.3 (when observability is first configured) |

---

## Section 6: Summary and Final Recommendations

### Overall Readiness Status

## ✅ READY

All 36/36 FRs are traced to specific stories with HTTP-level acceptance criteria. All 9 epics are properly structured with correct dependency ordering. No blocking issues were found. Implementation can begin immediately with E0.

---

### Issue Register (Full)

| # | Severity | Section | Issue | Blocking? |
|---|---|---|---|---|
| 1 | 🟠 Major | Epic Quality | E0 is a technical infrastructure epic — no direct user value | **NO** — brownfield-justified, correctly labelled |
| 2 | 🟠 Major | Epic Quality | E2 is a technical infrastructure epic — no direct user value | **NO** — brownfield-justified, correctly labelled |
| 3 | ⚠️ Warning | UX | 5 new UI surfaces (auth, workspace, billing, account settings, consent) have no UX spec | **NO** — design system provides tokens; acceptable variance |
| 4 | ⚠️ Warning | UX | Upgrade modal (FR13/FR14) — primary Free→Pro conversion touchpoint — has no UX spec | **NO** — AC specifies content requirements; layout left to developer |
| 5 | 🟡 Minor | Epic Quality | Story 1.6 implementation path ambiguity: 409 vs Stripe-cancel on Pro subscription deletion | **NO** — add clarifying note to story |
| 6 | 🟡 Minor | Epic Quality | Story 3.3 CTA references E4 upgrade flow before E4 exists | **NO** — CTA can be a placeholder URL |
| 7 | 🟡 Minor | Epic Quality | Drizzle initialization split across E1/E2 — sequencing ambiguity for implementing developer | **NO** — add implementation note |
| 8 | 🟡 Minor | Coverage | NFR11 (Sentry PII scrub) and NFR25 (Sentry non-blocking) not in any story AC | **NO** — operational config concern; add to observability setup story |
| 9 | 🟡 Minor | PRD | FR36 appears out of numeric section order (cosmetic authoring artifact) | **NO** — cosmetic only |
| 10 | 🟡 Minor | PRD | NFR26 in Security section but numbered 26 (cosmetic authoring artifact) | **NO** — cosmetic only |

**Total issues: 10** — 0 critical (blocking), 2 major (non-blocking, brownfield-justified), 2 warnings (non-blocking), 6 minor (cosmetic or clarification-level)

---

### What Is In Excellent Shape

- ✅ **PRD:** Complete, thorough, 36 FRs + 26 NFRs, rich user journeys, measurable success criteria, all out-of-scope items labelled, GDPR compliance requirements specific and implementation-ready
- ✅ **Architecture:** Deep and well-reasoned — covers multi-tenancy, auth, billing, PDF export, observability, brownfield migration, and code patterns with explicit technology decisions and rationale
- ✅ **Epics:** All 9 epics properly structured; all 27 stories sized appropriately; HTTP-level acceptance criteria with specific endpoints, response codes, and error conditions
- ✅ **FR Traceability:** 36/36 FRs traced to specific stories — complete coverage, zero gaps
- ✅ **Dependency ordering:** No circular dependencies; E3/E4 can proceed in parallel after E2; correct brownfield sequencing (E0 first, always)
- ✅ **Stripe coverage:** All four webhook events (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`) covered in story ACs with idempotency handling specified
- ✅ **Security:** Rate limiting, bcrypt rounds, JWT httpOnly cookies, org_id scoping, Stripe signature verification — all explicitly in story ACs
- ✅ **Project Context:** Ready to accompany individual story files as dev agent operational context

---

### Recommended Actions Before Sprint 1

1. **Story 1.6 clarification (5 minutes):** Add a single implementation note to Story 1.6: "In E1, implement the 409 path (instruct Pro users to cancel before deleting). The full Stripe subscription cancellation-on-delete path is implemented when E4 is merged — amend Story 1.6 at that point." This prevents the implementing developer from making an incorrect assumption.

2. **Sentry AC gap (optional):** Add "Sentry SDK is configured with EU endpoint, PII scrubbing enabled (`body.password`, `req.headers.authorization`, user email), and SDK failure does not affect server response" as an AC to Story 0.1 or 1.3. This gives NFR11 and NFR25 an explicit verification point.

3. **Upgrade modal quick spec (optional):** Author a 1-page quick spec for the upgrade modal (Story 3.3). Copy, placement, and interaction pattern for the primary Free→Pro conversion touchpoint. This is the highest-leverage UX investment — 30 minutes of design that protects the core conversion path.

4. **Drizzle implementation note:** Note in Story 1.1: "Drizzle ORM package is installed and the initial schema is committed here. Drizzle Kit and formal migration file management are formalized in E2 Story 2.1."

### Final Note

This assessment identified **10 issues across 4 categories**: 0 blocking, 2 major (both brownfield-justified infrastructure epics), 2 warnings (UX gaps), 6 minor (clarifications and cosmetic artifacts). The planning foundation is production-grade — PRD and architecture are among the strongest inputs this workflow has evaluated. The epics are complete, correct, and immediately actionable. Sprint 1 can begin with E0 Story 0.1 without further planning work.

---

**Assessment completed:** 2026-02-27
**Assessor:** Winston (BMad Architect Agent)
**Report file:** `_bmad-output/planning-artifacts/implementation-readiness-report-2026-02-27.md`

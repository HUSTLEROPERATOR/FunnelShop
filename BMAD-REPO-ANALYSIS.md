# BMad Method v6 — GitHub Repo Analysis
**Account:** HUSTLEROPERATOR
**Analysis Date:** 2026-02-25
**Scope:** All accessible repositories (14 total: 8 original, 6 forks)

---

## Ranked Table — Original Repositories

| # | Repo | Type | State | Complexity | BMad Score | Reason |
|---|------|------|-------|------------|-----------|--------|
| 1 | **Ristorazione-Pro-League** | Platform / Ecosystem | Active prototype | ★★★★★ Very High | **5/5** | Massive multi-module platform (profiles, auditing, reputation, fair-play finance, awards, training). Has roadmap, sprints, issue templates, backend API. Urgently needs PM for scope, Architect for data model, Dev for each module, QA for audit flows. PRD missing entirely. |
| 2 | **FunnelShop** | Full-stack SaaS | Active | ★★★★ High | **4/5** | React+TS frontend + Express API + simulation engine + blueprint system. Clear product scope, test coverage, CI patterns. Needs PRD to define v2 features, Architect for DB persistence layer, Dev agents per module, QA for simulation accuracy. |
| 3 | **RESTAURANT-AGENT** | AI Agent / API | Early prototype | ★★★ Medium | **3/5** | Python backend + AI agent for restaurant ops. Has v0.1→v0.3 roadmap, CI workflow, good contributor scaffolding. Needs Architect for agent design (embeddings, forecast, auth), Dev to build out modules, QA for API coverage. Scope clear but narrow today. |
| 4 | **vecchia-fattoria-app** | Full-stack App | Prototype | ★★★ Medium | **3/5** | Next.js + Firebase + Telegram Bot + Google Drive + food cost calc. Multi-service integration that needs careful Architect design (auth flows, data sync). Would benefit from PM to define user journeys and QA for service integration testing. |
| 5 | **Notion-API-Checklist-Automation** | API Integration / Automation | Completed spec | ★ Simple | **2/5** | OpenAPI 3.1 schema connecting GPT/MCP to Notion. Well-scoped, single deliverable. If this grows to a full MCP tool server with multiple endpoints/auth flows, BMad becomes relevant. Currently too small. |
| 6 | **chiave-della-fattoria** | Landing Page | Active | ★ Simple | **1/5** | Single HTML/JS landing for recipe-gated access (Vecchia Fattoria). Fully self-contained. No lifecycle, no components, no agents needed. |
| 7 | **PythonAIAgentin10Minutes** | AI Agent Demo | Tutorial / Demo | ★ Simple | **1/5** | LangChain + LangGraph ReAct agent tutorial (DataGen). Single script, educational. Not a product. |
| 8 | **DinoStage** | Unknown | Abandoned/Empty | — | **0/5** | Empty repo (0 files, 0 commits pushed). No basis for evaluation. |

---

## Forked Repositories (Reference Only)

These are upstream forks — not original HUSTLEROPERATOR work. Excluded from BMad scoring.

| Repo | Original Author | Purpose |
|------|----------------|---------|
| ai-comic-factory | Hugging Face | LLM + SDXL comic panel generator |
| n8n | n8n-io | Workflow automation platform |
| opencode | sst | Open-source coding agent |
| OpenAiTx | - | Auto-translate GitHub READMEs |
| kdp_quarto | - | Quarto template for Amazon KDP books |
| magic-of-css | adamschwartz | CSS course |
| smart-magic-cards | - | Magic trick onboarding demo |

---

## Deep Dives on Top Candidates

### 1. Ristorazione-Pro-League — BMad Score: 5/5

**What it is:** A meritocratic ecosystem for the Italian restaurant industry. Think "professional league" with verified profiles, reputation scoring, financial compliance (Fair Play), awards, training, and a regional pilot (Sardinia).

**Why BMad fits perfectly:**
- **PRD needed:** The vision is described in prose/markdown. No formal Product Requirements Document exists. A BMad PM agent would produce the PRD, user stories, acceptance criteria.
- **Multi-module architecture:** 8+ core modules (Identity, Auditing, Reputation, Fair Play Finance, Awards, Training, Pilot, Marketplace) require dedicated Architect work — schema design, API contracts, service boundaries.
- **Structured sprint lifecycle:** Roadmap shows Sprint 0→3 but no tasks decomposed. BMad Dev agents can own each sprint backlog.
- **QA critical:** Reputation scores and financial auditing require rigorous validation. A QA agent with formal test plans is essential.
- **Current gap:** Only has HTML prototype + backend shell + documentation. No real MVP code.

**Recommended BMad entry point:** Start with PM agent to produce PRD → Architect to design DB schema and API contracts → break into epics by module.

---

### 2. FunnelShop — BMad Score: 4/5

**What it is:** Drag-and-drop funnel builder with live simulation for restaurants. React 19 + TypeScript + Vite frontend, Node.js/Express backend, in-memory storage, blueprint templates.

**Why BMad fits:**
- **Defined product scope:** Clear value prop (build → configure → simulate funnels), but no v2 PRD exists.
- **Multiple components:** Canvas (react-dnd), simulation engine, scenario manager, blueprint system, REST API — each is a BMad epic.
- **Structured lifecycle:** Already has Vitest + Jest, ESLint, 92.5% server coverage — foundation for BMad QA agent.
- **Dev agent value:** Frontend (canvas UX), Backend (real DB persistence), Simulation (advanced math), Auth (user accounts) — each maps to a Dev agent workstream.

**Current gap:** In-memory storage is the #1 blocker for production. No auth. No deployment config.

**Recommended BMad entry point:** PM agent defines v2 PRD (persistence, auth, deployment) → Architect designs data model (PostgreSQL/SQLite schema) → Dev agents per epic.

---

### 3. RESTAURANT-AGENT — BMad Score: 3/5

**What it is:** Python backend with AI agent capabilities for restaurant management. Early demo stage with seed DB, simple backend, and a clear v0.1→v0.3 roadmap.

**Why BMad partially fits:**
- **Scope defined:** Roadmap has explicit feature phases (embeddings for receipts/invoices, forecast endpoint, auth + roles).
- **AI agent complexity:** Combining LLM, vector embeddings, REST API, and CSV processing needs Architect guidance.
- **Currently too small:** Only `simple_backend.py` + seed script exist. BMad overhead would exceed the current codebase.

**Recommended BMad entry point:** When moving from demo → v0.2 (React frontend + Inventory API), start BMad with Architect agent for the AI pipeline design.

---

### 4. vecchia-fattoria-app — BMad Score: 3/5

**What it is:** Food cost management app for "Vecchia Fattoria" restaurant. Next.js + Firebase (auth + Firestore) + Telegram Bot + Google Drive integration + food cost calculator.

**Why BMad partially fits:**
- **Real integrations:** 4 external services (Firebase, Telegram, Google Drive, Firestore) — Architect agent needed to design sync strategy and error handling.
- **User journeys undefined:** Login → ingredient management → recipe creation → food cost calc flow needs PM formalization.
- **Currently prototype:** `.env` committed (security issue), `build.log` committed — needs QA agent for baseline hygiene.

**Recommended BMad entry point:** PM agent to define user journeys → QA agent to establish security checklist and test baseline.

---

## BMad Priority Recommendation

```
Priority 1: Ristorazione-Pro-League  (most ambitious, most gaps, highest ROI from BMad)
Priority 2: FunnelShop               (active, closest to shippable, clear next steps)
Priority 3: RESTAURANT-AGENT         (good foundation, BMad when v0.2 starts)
Priority 4: vecchia-fattoria-app     (real app, needs PM + security baseline first)
```

---

## Scoring Rubric

| Criterion | Weight | Details |
|-----------|--------|---------|
| Has defined product scope → needs PRD | 25% | Is the scope big/complex enough to warrant a formal PRD? |
| Multiple components/agents involved | 25% | Frontend, backend, DB, AI, integrations, etc. |
| Requires structured development lifecycle | 25% | Sprints, epics, QA cycles, CI/CD |
| Would benefit from specialized agents | 25% | PM, Architect, Dev (per domain), QA — are all 4 useful? |

**Score 5/5:** All 4 criteria strongly met — BMad is essential
**Score 4/5:** 3 criteria strongly met, 1 partially — BMad adds significant value
**Score 3/5:** 2-3 criteria met — BMad useful at specific phases
**Score 2/5:** 1-2 criteria met — BMad adds minor value
**Score 1/5:** No criteria meaningfully met — BMad overhead not justified

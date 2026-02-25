---
project_name: 'FunnelShop'
user_name: 'Root'
date: '2026-02-25'
sections_completed: ['technology_stack', 'language_rules', 'framework_rules', 'testing_rules', 'code_quality_rules', 'workflow_rules', 'critical_rules']
status: complete
existing_patterns_found: 18
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Monorepo** — root workspace with `/client` (TypeScript/React) and `/server` (JavaScript/Node).

### Core Technologies
- Node.js: >=20.0.0
- React: ^19.2.0
- TypeScript: ~5.9.3 (client only — server is plain JS)
- Vite: ^7.3.1 (dev server port 3000, proxies `/api` → port 5000)
- Express: ^5.2.1
- Tailwind CSS: ^4.1.18 (via @tailwindcss/postcss)

### Key Dependencies
- lucide-react: ^0.574.0 (icon library)
- react-dnd + react-dnd-html5-backend: ^16.0.1 (drag-and-drop)
- dotenv: ^17.3.1 (server env config)
- cors: ^2.8.6 (server CORS)

### Testing
- Client: Vitest ^4.0.18 + @testing-library/react ^16.3.2 + jsdom ^28.1.0
- Server: Jest ^30.2.0 + supertest ^7.2.2

### Dev Tools
- ESLint: ^9.x (flat config format on both client and server)
- nodemon: ^3.1.11 (server auto-reload)
- concurrently: ^8.2.2 (root-level parallel dev scripts)

### ⚠️ Technical Debt — Architecture Decision Required
The server is **plain JavaScript (CommonJS)** while the client is **TypeScript (ESM)**. This is a conscious split in v1, not an oversight. The v2 architecture must make an explicit decision: **migrate server to TypeScript** or **maintain the JS/TS split**. Winston (Architect) must address this before any v2 server implementation begins.

## Critical Implementation Rules

### Language-Specific Rules

#### Module Systems — Critical Split
- **Client** (`/client`): ESM — use `import`/`export` exclusively
- **Server** (`/server`): CommonJS — use `require()`/`module.exports` exclusively
- Never mix module systems within a package. Adding a new server file means `require()`, not `import`.
- Server exports app for testing: `module.exports = { app, server }`
- ⚠️ **Migration-sensitive**: The server module system must not be changed until Winston (Architect) makes the v2 TS migration decision. Do **not** add new server files using `import`/`export` until that decision is documented and approved.

#### TypeScript — Client Strict Mode
`tsconfig.app.json` has all strict flags enabled — agents must satisfy all of them:
- `strict: true`
- `noUnusedLocals: true` — no unused variables allowed
- `noUnusedParameters: true` — prefix intentionally unused params with `_`
- `erasableSyntaxOnly: true` — avoid non-erasable TS syntax (e.g. `enum`, `namespace`)
- `noFallthroughCasesInSwitch: true`
- `noUncheckedSideEffectImports: true`
- `verbatimModuleSyntax: true` — use `import type` for type-only imports

#### Import Conventions
- Type-only imports use `import type { Foo }` (required by `verbatimModuleSyntax`)
- No `.ts`/`.tsx` file extensions in import paths (bundler mode handles resolution)
- All shared types live in `client/src/types/index.ts` — do not redeclare types inline

#### Error Handling
- Server: unused Express error handler args prefixed with `_` (e.g. `_next`)
- ESLint rule: `no-unused-vars: ['error', { argsIgnorePattern: '^_' }]` on both sides
- Server logs errors as structured objects with `timestamp`, `method`, `path`, `error`

### Framework-Specific Rules

#### React — State & Component Architecture
- All application state lives in `App.tsx` — no external state manager (no Redux, Zustand, etc.)
- Components receive state and callbacks via props; they do not fetch or mutate global state directly
- Named exports for all components: `export const Sidebar: React.FC<Props> = ...`
- `App.tsx` is the only default export in the component tree
- Component-local prop interfaces are defined inline in the component file, not in `types/index.ts`
- `types/index.ts` is for shared domain types only (`FunnelComponent`, `GlobalParameters`, etc.)

#### React — Hooks Patterns
- Define `useCallback` for handlers passed to child components to avoid unnecessary re-renders
- `useCallback` deps must include all referenced state/handlers (e.g. `deleteComponent` depends on `selectedComponentId`)
- Keyboard event listeners go in `useEffect` with `window.addEventListener` / cleanup `removeEventListener`
- Metrics are computed inline on every render (`const metrics = calculateMetrics(...)`) — no memoization currently; do not add `useMemo` unless a story explicitly calls for it

#### React — ID Generation
- Component IDs: `${type}-${Date.now()}` (e.g. `google-ads-1748293847123`)
- Connection IDs: `conn-${Date.now()}`
- Do not use UUID libraries — maintain the existing pattern

#### React — Drag & Drop
- Drag and drop uses the **HTML5 native API** (`e.dataTransfer`) directly on the Canvas, not react-dnd hooks
- `react-dnd` is installed but not actively used in v1 — do not add react-dnd hooks without a story requiring it

#### React — API Calls
- All API calls use `const API_BASE = '/api'` (defined at module level in `App.tsx`) — never hardcode full URLs
- Vite proxy forwards `/api/*` to `http://localhost:5000` — this is **dev-only**
- ⚠️ **Open architecture decision**: Production API routing is undefined. Options are nginx reverse proxy, same-origin deployment, or environment-based `API_BASE`. Winston must resolve this in the v2 architecture before any production deployment story is written.
- Fetch errors are caught with `try/catch`; user feedback via `alert()` (no toast library in v1)

#### Express — Server Patterns
- ⚠️ **Refactor required for v2**: `server/index.js` is a single-file server. It will not scale to v2 features (auth, billing, multi-tenancy, GDPR deletion). Winston must include a route-module refactor story in the v2 architecture before any new endpoints are added. Do not add new routes to `index.js` without that architecture story in place.
- In-memory storage: `dataStore.scenarios` is a `Map()`, `dataStore.blueprints` is a static array — no database in v1
- Scenario IDs generated server-side: `scenario-${dataStore.nextScenarioId++}`
- Validation middleware (`validateScenarioData`) runs before POST and PUT scenario routes
- Rates/percentages stored and validated as decimals (0–1), never as percentages (0–100)
- `profitMargin` must be between 0 and 1 — validated explicitly on server
- All numeric component properties must be non-negative — validated on server

### Testing Rules

#### Client Testing — Vitest + React Testing Library
- Test runner: `vitest` with `globals: true` and `environment: 'jsdom'`
- Setup file: `client/src/test/setup.ts` — imports `@testing-library/jest-dom` for DOM matchers
- Config: `client/vitest.config.ts` — separate from `vite.config.ts`; uses `@vitejs/plugin-react`
- Run client tests: `cd client && npm test` (runs `vitest run` — single pass, no watch)
- Test files: co-located with source, named `*.test.ts` or `*.test.tsx`
- Use `import { describe, it, expect, vi }` from `vitest` — do not use `jest` globals on client
- Use `vi.spyOn()` for spies/mocks, not `jest.spyOn()`
- Component tests use `render` + `screen` from `@testing-library/react`

#### Server Testing — Jest + Supertest
- Test runner: `jest` with `--coverage` flag
- Test files: co-located with source, named `*.test.js`
- Use `require('supertest')` and `require('./index')` — CommonJS imports only
- Always close the server in `afterAll`: `server.close(done)`
- Test the full HTTP layer via supertest — do not unit test route handlers in isolation
- Jest globals (`describe`, `it`, `expect`, `beforeAll`, `afterAll`, etc.) are defined in `eslint.config.js` — no import needed
- ⚠️ **Migration-sensitive**: Current server tests hit in-memory `dataStore` directly. When PostgreSQL replaces `Map()` storage, the entire server test suite requires a database test strategy. Winston must define this in the v2 architecture (options: test containers, SQLite swap, pg mock library). Do not write new server tests against a real database without this decision being documented first.

#### Cross-Cutting Testing Rules
- Never import Vitest utilities (`vi`, `vitest`) in server test files
- Never use `require` or Jest globals in client test files
- Loyal customers = 30% of bookings — assert with `Math.round(bookings * 0.3)`, not a hardcoded value
- Cycle detection must log `console.warn` containing `'Cycle detected'` — test with `vi.spyOn(console, 'warn')`
- Test both `calculateMetrics` modes: with connections (graph) and without (simple aggregation)

### Code Quality & Style Rules

#### ESLint Configuration
- Both client and server use ESLint v9 **flat config** format (`eslint.config.js`) — not `.eslintrc`
- Client config: `client/eslint.config.js` — applies to `**/*.{ts,tsx}` only; extends `typescript-eslint`, `react-hooks`, and `react-refresh` recommended configs
- Server config: `server/eslint.config.js` — plain JS rules; all Jest globals declared manually
- Run linting: `npm run lint` from root (runs both sides via concurrently)

#### Naming Conventions
- React component files: `PascalCase.tsx` (e.g. `MetricsPanel.tsx`, `ConfigPanel.tsx`)
- Utility files: `camelCase.ts` (e.g. `calculateMetrics.ts`)
- Test files: same name as source + `.test.ts` / `.test.tsx` (e.g. `calculateMetrics.test.ts`)
- Component types/IDs in data model: `kebab-case` strings (e.g. `'google-ads'`, `'booking-form'`, `'landing-page'`)
- CSS utility classes: `kebab-case` (e.g. `.btn-primary`, `.surface-raised`, `.text-metric-label`)

#### Styling System — Design Tokens First
- All visual values (color, spacing, radius, shadow, typography) come from CSS custom properties defined in `client/src/tokens.css`
- Apply tokens via inline `style={{ color: 'var(--color-text-primary)' }}` — not arbitrary Tailwind values
- Tailwind is used **for layout only**: `flex`, `flex-1`, `h-screen`, `overflow-hidden`, `relative`, `absolute`, `inset-0`, `sticky`, `top-0`, `z-*`, `items-center`, `justify-*`, `grid`
- Do **not** use Tailwind for color, spacing, typography, border-radius, or shadow — use the token variables
- Available token namespaces: `--color-*`, `--space-*`, `--radius-*`, `--shadow-*`, `--text-*`, `--weight-*`, `--tracking-*`, `--leading-*`, `--transition-*`
- Button variants: `.btn` base + `.btn-primary`, `.btn-ghost`, `.btn-danger`, `.btn-success`, `.btn-purple`, `.btn-icon`
- Input fields: `.control-input` class; Surface variants: `.surface` (subtle) and `.surface-raised` (elevated)
- Font: Inter as `--font-sans`; always applied via CSS variable, not Tailwind's `font-sans`
- ⚠️ **v2 scale rule**: v2 introduces 8–10 net-new UI surfaces (auth pages, billing UI, workspace dashboard, PDF export template, admin screens). All must use existing token namespaces exclusively. If a new visual value is needed (new color, new spacing step, etc.), it must be added to `tokens.css` first — never inline arbitrary values or introduce new Tailwind color/spacing utilities directly in components.

#### Code Organization
- No barrel files (`index.ts` re-exports) — import directly from source files
- Client structure: `src/components/`, `src/utils/`, `src/types/`, `src/test/`
- No separate `routes/`, `controllers/`, or `services/` folders in v1 server — all in `index.js`
- ⚠️ **v2 route modules**: When Winston creates v2 route modules (auth, billing, funnels, admin), the no-barrel-files rule still applies — import directly from each route file, never via an `index.js` re-export layer

### Development Workflow Rules

#### Local Development
- Start both services: `npm run dev` from root (uses `concurrently`)
- Client only: `npm run dev:client` → Vite on port 3000
- Server only: `npm run dev:server` → nodemon on port 5000
- Install all deps: `npm run install:all` from root
- Build: `npm run build` (client: `tsc -b && vite build`; server: no build step)

#### Environment Configuration
- Server reads env via `dotenv` — expects a `.env` file in `server/`
- Key env vars: `PORT` (default 5000), `CORS_ORIGIN` (default `http://localhost:3000`), `NODE_ENV`
- Server stack trace included in error responses only when `NODE_ENV === 'development'`
- **Never commit `.env` or secrets** — root `.gitignore` covers `.env` patterns; there is no `server/.gitignore`, so the root rule is the only guard
- ⚠️ **Security debt — verify before v2 credentials**: The BMad repo analysis flagged that `.env` may have been committed at some point. Before adding real credentials (PostgreSQL, Stripe, Resend, Sentry) for v2:
  1. Confirm root `.gitignore` explicitly covers `server/.env` (currently covers `.env` generically — sufficient, but worth making explicit)
  2. Run `git log --all --full-history -- "**/.env" "server/.env"` to confirm no `.env` appears in git history
  3. If any secrets were committed, rotate all affected keys immediately before continuing
  4. A leaked Stripe key on a public repo is an immediate financial liability — do not skip this check
- _Verification run during context generation (2026-02-25): `git log` returned no `.env` history — clean as of this date_

#### Git & Branch Strategy
- Feature branches follow pattern: `claude/<feature>-<id>` (e.g. `claude/generate-project-context-AR6kt`)
- Commit messages: imperative mood, present tense (e.g. `feat: add validation middleware`)
- Run `npm run lint` and `npm test` before committing — both must pass clean
- Server has graceful shutdown on `SIGTERM` / `SIGINT` — do not bypass with `process.exit(0)` directly

#### Scripts Reference
| Command | What it does |
|---|---|
| `npm run dev` | Start client + server concurrently |
| `npm run build` | Build client (TS + Vite); server has no build step |
| `npm run test` | Run client (Vitest) + server (Jest) tests |
| `npm run lint` | Lint client (ESLint ts/tsx) + server (ESLint js) |
| `cd client && npm run test:watch` | Vitest in watch mode |
| `cd server && npm run test:watch` | Jest in watch mode |

### Critical Don't-Miss Rules

#### Things That Will Break Silently
- Vitest and Jest cannot share globals — wrong import crashes the wrong test runner with a cryptic module error, not a clear test failure
- ESLint v9 flat config: using `.eslintrc` format causes silent no-op linting, not an error — verify with `npm run lint` output
- Tailwind color utilities applied directly will render but bypass the design token system — looks correct in dev, breaks theme consistency at scale
- `calculateMetrics` without connections returns raw step totals, not graph-traversal values — wrong call site = wrong numbers with no runtime error

#### v2 Migration Tripwires
- **In-memory → PostgreSQL**: all server tests hit `dataStore` (Map) directly. They will pass against Map() and fail (or produce false positives) against Postgres without a defined DB test strategy first
- **Auth added to routes**: all existing funnel endpoints currently have no auth. Adding middleware to some but not all creates silent security gaps — audit every route when auth lands
- **Multi-tenancy** _(highest-severity risk in this document)_: `org_id` / `userId` scoping must be applied to EVERY data read and write, not just creation. A single missing query filter is a cross-workspace data leak with no runtime error to signal it.

#### Absolute Rules (Never Break)
- Never import Vitest in server test files
- Never use Tailwind for color, spacing, or typography — design tokens only (`tokens.css`)
- Never create barrel `index.ts` re-export files
- Never commit `.env` or secrets
- Never push to a branch other than the designated `claude/` branch
- Never add auth middleware to selected routes only — when auth lands, ALL endpoints must be audited and covered in the same PR. Partial auth is a security gap by design, not a TODO.
- Never write new server-side code in plain JS after the architecture decision to migrate to TypeScript — a mixed TS/JS server is harder to maintain and type-check than either pure choice. Once the migration decision is made, all new server files are `.ts`.

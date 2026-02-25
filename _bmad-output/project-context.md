---
project_name: 'FunnelShop'
user_name: 'Root'
date: '2026-02-25'
sections_completed: ['technology_stack', 'language_rules']
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

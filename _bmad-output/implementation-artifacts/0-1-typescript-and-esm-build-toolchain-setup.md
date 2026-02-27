# Story 0.1: TypeScript and ESM Build Toolchain Setup

Status: ready-for-dev

## Story

As a developer,
I want the server build toolchain configured for strict ESM TypeScript,
so that all subsequent v2 server development can be written in type-safe TypeScript with ESM module syntax.

## Acceptance Criteria

**AC1 — Build pipeline:**
- Given the server currently runs as CommonJS JavaScript
- When `npm run build` is executed from `/server/`
- Then `tsc` compiles all `.ts` files to `/server/dist/` without type errors
- And the `dist/` output uses ESM syntax (`import`/`export`)

**AC2 — Dev server:**
- Given the TypeScript toolchain is configured
- When `npm run dev` is executed from `/server/` (or via root `npm run dev:server`)
- Then the server starts via `tsx watch index.ts` with hot reload
- And `GET /api/health` returns `200 { status: 'ok', ... }`
- And saving a change to `index.ts` restarts the server automatically

**AC3 — Package configuration:**
- When `server/package.json` is inspected
- Then `"type": "module"` is present
- And `scripts.dev` is `"tsx watch index.ts"`
- And `scripts.build` is `"tsc --project tsconfig.json"`
- And `scripts.start` is `"node dist/index.js"`
- And `devDependencies` includes: `typescript`, `tsx`, `@types/node`, `@types/express`, `@types/cors`

**AC4 — tsconfig:**
- When `server/tsconfig.json` is inspected
- Then `compilerOptions.module` is `"NodeNext"`
- And `compilerOptions.moduleResolution` is `"NodeNext"`
- And `compilerOptions.target` is `"ES2022"`
- And `compilerOptions.strict` is `true`
- And `compilerOptions.outDir` is `"./dist"`

**AC5 — Entry point conversion:**
- When `server/index.ts` is inspected
- Then `index.js` no longer exists (renamed)
- And all `require()` calls are replaced with `import`
- And `module.exports = { app, server }` is replaced with `export { app, server }`
- And `import 'dotenv/config'` replaces `require('dotenv').config()`
- And the server handles all existing API routes unchanged

**AC6 — Test suite:**
- When `npm test` is executed from `/server/`
- Then all 18 existing test cases pass without any change to test logic or assertions
- And Jest is configured to transform `.ts` files and handle ESM modules
- And `index.test.ts` imports via ESM: `import { app, server } from './index.js'`

## Tasks / Subtasks

- [ ] **Install TypeScript packages** (AC3)
  - [ ] `npm install -D typescript@~5.9 tsx @types/node @types/express @types/cors` in `/server/`
  - [ ] Verify `typescript` version matches client's `~5.9.3` (project-context consistency)

- [ ] **Create `server/tsconfig.json`** (AC4)
  - [ ] Set `module: NodeNext`, `moduleResolution: NodeNext`, `target: ES2022`
  - [ ] Set `strict: true`, `outDir: ./dist`, `rootDir: .`
  - [ ] Set `esModuleInterop: true`, `skipLibCheck: true`, `forceConsistentCasingInFileNames: true`
  - [ ] Include: `["./**/*.ts"]`, Exclude: `["node_modules", "dist", "**/*.test.ts"]`

- [ ] **Update `server/package.json`** (AC3)
  - [ ] Change `"type": "commonjs"` → `"type": "module"`
  - [ ] Update `scripts.dev` → `"tsx watch index.ts"`
  - [ ] Update `scripts.build` → `"tsc --project tsconfig.json"`
  - [ ] Update `scripts.start` → `"node dist/index.js"`
  - [ ] Change `"main": "index.js"` → `"main": "dist/index.js"`

- [ ] **Fix ESLint config for ESM** (see Dev Notes — critical)
  - [ ] Rename `server/eslint.config.js` → `server/eslint.config.cjs`
  - [ ] Verify `npm run lint:server` still passes after rename

- [ ] **Configure Jest for TypeScript ESM** (AC6)
  - [ ] Install `@swc/jest @swc/core` as devDeps in `/server/`
  - [ ] Add `jest` config block to `server/package.json` (or create `jest.config.cjs`)
  - [ ] Set `transform: { "^.+\\.ts$": "@swc/jest" }`
  - [ ] Set `extensionsToTreatAsEsm: [".ts"]`
  - [ ] Set `moduleNameMapper: { "^(\\.{1,2}/.*)\\.js$": "$1" }` (strips .js for resolution)
  - [ ] Set `testEnvironment: "node"`, `testMatch: ["**/*.test.ts"]`

- [ ] **Convert entry point** (AC5)
  - [ ] Rename `server/index.js` → `server/index.ts`
  - [ ] Replace `require('dotenv').config()` → `import 'dotenv/config'`
  - [ ] Replace `const express = require('express')` → `import express from 'express'`
  - [ ] Replace `const cors = require('cors')` → `import cors from 'cors'`
  - [ ] Replace `module.exports = { app, server }` → `export { app, server }`
  - [ ] Keep all route handlers, middleware, and dataStore logic unchanged

- [ ] **Convert test file** (AC6)
  - [ ] Rename `server/index.test.js` → `server/index.test.ts`
  - [ ] Replace `const request = require('supertest')` → `import request from 'supertest'`
  - [ ] Replace `const { app, server } = require('./index')` → `import { app, server } from './index.js'`
  - [ ] Note: all 18 test assertions remain byte-for-byte unchanged

- [ ] **Update `.gitignore`**
  - [ ] Add `server/dist/` to root `.gitignore` (existing `/dist` only covers root-level dist)

- [ ] **Verify all passing** (AC1, AC2, AC6)
  - [ ] `cd server && npm run build` — zero TypeScript errors
  - [ ] `cd server && npm test` — 18/18 tests pass
  - [ ] `cd server && npm run dev` — server starts, `GET /api/health` returns 200
  - [ ] `npm run lint:server` from root — zero lint errors

## Dev Notes

### Critical: ESLint Config Must Be Renamed

`server/eslint.config.js` uses `module.exports = [...]` (CommonJS). Once `"type": "module"` is set in `package.json`, Node.js will try to parse it as ESM and throw `SyntaxError: Unexpected token 'export'`.

**Fix:** Rename `eslint.config.js` → `eslint.config.cjs`. ESLint v9 automatically detects `eslint.config.cjs` as the flat config when the package is ESM. No content changes needed.

### Critical: NodeNext Requires `.js` Extensions in All Internal Imports

With `"moduleResolution": "NodeNext"`, TypeScript's resolver requires explicit file extensions in relative imports. The extension must be `.js` (not `.ts`) even though the source file is `.ts` — TypeScript resolves `.js` to the corresponding `.ts` at compile time.

```ts
// WRONG — fails with NodeNext:
import { app, server } from './index'

// CORRECT:
import { app, server } from './index.js'
```

This applies to the test file's import of `index` and to any future inter-module imports in v2 server code.

### Critical: `__dirname` / `__filename` Not Available in ESM

ESM modules do not have `__dirname` or `__filename`. The current `index.js` does not use them, so this is not an issue in Story 0.1. However, **document this for all future server code in v2:**

```ts
// ESM replacement for __dirname:
import { fileURLToPath } from 'url'
import { dirname } from 'path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
```

### Critical: `dotenv` Import Pattern in ESM

The CommonJS `require('dotenv').config()` pattern does not work in ESM. Use:
```ts
import 'dotenv/config'  // ← this is the ESM equivalent; call at top of index.ts
```
This must appear before any code that reads `process.env`.

### Jest + ESM Setup

Jest does not natively support ESM. When `"type": "module"` is set, Jest needs a transform and the `--experimental-vm-modules` flag (or equivalent config). Using `@swc/jest` is the recommended approach — it is significantly faster than `ts-jest` and handles ESM TypeScript correctly.

**Recommended Jest config in `server/package.json`:**
```json
"jest": {
  "extensionsToTreatAsEsm": [".ts"],
  "transform": {
    "^.+\\.ts$": ["@swc/jest"]
  },
  "moduleNameMapper": {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  "testEnvironment": "node",
  "testMatch": ["**/*.test.ts"]
}
```

**Alternative `jest.config.cjs`:** If Jest config in `package.json` doesn't work cleanly with ESM, create `server/jest.config.cjs` (must be `.cjs` for same reason as ESLint config):
```js
module.exports = {
  extensionsToTreatAsEsm: ['.ts'],
  transform: { '^.+\\.ts$': ['@swc/jest'] },
  moduleNameMapper: { '^(\\.{1,2}/.*)\\.js$': '$1' },
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
}
```

### Jest `scripts.test` Update

The Jest test runner script must run with `NODE_OPTIONS` for ESM support:
```json
"test": "NODE_OPTIONS='--experimental-vm-modules' jest --coverage"
```
Without `--experimental-vm-modules`, Jest will error on ESM imports.

### TypeScript Version Alignment

The client uses `typescript@~5.9.3`. Use `typescript@~5.9` for the server to maintain consistency across the monorepo. Avoid `@latest` — pin to the same minor version.

### `@types/express` Version Note

Express 5 (`^5.2.1`) ships with its own TypeScript types in newer versions. However, `@types/express` is still the safe choice as of 2026. If there are type conflicts between the installed Express version and `@types/express`, pin `@types/express@5` to match.

### What Story 0.1 Does NOT Do

Story 0.1 is toolchain setup only. The following are **explicitly deferred to Story 0.2**:
- Adding TypeScript type annotations to `index.ts` (type all the things)
- Creating `server/app.ts` (separating Express app from HTTP server for clean Supertest imports)
- Refactoring `index.ts` into route modules (`routes/`, `middleware/`, `services/`, `lib/`)
- Updating `server/eslint.config.cjs` to add `@typescript-eslint` plugin
- Creating the new folder structure (`db/`, `routes/`, `services/`, `middleware/`, `errors/`, `lib/`)

Story 0.1's success condition: **the toolchain works and all 18 existing tests pass.** Code quality and type strictness come in Story 0.2.

### Project Structure Notes

**Files to create/modify in this story:**

| Action | Path |
|---|---|
| Create | `server/tsconfig.json` |
| Rename | `server/index.js` → `server/index.ts` |
| Rename | `server/index.test.js` → `server/index.test.ts` |
| Rename | `server/eslint.config.js` → `server/eslint.config.cjs` |
| Modify | `server/package.json` |
| Modify | `.gitignore` (root) |

**Files NOT touched in this story:**
- All client files (zero scope)
- Root `package.json` (no changes needed — `build:server` and `test:server` delegate to `/server/`)
- `server/.env.example` (no new vars needed for Story 0.1)

**`server/dist/` must not be committed** — root `.gitignore` has `/dist` (covers root-level only). Add `server/dist/` explicitly.

### Architecture Compliance Checklist

- [ ] TypeScript version `~5.9` matches client's `~5.9.3` [Source: project-context.md#Core Technologies]
- [ ] `module: NodeNext` in tsconfig [Source: architecture.md#Decision 1]
- [ ] `tsx watch` for dev server (not nodemon) [Source: architecture.md#Selected Approach]
- [ ] `tsc` for build [Source: architecture.md#Selected Approach]
- [ ] `"type": "module"` in package.json [Source: architecture.md#Decision 1 Migration Scope]
- [ ] All existing 18 test cases pass unchanged [Source: epics.md#Story 0.1 AC]
- [ ] No new server code written in `.js` after this story — all future files are `.ts` [Source: project-context.md#Absolute Rules]

### Security Note (Pre-Credential Verification)

Before any future story adds real credentials to `server/.env`, run:
```bash
git log --all --full-history -- "**/.env" "server/.env"
```
This was verified clean on 2026-02-25 (project-context.md). Re-verify before adding real Stripe/DB keys in v2. The root `.gitignore` covers `.env` patterns — confirm `server/.env` is covered (it is via the generic `.env` pattern).

### References

- TypeScript migration decision: `_bmad-output/planning-artifacts/architecture.md#Decision 1: Server TypeScript Migration`
- Build tooling: `_bmad-output/planning-artifacts/architecture.md#Selected Approach: Option A`
- Current server entry point: `server/index.js` (310 lines, 6 routes, in-memory dataStore)
- Current test file: `server/index.test.js` (235 lines, 18 test cases, all must pass)
- Server package: `server/package.json` (currently `"type": "commonjs"`, Jest, no TS)
- ESLint config: `server/eslint.config.js` (currently CJS — must become `.cjs`)
- Project rules: `_bmad-output/project-context.md#Absolute Rules`

## Dev Agent Record

### Agent Model Used

_To be filled in by dev agent_

### Debug Log References

_To be filled in by dev agent_

### Completion Notes List

_To be filled in by dev agent_

### File List

_To be filled in by dev agent_

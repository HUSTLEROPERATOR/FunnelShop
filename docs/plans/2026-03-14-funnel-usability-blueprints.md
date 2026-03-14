# Funnel Usability And Blueprints Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an in-app HelpPanel, hover tooltips for funnel cards, and a local JSON blueprint loader in the client without changing simulation logic or backend APIs.

**Architecture:** Keep the work inside the React client by replacing the existing client-side blueprint fetch with a local blueprint registry under `client/src/blueprints`. Add lightweight overlay components for help and template selection, and let the canvas render tooltip copy from the shared component type config so new UX stays aligned with existing card metadata.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library

---

### Task 1: Cover New Behavior With Client Tests

**Files:**
- Create: `client/src/App.test.tsx`
- Create: `client/src/blueprints/index.test.ts`

**Step 1: Write the failing tests**

Add tests that verify:
- the header exposes a `Load Template` trigger and lists the three requested templates
- selecting a template updates the canvas with template components
- the help button opens a HelpPanel with funnel-building guidance
- hovering a loaded funnel card reveals descriptive tooltip text
- the local blueprint registry exposes the three JSON-backed templates

**Step 2: Run test to verify it fails**

Run: `npm test -- App.test.tsx blueprints/index.test.ts`
Expected: FAIL because the local blueprint registry, HelpPanel, and tooltip/template UI do not exist yet

### Task 2: Implement Local Blueprint Registry

**Files:**
- Create: `client/src/blueprints/index.ts`
- Create: `client/src/blueprints/restaurant-ads-funnel.json`
- Create: `client/src/blueprints/email-marketing-funnel.json`
- Create: `client/src/blueprints/event-promotion-funnel.json`
- Modify: `client/src/types/index.ts`

**Step 1: Write the minimal implementation**

Create JSON blueprint files with names, descriptions, components, connections, and global parameters. Add a registry module that eagerly imports the JSON files and exports normalized template metadata plus a lookup helper. Extend the blueprint typing so local templates can carry `connections`.

**Step 2: Run targeted tests**

Run: `npm test -- blueprints/index.test.ts`
Expected: PASS

### Task 3: Add HelpPanel And Template Loading UI

**Files:**
- Create: `client/src/components/HelpPanel.tsx`
- Modify: `client/src/App.tsx`

**Step 1: Write the minimal implementation**

Replace the existing client fetch-based blueprint loading with local blueprint selection. Add header state for template picker and help panel visibility, render a `Load Template` button, show template cards in an overlay, and load the selected blueprint onto the canvas while clearing any selection state.

**Step 2: Run targeted tests**

Run: `npm test -- App.test.tsx`
Expected: PASS

### Task 4: Add Funnel Card Tooltips

**Files:**
- Modify: `client/src/components/Canvas.tsx`

**Step 1: Write the minimal implementation**

Track the hovered card and render a small tooltip anchored to the card using the existing `helperText` config, without altering simulation behavior.

**Step 2: Run targeted tests**

Run: `npm test -- App.test.tsx`
Expected: PASS

### Task 5: Verify The Client Build

**Files:**
- Modify: `client/src/index.css` if shared overlay styles are needed

**Step 1: Run verification**

Run: `npm test -- App.test.tsx blueprints/index.test.ts`
Expected: PASS

Run: `npm run build`
Expected: PASS

# AI Funnel Generator V1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a deterministic frontend-only AI Funnel Generator that maps short prompts to predefined funnels and loads them directly into the existing canvas.

**Architecture:** Keep prompt parsing and blueprint construction in a small `client/src/features/ai-funnel/` feature folder. The generator UI will live in the existing `App.tsx` header controls and emit the same `components`, `connections`, and `globalParameters` shapes already used by manual blueprints and the canvas.

**Tech Stack:** React 19, TypeScript, Vitest, Testing Library

---

### Task 1: Add Failing Tests For Prompt Interpretation

**Files:**
- Create: `client/src/features/ai-funnel/generateFunnelFromPrompt.test.ts`
- Modify: `client/src/App.test.tsx`

**Step 1: Write the failing tests**

Add tests that verify:
- empty prompt returns a clear fallback message
- reservation-style prompts map to `restaurant-booking-ads`
- event prompts map to `event-promotion-funnel`
- email prompts map to `email-nurture-funnel`
- menu prompts map to `menu-discovery-funnel`
- a recognized prompt from the new UI replaces the canvas with generated nodes
- the example button fills at least three supported prompts in a stable cycle

**Step 2: Run test to verify it fails**

Run: `npm test -- App.test.tsx features/ai-funnel/generateFunnelFromPrompt.test.ts`
Expected: FAIL because the AI funnel feature files and UI do not exist yet

### Task 2: Implement Deterministic Prompt Parsing

**Files:**
- Create: `client/src/features/ai-funnel/funnelPromptTemplates.ts`
- Create: `client/src/features/ai-funnel/intentToBlueprint.ts`
- Create: `client/src/features/ai-funnel/generateFunnelFromPrompt.ts`

**Step 1: Write the minimal implementation**

Create:
- example prompt constants for the UI
- supported `FunnelIntent` type and generated result types
- stable keyword groups with documented priority order
- predefined funnel builders that emit the existing `FunnelComponent`, `Connection`, and `GlobalParameters` structures with explicit positions and default properties aligned to the current app defaults

**Step 2: Run targeted tests**

Run: `npm test -- features/ai-funnel/generateFunnelFromPrompt.test.ts`
Expected: PASS

### Task 3: Add The AI Funnel Generator UI

**Files:**
- Create: `client/src/features/ai-funnel/AIFunnelGenerator.tsx`
- Modify: `client/src/App.tsx`

**Step 1: Write the minimal implementation**

Add a compact header control block with:
- input
- `Generate Funnel` button
- `Use Example` button
- helper text
- lightweight inline message area

Wire it so recognized prompts replace the current canvas, reset selection state, and set a predictable scenario name.

**Step 2: Run targeted tests**

Run: `npm test -- App.test.tsx`
Expected: PASS

### Task 4: Final Verification

**Files:**
- Verify only; no new files required unless tests need tiny updates

**Step 1: Run focused verification**

Run: `npm test -- App.test.tsx features/ai-funnel/generateFunnelFromPrompt.test.ts`
Expected: PASS

**Step 2: Run build verification**

Run: `npm run build`
Expected: PASS

# FunnelShop — Design System & Figma Integration Rules

> **Purpose:** Ground-truth reference for how visual design decisions are made,
> documented, and translated to code. Treat this as the contract between design and
> engineering in this repository.

---

## 1. Codebase Audit Summary

### Tech Stack
| Layer | Choice |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 7 |
| Styling | Tailwind CSS v4 + CSS Custom Properties (tokens) |
| Icons | Lucide React |
| Backend | Express.js (in-memory, stateless) |
| Tests | Vitest |

### Current Styling Architecture
- **Single source of truth:** `client/src/tokens.css` — all design tokens as CSS custom properties
- **Utilities:** `client/src/index.css` — reusable `.btn`, `.surface`, `.control-input`, `.text-*` classes
- **Tailwind:** Used only for layout utilities (`flex`, `grid`, `overflow-hidden`, etc.) — _not_ for color or typography
- **Inline styles:** Components use `style={}` props referencing CSS variables — acceptable at current scale, consider CSS classes as component count grows
- **No CSS Modules, no styled-components**

### Component Inventory
| Component | File | Responsibility |
|---|---|---|
| App | `App.tsx` | State, layout orchestration |
| Canvas | `Canvas.tsx` | Drag-drop area, component cards, connection mode |
| Sidebar | `Sidebar.tsx` | Component type picker |
| ConfigPanel | `ConfigPanel.tsx` | Property editor for selected component |
| MetricsPanel | `MetricsPanel.tsx` | Live KPI strip |
| ConnectionLine | `ConnectionLine.tsx` | SVG Bezier connection paths |

### Existing Tokens (excerpt)
```
Typography: --text-page-title (20px) → --text-metric-label (11px)
Colors: --color-primary (#3b82f6), --color-success, --color-danger, --color-purple
Spacing: --space-1 (4px) → --space-8 (32px)
Radii: --radius-sm (6px) → --radius-full (9999px)
Shadows: --shadow-sm → --shadow-float
Transitions: --transition-fast (120ms), --transition-normal (200ms)
```

---

## 2. Premium Design System Rules

### 2.1 Color Philosophy

**Principle:** Colors communicate meaning, not decoration.

| Token | Value | Use |
|---|---|---|
| `--color-primary` | `#3b82f6` | Primary actions, selections, focus rings |
| `--color-success` | `#22c55e` | Connection mode, confirmations |
| `--color-danger` | `#ef4444` | Destructive actions, error states |
| `--color-purple` | `#8b5cf6` | Blueprint / template actions |

**Component type color palette** (defined in tokens, applied consistently):
| Type | Color | Rationale |
|---|---|---|
| Google Ads | `#EA4335` | Google brand red |
| Facebook Ads | `#1877F2` | Meta brand blue |
| Landing Page | `#8b5cf6` | Purple = conversion-focused |
| Booking Form | `#22c55e` | Green = completion/goal |
| Email Campaign | `#f59e0b` | Amber = nurture/warmth |

**Rule:** Never use raw hex values in component files. Always reference a CSS variable.

### 2.2 Typography Rules

- **Page title:** `--text-page-title` + `--weight-semibold` + `--tracking-tight`
- **Panel headers:** `--text-section-title` + `--weight-semibold`
- **Body/labels:** `--text-label` + `--weight-medium`
- **Secondary text:** `--text-helper` + `--color-text-secondary`
- **Metrics:** `--text-metric-value` + `--weight-bold` + type accent color
- **Caps labels:** `--text-metric-label` + `text-transform: uppercase` + `--tracking-wide`

**Rule:** All type sizes must come from the token scale. No raw `font-size` values.

### 2.3 Spacing Rules

Use only the defined `--space-*` scale. Never use raw pixel values in padding/margin.

| Token | px | Use |
|---|---|---|
| `--space-1` | 4px | Icon gap, tight separators |
| `--space-2` | 8px | Inner gaps, small padding |
| `--space-3` | 12px | Item padding, form groups |
| `--space-4` | 16px | Card padding, section gaps |
| `--space-5` | 20px | Panel padding |
| `--space-6` | 24px | Header padding |
| `--space-8` | 32px | Large section gaps, canvas padding |

### 2.4 Surface / Elevation Hierarchy

The app uses a three-layer elevation model:

```
Layer 0 — App background:  --color-bg-app (#f5f5f7)
Layer 1 — Canvas area:     --color-bg-canvas (#edeef1)
Layer 2 — Panels/cards:    --color-bg-surface (#ffffff) + --shadow-sm
Layer 3 — Raised surfaces: --color-bg-surface-raised (#f8f9fa) + --shadow-md
Layer 4 — Floating/modal:  --color-bg-surface + --shadow-float + backdrop-filter
```

**Rule:** Never skip a layer. Floating toolbars always use `backdrop-filter: blur()`.

### 2.5 Border Rules

- Default: `1px solid var(--color-border)` — `#e2e4e9`
- Emphasized: `1px solid var(--color-border-strong)` — `#d1d4db`
- Muted: `1px solid var(--color-border-muted)` — `#eef0f2`
- Focus: `--color-border-focus` — never use raw `#3b82f6` for focus rings

**Rule:** All interactive state borders must transition with `var(--transition-fast)`.

### 2.6 Animation Rules

- **Allowed:** `transform`, `opacity`, `background`, `border-color`, `box-shadow`
- **Not allowed:** Animating `width`, `height`, `top`, `left` (use `transform: translate()` instead)
- **Duration:** `--transition-fast` (120ms) for hover states; `--transition-normal` (200ms) for panel slides; 300ms for modal entrances
- **Easing:** `ease` for most; `cubic-bezier(0.4, 0, 0.2, 1)` for material-feel entrances; `cubic-bezier(0.16, 1, 0.3, 1)` for spring-feel popups

**Rule:** Never animate `position` values directly. Use `will-change: transform` on draggable items.

### 2.7 Interaction State Rules

Every interactive element must have ALL of these defined:
1. **Rest** — default appearance
2. **Hover** — background or border shift, `120ms ease`
3. **Active/Press** — `transform: scale(0.98)` (buttons) or border darken
4. **Focus** — `--shadow-focus` ring (3px, 15% opacity primary)
5. **Disabled** — `opacity: 0.5`, `pointer-events: none`
6. **Selected** — `--shadow-selection` ring (blue glow)

---

## 3. Priority List: What to Design in Figma First

### Tier 1 — Design in Figma Before Coding (High Complexity, High Value)

#### 3.1 Canvas Component Card Redesign
**Why Figma first:** The card layout needs to balance: type icon, name, type badge, property preview, connection handle anchors, selection state, drag state, and connection-mode state. This is complex enough to warrant visual exploration before committing to code.

**Figma deliverables needed:**
- Rest state (all 5 component types with type-specific colors)
- Selected state (blue ring)
- Connection-source state (green ring, cursor: pointer)
- Hover state
- Drag ghost state
- Empty canvas state

**Figma frame size:** 200 × 100px per card, 8px grid

#### 3.2 Connection Line Visual Language
**Why Figma first:** Need to define: curve style (cubic vs orthogonal), arrow shape, label placement, selected state, animated state, error state (circular dependency).

**Figma deliverables needed:**
- Default connection (gray)
- Selected connection (blue + glow)
- Hovered connection
- Error/cycle connection (red dashed)

#### 3.3 Sidebar Component Picker
**Why Figma first:** The sidebar could evolve into a category-grouped component library with search, drag-preview, and usage hints. Worth speccing the V2 layout before coding.

**Figma deliverables needed:**
- Current list style (to compare)
- Proposed: grouped by category (Traffic Sources / Conversion / Nurture)
- Drag-preview ghost card
- Search input state

---

### Tier 2 — Can Be Coded Directly (Clear Pattern, Low Risk)

#### 3.4 MetricsPanel Upgrades
Improve in code without Figma:
- Better zero/empty state when no components are on canvas
- Subtle dividers between metric cells
- Small trend arrow indicators (if delta data available in future)

#### 3.5 Header/Toolbar
Improve in code without Figma:
- Visual grouping of action buttons (separator between modes vs actions)
- Better "Connect" button affordance (animated indicator dot)
- Scenario name styled as editable chip

#### 3.6 ConfigPanel Polish
Improve in code without Figma:
- Better property label formatting (already camelCase → Title Case)
- Grouped property sections with dividers
- Value change animation (flash on update)

---

### Tier 3 — Future Figma Specs (Post-V2)

- Multi-scenario management view
- Blueprint gallery modal
- Export/share modal
- Mobile-responsive layout
- Dark mode token set
- Onboarding flow / empty state walkthrough

---

## 4. Figma → Code Workflow for This Repo

### 4.1 Token Mapping Protocol

When Figma tokens are exported, map them to existing `tokens.css` variables using this convention:

| Figma Token Name | CSS Variable | Notes |
|---|---|---|
| `color/primary/500` | `--color-primary` | Keep 1:1 mapping |
| `color/surface/default` | `--color-bg-surface` | |
| `spacing/4` | `--space-4` (16px) | Use closest value |
| `radius/md` | `--radius-md` (10px) | |
| `shadow/float` | `--shadow-float` | |

**Rule:** Never hard-code a value from Figma. Always update the CSS variable, then reference the variable.

### 4.2 Component Handoff Checklist

Before coding a Figma component frame:
- [ ] All colors reference existing tokens (or new tokens added to `tokens.css`)
- [ ] All spacing is on the 4px grid (`--space-*`)
- [ ] All border radii use defined radii tokens
- [ ] All states (hover, focus, active, disabled) are specified
- [ ] Responsive behavior is documented (or explicitly N/A)
- [ ] Animation duration and easing are noted in the Figma frame annotation

### 4.3 Figma → PR Validation

When a PR contains Figma-driven UI changes, reviewer must confirm:
- [ ] Pixel-for-pixel match with Figma on desktop (1440px viewport)
- [ ] No raw hex/rgb values in component files
- [ ] No `px` values in spacing that bypass the token scale
- [ ] Transitions use `var(--transition-fast)` or `var(--transition-normal)`
- [ ] Interactive states are implemented for all 6 states listed in §2.7

---

## 5. Architecture Recommendations

### 5.1 What NOT to change yet
- State management: current prop-drilling is fine for this component count
- Backend: in-memory is acceptable for demo/prototype; add persistence when needed
- Routing: single-page is correct for this tool

### 5.2 Low-risk improvements (implement now)
- Add `will-change: transform` to draggable canvas cards
- Replace native HTML5 drag with pointer-event-based dragging for smoother feel
- Add `aria-label` to all icon-only buttons
- Remove unused `react-dnd` from `package.json`
- Add `useMemo` to `calculateMetrics` call in App.tsx

### 5.3 Medium-risk improvements (next sprint)
- Extract component type config (colors, icons, labels, defaults) to a single `componentTypes.ts` config file
- Add localStorage auto-save with debounce (200ms)
- Replace `alert()` calls with a toast notification system

### 5.4 High-risk / deferred
- Database-backed persistence
- Authentication / user accounts
- Undo/redo stack (requires immutable state history)
- Real-time collaboration

---

## 6. Implementation Plan (Current Sprint)

### Phase 1 — Token Expansion (tokens.css)
Add component-type color tokens. Extend shadow scale for hover states.

### Phase 2 — Canvas Card Upgrade
- Type-specific accent colors (left border stripe or icon background)
- Better card information hierarchy
- Improved transition timing (add `transform` to transition list for future drag animation)
- Better empty state with actionable CTA

### Phase 3 — Connection Line Upgrade
- Switch from quadratic bezier (Q command) to cubic bezier (C command)
- Better control point calculation for smooth curves regardless of angle
- Smoother arrow markers (path-based, not polygon)

### Phase 4 — Sidebar Polish
- Type-specific icon badge colors
- Visual grouping hint ("Traffic Sources", "Conversion", "Nurture")
- Hover reveal "+" indicator

### Phase 5 — MetricsPanel + Header
- Header: visual button grouping
- MetricsPanel: better zero state, subtle separators

---

## 7. Regression Risk Matrix

| Change | Risk | Mitigation |
|---|---|---|
| `tokens.css` additions | Low — additive only | No existing references break |
| Canvas card visual | Low — style only, no logic | Drag/connection handlers untouched |
| ConnectionLine bezier curve | Low — cosmetic path change | Connection click hit area unchanged (20px invisible stroke) |
| Sidebar icon colors | Low | Click handler untouched |
| App.tsx header layout | Low-medium | Verify all button callbacks still fire |
| MetricsPanel layout | Low | Data flow unchanged |

---

## 8. What Makes FunnelShop Feel Premium

The gap between "prototype" and "production SaaS" comes down to these five properties:

1. **Coherent visual hierarchy** — The eye knows instantly what to look at first, second, third. Currently missing: component cards all look identical regardless of type.

2. **Intentional color use** — Each color means exactly one thing. Currently good, but component type differentiation is absent.

3. **Fluid micro-interactions** — State changes (hover, select, drag) happen with appropriate timing and easing. Currently: good transitions on buttons, weaker on canvas cards.

4. **Spatial consistency** — Padding and gap always comes from the scale. Currently: mostly good, but some magic numbers exist in inline styles.

5. **Typography with personality** — The right information at the right size with the right weight. Currently: good system, but metric values lack visual impact at scale.

---

*Last updated: 2026-03-14 | Branch: `claude/funnelshop-premium-ui-audit-EnwXu`*

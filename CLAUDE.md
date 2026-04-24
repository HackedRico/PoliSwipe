# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repository Is

This is a **documentation-first repository** containing the complete recreation guide for **PoliSwipe**, a civic engagement swipe-card app built for the UMD x Anthropic Hackathon. The actual codebase does not live here — instead, every markdown file in `docs/` contains full source code listings, configuration files, architecture diagrams, and implementation guides sufficient to rebuild the entire app from scratch.

**This is not a typical source-code repository.** There are no TypeScript files, no package.json, and no Python source code to edit here. The purpose of this repo is documentation and recreation guidance.

## When to Use This Repo

- **Rebuilding the app** from scratch following SETUP.md
- **Referencing the canonical source** for any component, configuration, or architecture decision
- **Creating implementation guides** for new features (as a new markdown doc)
- **Updating documentation** when the codebase changes (sync back to the actual app repo)

When working on the **actual codebase** (the Expo React Native app), you would normally work in a different repository. See "Syncing Changes" below.

## Document Organization

All documentation is in the `docs/` directory:

| File | Purpose |
|------|---------|
| `README.md` | Project overview, quick start, docs index |
| `SETUP.md` | Step-by-step scaffold from `create-expo-app` to running on device |
| `ARCHITECTURE.md` | File tree, routing, state ownership, data flow diagrams, component hierarchy |
| `TECH-STACK.md` | Every dependency with exact versions, all config file contents, version sensitivity notes |
| `DATA-MODEL.md` | TypeScript types, card schema, persistent state keys, runtime data flow |
| `THEME.md` | Design tokens, typography scale, shadow system, complete source |
| `COMPONENTS.md` | Every UI component with props and behavior, full source code |
| `SWIPE-SYSTEM.md` | Gesture mechanics, animation values, 3-card stack, overlays, haptics |
| `SHEETS.md` | All 6 bottom sheet modals: structure, states, flow, source code |
| `SCREENS.md` | StackScreen (main deck) and CivicWrap (recap), full source |
| `BACKEND.md` | FastAPI server, Ollama integration, endpoints, fallback strategy, complete source |
| `CARD-DATA.md` | Card content format, all 22 cards, chat scripts, complete card.ts |

**Searching within docs:** Use grep with file glob patterns:
```bash
# Find all mentions of "AsyncStorage" in the docs
grep -r "AsyncStorage" docs/

# Find type definitions
grep "export interface\|export type" docs/*.md
```

## High-Level Architecture

### Two Routes, Zero Global State

- **Route `/`**: Main swipe card deck (StackScreen) — the core UX
- **Route `/wrap`**: End-of-session recap (CivicWrap) — summary and sharing

All persistent and ephemeral state lives in `StackScreen`. There is no Redux, Zustand, or Context API. Instead:
- **Persistent state** (idx, careCount, saved, filters) uses `usePersistentState` hook → AsyncStorage
- **Local state** (activeCard, chatMode, draft text, messages) lives in component useState
- **Bottom sheet refs** (6 total) are owned by StackScreen and passed as refs to sheet children

**Data flow:** User gesture → SwipeCard → handleSwipe callback → setState → child components re-render. The pattern is intentionally simple to avoid the complexity of managing app state at scale.

### Swipe Gesture System

Five components work together in `card/`:
1. **SwipeCard.tsx** — orchestrator; wires gesture input to animated transforms
2. **useSwipeGesture.ts** — pan gesture hook with thresholds (90px), haptics, fly-off animation
3. **CardFace.tsx** — visual card content (chip, headline, summary, stats, footer)
4. **SwipeOverlay.tsx** — directional tint + stamp overlay (CARE / SKIP / SHARE / ASK)
5. **useHaptic.ts** — haptic feedback triggers (Medium impact on right, Warning on left, etc.)

**Three cards are rendered at once** (stacked visually):
- Top card (index 0): interactive, driven by gesture
- Cards 1 & 2: static, offset 10pt down and 4% smaller each
- When swiped off: next card becomes top, idx increments, deck wraps with `idx % deck.length`

**Overlay stamp appears** proportionally as user drags past thresholds (90px = 100% opacity). Card springs back if below threshold.

### Six Bottom Sheet Modals

All sheets are `BottomSheetModal` from `@gorhom/bottom-sheet`, controlled via refs in `StackScreen`:

| Ref | Sheet | Snap | Triggered By |
|-----|-------|------|--------------|
| `actionRef` | ActionDrawer | 82% | Swipe right (care) |
| `chatRef` | ChatSheet | 90% | Swipe down (ask) or "Ask" pill tap |
| `detailsRef` | DetailsSheet | 92% | "Details" button on card |
| `filterRef` | FilterSheet | 55% | "Filter" chip tap |
| `savedRef` | SavedSheet | 90% | "Saved" chip tap |
| `postRef` | PostSheet | 85% | "+ Post" chip tap |

All use a shared `Backdrop` component (42% opacity, press-to-close). Sheet content is passed as children; refs are used for imperative `.present()` / `.dismiss()` control.

### AI Features with Local Fallback

Two AI endpoints call the backend (/api/draft, /api/chat), which proxies to local Ollama (llama3.2:latest). Both have graceful degradation:

- **Draft generation**: If backend unavailable, fall back to `card.draft` (pre-written text)
- **Chat**: Tries scripted replies first (SCRIPTED[cardId][message]), then GLOBAL_REPLIES, then Ollama, then FALLBACK_REPLY

Backend auto-discovery uses `Constants.expoConfig.hostUri` to find the dev machine's LAN IP on port 8000.

### Design System

All design tokens, typography presets, and shadows are in `theme/`:
- **tokens.ts** — brand red (#E63946), accent yellow (#FFD23F), ink grays, semantic colors, category chip colors
- **typography.ts** — named text style presets (cardHeadline, sheetTitle, chatBody, etc.) with precise size/weight/line-height
- **shadow.ts** — platform-specific presets (iOS shadowX, Android elevation) for cards, buttons, sheets

The color palette includes per-category chip colors (federal blue, state green, etc.) so filters and cards visually match their category.

## Tech Stack (Summary)

**Frontend:**
- React Native 0.81.5 + React 19.1.0
- Expo SDK 54 with file-based routing (expo-router ~6.0)
- Animations: react-native-reanimated ~4.1.1 + react-native-worklets 0.5.1 (must stay in sync)
- Gestures: react-native-gesture-handler ~2.28.0
- Bottom sheets: @gorhom/bottom-sheet ^5.2.10
- Persistent state: @react-native-async-storage/async-storage 2.2.0
- Native modules: expo-calendar (RSVP), expo-haptics, expo-linear-gradient, expo-font, expo-linking
- TypeScript ~5.9.2

**Backend:**
- Python FastAPI (lightweight proxy to Ollama)
- Ollama running locally (llama3.2:latest for text generation)
- CORS enabled for all origins (safe in local dev)

**Critical Version Constraint:**
- `react-native-reanimated ~4.1.1` and `react-native-worklets 0.5.1` **must stay in sync** (share native C++ bindings). Always use `npx expo install --fix` after bumping versions.
- `npm install --legacy-peer-deps` required (React 19 peer dep mismatches in some packages)
- `newArchEnabled: true` in app.json required (reanimated 4.x uses TurboModules)

## Commands (for the actual app repository)

When working in the **actual codebase** (not this docs repo):

```bash
# Install dependencies (always use --legacy-peer-deps)
npm install --legacy-peer-deps

# Python backend
pip install fastapi uvicorn httpx

# Start everything in parallel (backend + Expo dev server)
./start.sh

# Expo dev server alone (scans QR to Expo Go on iPhone)
npm start

# Start backend alone
npm run backend

# Clear Metro bundler cache if code changes don't show up
npx expo start --clear

# Fix Expo package version mismatches after adding new expo-* packages
npx expo install --fix
```

## Key Decisions and Constraints

### No Global State Store

All state in `StackScreen` is intentional — avoids Redux/Zustand complexity for a single-screen app (technically two routes, but one interactive screen). `usePersistentState` hook wraps AsyncStorage without a store. CivicWrap reads the same AsyncStorage keys independently.

### Bottom Sheets, Not Routes

Six panels (action, chat, details, filter, saved, post) are bottom sheets, not separate routes. Keeps the URL space minimal and avoids navigation state complexity. Refs are used for imperative control because sheets are presentation concerns, not routing concerns.

### Fallback-First AI

Every AI feature has a pre-written fallback. Ollama is optional. The backend is a simple FastAPI proxy — no authentication, no database, just LLM proxying. If Ollama or the backend is down, the app gracefully degrades to scripted/pre-written content.

### Circular Deck

Cards cycle using `idx % deck.length`. Users never hit a dead end; swiping through all cards loops back. Exactly three cards are rendered at any time (stacked), so performance is constant regardless of deck size.

### Static Card Data

All 22 cards are hardcoded in `data/cards.ts`. No backend fetch for card data — the only network calls are for AI draft and chat. This keeps the app simple and offline-capable (with pre-written fallbacks).

### Reanimated Worklets for Animations

All animations (card swipes, spring physics, overlays) run via reanimated worklets on the UI thread, avoiding the JS thread bottleneck. This is why the version constraint is strict — changing reanimated or worklets without the other causes native module failures.

## Syncing Changes

If you're **updating the docs** based on changes in the actual codebase:

1. Identify which markdown file(s) the change affects (e.g., new component → COMPONENTS.md, new endpoint → BACKEND.md)
2. Update the relevant doc(s) with the new source code
3. Check for ripple effects (e.g., a new type in types/ affects DATA-MODEL.md, COMPONENTS.md, and SHEETS.md)
4. Verify all code blocks remain syntactically valid and copy-pasteable
5. Update the relevant indices/tables (e.g., component props table in COMPONENTS.md)

If you're **rebuilding from these docs** and discover issues:

1. Fix the issue in the actual codebase
2. Update the corresponding markdown file here with the corrected source
3. Add a note in the file about what was fixed and why (version sensitivity, breaking changes, etc.)

## Common Patterns

**Adding a new bottom sheet:**
- Create `sheets/NewSheet.tsx` with `forwardRef(BottomSheetModal)` wrapper
- Accept a ref prop from StackScreen
- Call props.dismiss() to close
- Assign the ref in StackScreen and call `ref.current.present()` to open
- See SHEETS.md for the template

**Adding a new card:**
- Add to the CARDS array in `data/cards.ts` with all required fields (see DATA-MODEL.md)
- Update category filter logic if introducing a new CardType
- Add chat scripts to `data/chatScripts.ts` if the card has unique prompts
- Update CARD-DATA.md with the new card content

**Adding a new action (API call, OS integration):**
- Create a function in `actions/` (e.g., actions/newAction.ts)
- Import and call from the relevant sheet or button handler
- Implement fallback behavior if the action is network-dependent
- Document the function signature and fallback strategy in BACKEND.md or README.md

**Updating theme tokens:**
- Edit `theme/tokens.ts`, `theme/typography.ts`, or `theme/shadow.ts`
- Run the app with `npx expo start --clear` to reload theme changes
- Update the corresponding tables in THEME.md
- Verify all components that reference the token still look correct

## Notes for Future Contributors

- **Read ARCHITECTURE.md first** if you need to understand data flow or state ownership
- **Reference TECH-STACK.md** before installing new dependencies or bumping versions
- **Check DATA-MODEL.md** for all TypeScript types — it's the single source of truth for the data schema
- **Every code block in the docs is meant to be copy-pasteable.** If you find a syntax error or outdated pattern, fix the docs immediately so they stay canonical
- **CLAUDE.md is for architecture and setup; individual doc files are for implementation.** Don't duplicate information across docs
- **The docs are version-controlled alongside the code.** When you update code, update the corresponding doc in the same commit

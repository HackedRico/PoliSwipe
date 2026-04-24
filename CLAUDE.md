# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**PoliSwipe** is a civic engagement swipe-card app (Tinder-style UX for policy issues) built for the UMD x Anthropic Hackathon. It's an Expo React Native app with a Python FastAPI backend that proxies to local Ollama for AI features.

## Commands

```bash
# Install dependencies (MUST use --legacy-peer-deps due to React 19 peer dep mismatches)
npm install --legacy-peer-deps

# Start everything (backend + Expo dev server, kills stale processes first)
./start.sh

# Expo dev server only
npm start

# Backend only (FastAPI on port 8000)
npm run backend

# Clear Metro cache when code changes don't appear
npx expo start --clear

# Fix Expo package version mismatches after adding expo-* packages
npx expo install --fix
```

There are no tests or linter configured in this project.

## Critical Version Constraints

- `react-native-reanimated ~4.1.1` and `react-native-worklets 0.5.1` **must stay in sync** — they share native C++ bindings. Always run `npx expo install --fix` after bumping either.
- `newArchEnabled: true` in app.json is required (reanimated 4.x uses TurboModules).
- `react-native-reanimated/plugin` must be the last entry in `babel.config.js` plugins.

## Architecture

### Two Routes, All State in StackScreen

- **`/`** → `screens/StackScreen.tsx` — the main swipe card deck, owns all app state
- **`/wrap`** → `screens/CivicWrap.tsx` — end-of-session recap, reads AsyncStorage independently

There is no global state store (no Redux/Zustand/Context). State is managed via:
- **`usePersistentState` hook** (`hooks/usePersistentState.ts`) — wraps AsyncStorage for `idx`, `careCount`, `saved`, `filters`
- **Component `useState`** — for `activeCard`, `chatMode`, draft text, messages
- **Refs** — 6 `BottomSheetModal` refs owned by StackScreen for imperative `.present()` / `.dismiss()`

**Data flow:** User gesture → SwipeCard → `handleSwipe` callback → setState → child re-render.

### Swipe System (`card/`)

Five files collaborate: `SwipeCard.tsx` (orchestrator), `useSwipeGesture.ts` (pan gesture + 90px thresholds + haptics + fly-off), `CardFace.tsx` (visual content), `SwipeOverlay.tsx` (directional tint/stamp), `useHaptic.ts` (haptic triggers).

Three cards render at once in a stack. Deck wraps circularly via `idx % deck.length`. All animations run on the UI thread via reanimated worklets.

### Bottom Sheets (`sheets/`)

Six `BottomSheetModal` panels (ActionDrawer, ChatSheet, DetailsSheet, FilterSheet, SavedSheet, PostSheet), all controlled via refs from StackScreen. Uses shared `Backdrop` component.

| Ref | Triggered By |
|-----|-------------|
| `actionRef` | Swipe right (care) |
| `chatRef` | Swipe down or "Ask" tap |
| `detailsRef` | "Details" button |
| `filterRef` | "Filter" chip |
| `savedRef` | "Saved" chip |
| `postRef` | "+ Post" chip |

### AI Features (`backend/server.py`)

FastAPI proxy to local Ollama (`llama3.2:latest`). Two endpoints: `/api/draft` (email generation) and `/api/chat` (conversational). Both have graceful fallbacks:
- Draft falls back to `card.draft` (pre-written text in `data/cards.ts`)
- Chat falls back through: scripted replies (`data/chatScripts.ts`) → global replies → Ollama → hardcoded fallback

Backend auto-discovery uses `Constants.expoConfig.hostUri` for dev machine LAN IP on port 8000.

### Static Data

All 22 cards are hardcoded in `data/cards.ts`. No backend fetch for card data. Only network calls are AI draft and chat. Card types: `federal`, `state`, `local`, `campus`, `rally`, `petition`, `election`.

### Design System (`theme/`)

- `tokens.ts` — colors (brand red #E63946, accent yellow #FFD23F, per-category chip colors)
- `typography.ts` — named text style presets
- `shadow.ts` — platform-specific shadow presets (iOS shadow vs Android elevation)

## Common Patterns

**Adding a bottom sheet:** Create `sheets/NewSheet.tsx` with `forwardRef(BottomSheetModal)`, add a ref in StackScreen, call `ref.current.present()` to open.

**Adding a card:** Add to `CARDS` array in `data/cards.ts`, add chat scripts in `data/chatScripts.ts` if needed, add new `CardType` to `types/index.ts` if introducing a new category.

**Adding an action:** Create function in `actions/`, import from relevant sheet. Always implement a fallback for network-dependent actions.

## Documentation

The `docs/` directory contains detailed implementation guides with full source listings for every component. Reference these when rebuilding or understanding specific subsystems.

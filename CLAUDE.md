# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What Is PoliSwipe

A civic engagement swipe-card app built for the UMD x Anthropic Hackathon. Users swipe through political/civic issue cards (like a Tinder UX) to engage with local, state, and federal topics. Built with React Native + Expo for iOS, with a FastAPI backend using the Claude API for AI features.

## Commands

```bash
# Install dependencies (always use --legacy-peer-deps due to React 19 peer dep mismatches)
npm install --legacy-peer-deps

# Start everything (kills old processes, starts backend on :8000 + Expo on :8081)
./start.sh

# Start Expo alone (interactive terminal with QR code for phone)
npx expo start --clear

# Start backend alone
uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload

# iOS Simulator
npx expo start --ios --clear

# Fix Expo package version mismatches after adding new expo-* packages
npx expo install --fix
```

No test suite or linter is configured.

## Architecture

### Two Routes, All State in StackScreen

- `/` (index.tsx) renders `StackScreen` -- the main swipe card deck, owns all app state
- `/wrap` (wrap.tsx) renders `CivicWrap` -- end-of-session recap, reads AsyncStorage independently

There is no global state store (no Redux, Zustand, or Context). All persistent state (card index, care count, saved items, filters) uses the `usePersistentState` hook wrapping AsyncStorage. All ephemeral state (active card, chat mode) lives in StackScreen's useState.

### Provider Stack (app/_layout.tsx)

`GestureHandlerRootView` > `SafeAreaProvider` > `BottomSheetModalProvider` > `Stack`. This order matters -- gesture handler must be outermost for swipe gestures to work, and BottomSheetModalProvider must wrap any screen using bottom sheets.

### Swipe System (card/)

Three cards rendered at once using modulo indexing: `deck[(idx + i) % deck.length]`. Top card is interactive (pan gesture), cards 1-2 are static with visual offset. The `useSwipeGesture` hook uses `useRef` for card/onSwipe to prevent stale closures when `runOnJS` calls back from reanimated worklets.

Four swipe directions: right (care/save), left (skip), up (share), down (ask AI).

### Bottom Sheets (sheets/)

Seven `BottomSheetModal` instances controlled via refs in StackScreen. Refs are used for imperative `.present()` / `.dismiss()` -- these are presentation concerns, not routing concerns.

| Ref | Triggered By |
|-----|-------------|
| actionRef | Swipe right |
| chatRef | Swipe down or "Ask" tap |
| detailsRef | "Details" button |
| filterRef | "Filter" chip |
| savedRef | "Saved" chip |
| postRef | "+ Post" chip |
| commentsRef | Comments button |

### AI Features (Fallback-First)

Two AI endpoints (`/api/draft`, `/api/chat`) call the Claude API (Haiku) through the FastAPI backend. Both degrade gracefully:
- Draft generation falls back to `card.draft` (pre-written text)
- Chat tries scripted replies first (chatScripts.ts), then Claude, then a fallback message

Backend auto-discovery uses `Constants.expoConfig.hostUri` to find the dev machine's LAN IP.

Post submission (`/api/posts`) stores posts in-memory on the backend.

### Static Card Data

All 22 cards are hardcoded in `data/cards.ts`. No backend fetch for card data. The deck is circular -- swiping through all cards loops back.

## Critical Version Constraints

- `react-native-reanimated ~4.1.1` and `react-native-worklets 0.5.1` must stay in sync (shared native C++ bindings). Always run `npx expo install --fix` after bumping either.
- `newArchEnabled: true` in app.json is required (reanimated 4.x uses TurboModules).
- `react-native-reanimated/plugin` must be last in babel.config.js plugins array.
- Path alias `@/*` maps to project root (tsconfig.json).

## Commit Conventions

- No co-author lines in commits
- No em dashes in commit messages
- Human-readable, concise messages

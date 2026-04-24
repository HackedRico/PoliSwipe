# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

This is a **documentation-only repository** -- there is no runnable code here. It contains the complete recreation guide for **PoliSwipe**, a civic engagement swipe-card app built for the UMD x Anthropic Hackathon. The actual codebase lives in a separate repository.

Every markdown file contains full source code listings, configuration files, and architectural diagrams sufficient to rebuild the entire app from scratch.

## Document Map

| File | Purpose |
|------|---------|
| README.md | Project overview, quick start commands, docs index |
| SETUP.md | Step-by-step scaffold from `create-expo-app` to running on device |
| ARCHITECTURE.md | File tree, routing, state ownership, data flow diagrams, component hierarchy |
| TECH-STACK.md | Every dependency with exact versions, all config file contents, version sensitivity notes |
| DATA-MODEL.md | TypeScript types, persistent state keys, runtime data flow |
| THEME.md | Design tokens, typography scale, shadow system |
| COMPONENTS.md | Every UI component with props and behavior |
| SWIPE-SYSTEM.md | Gesture mechanics, animation values, overlays |
| SHEETS.md | All 6 bottom sheet modals: structure, states, flow |
| SCREENS.md | StackScreen (main deck) and CivicWrap (recap) |
| BACKEND.md | FastAPI server, Ollama integration, endpoints, fallback strategy |
| CARD-DATA.md | Card content format, all 22 cards, chat scripts |

## The App These Docs Describe

- **Frontend**: React Native + Expo SDK 54, expo-router (file-based routing), react-native-reanimated 4.x for animations, @gorhom/bottom-sheet for modals
- **Backend**: Python FastAPI server proxying to local Ollama (llama3.2:latest) for AI draft/chat features
- **Architecture**: Two routes only (`/` main deck, `/wrap` recap). All state lives in `StackScreen` -- no Redux/Zustand/Context. Six bottom sheets controlled via refs. Circular card deck with `idx % deck.length`. AI features have local fallbacks (pre-written drafts, scripted chat replies)
- **Critical version constraint**: `react-native-reanimated ~4.1.1` and `react-native-worklets 0.5.1` must stay in sync -- always use `npx expo install --fix` to update. `npm install --legacy-peer-deps` is required for all installs due to React 19 peer dep mismatches.

## Working With These Docs

- Each doc is self-contained with full source code. When updating one doc, check if the change affects others (e.g., a type change in DATA-MODEL.md may need updates in COMPONENTS.md, SHEETS.md, and CARD-DATA.md).
- Code blocks in these files are the source of truth for recreation. Keep them copy-pasteable and syntactically valid.
- TECH-STACK.md contains the exact contents of config files (package.json, app.json, tsconfig.json, babel.config.js). If versions change, update there.
- ARCHITECTURE.md contains ASCII diagrams for data flow and component hierarchy. Preserve their formatting.

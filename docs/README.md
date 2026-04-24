# PoliSwipe -- Complete Recreation Guide

PoliSwipe is a civic engagement swipe-card app built for the UMD x Anthropic Hackathon. College students swipe through local bills, petitions, rallies, and campus issues. Right-swipe triggers an AI-drafted email to a representative; down-swipe opens an AI chat; left-swipe skips; up-swipe shares.

Built with React Native + Expo Go (iOS target), FastAPI backend proxying to local Ollama (llama3.2:latest).

## Docs Index

| File | What it covers |
|------|---------------|
| [SETUP.md](SETUP.md) | Zero-to-running: scaffold, install, configure, launch |
| [ARCHITECTURE.md](ARCHITECTURE.md) | File tree, routing, data flow, state management |
| [TECH-STACK.md](TECH-STACK.md) | Every dependency, version, config file, and why |
| [DATA-MODEL.md](DATA-MODEL.md) | TypeScript types, card schema, persistent state |
| [THEME.md](THEME.md) | Design tokens, typography scale, shadow system |
| [COMPONENTS.md](COMPONENTS.md) | Every UI component with props and behavior |
| [SWIPE-SYSTEM.md](SWIPE-SYSTEM.md) | Gesture mechanics, animation values, overlays |
| [SHEETS.md](SHEETS.md) | All 6 bottom sheet modals: structure, states, flow |
| [SCREENS.md](SCREENS.md) | StackScreen (main) and CivicWrap (recap) |
| [BACKEND.md](BACKEND.md) | FastAPI server, Ollama integration, endpoints |
| [CARD-DATA.md](CARD-DATA.md) | Card content format, all 22 cards, chat scripts |

## Quick Start (existing clone)

```bash
# Install deps
npm install --legacy-peer-deps

# Python backend deps
pip install fastapi uvicorn httpx

# Start everything (kills stale processes, clears cache)
./start.sh
```

Scan the QR code with Expo Go on your iPhone.

## Quick Start (from scratch)

Follow [SETUP.md](SETUP.md) step by step. It covers everything from `npx create-expo-app` to running on a physical device.

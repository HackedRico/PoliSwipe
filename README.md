# PoliSwipe

**Swipe right on democracy** -- civic engagement that feels like a dating app, not a textbook.

Winner -- Governance & Accessibility Track | UMD x Anthropic Hackathon 2026

## What is PoliSwipe?

PoliSwipe is a swipe-card mobile app that makes civic participation as easy as swiping through a feed. Students swipe through real local bills, petitions, rallies, and campus issues -- each card is a real civic topic with a real representative attached.

- **Swipe right** -- Claude drafts a personalized email to the relevant rep
- **Swipe down** -- Ask Claude questions about the issue in plain language
- **Swipe up** -- Share the card
- **Swipe left** -- Skip to the next card

Beyond the deck: filter by issue type, save cards, post civic takes with Reddit-style threaded comments, and view a "Civic Wrap" recap of your session.

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React Native + Expo SDK 54 (iOS) |
| Animations | react-native-reanimated 4.x + react-native-gesture-handler |
| Sheets | @gorhom/bottom-sheet (7 modals) |
| State | AsyncStorage via `usePersistentState` hook (no Redux/Zustand) |
| Backend | Python FastAPI |
| AI | Claude API (Haiku) with scripted fallbacks |
| Dev tooling | Claude Code |

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- iOS device with [Expo Go](https://apps.apple.com/app/expo-go/id982107779) or Xcode simulator
- Anthropic API key

### Setup

```bash
# Clone
git clone https://github.com/HackedRico/PoliSwipe.git
cd PoliSwipe

# Install JS dependencies (--legacy-peer-deps required for React 19)
npm install --legacy-peer-deps

# Install Python dependencies
pip install -r requirements.txt

# Add your API key
cp .env.example .env
# Then edit .env with your actual Anthropic API key

# Start everything (backend on :8000 + Expo on :8081)
./start.sh
```

Scan the QR code with Expo Go on your iPhone.

### Run individually

```bash
# Expo only
npx expo start --clear

# Backend only
source .env && uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload
```

## Project Structure

```
PoliSwipe/
  app/              # Expo Router routes (index.tsx, wrap.tsx, _layout.tsx)
  screens/          # StackScreen (main deck) and CivicWrap (recap)
  card/             # SwipeCard, CardFace, SwipeOverlay, useSwipeGesture
  sheets/           # 7 bottom sheet modals (action, chat, details, filter, saved, post, comments)
  components/       # Shared UI (TopBar, NavChips, Chip, FormattedText, etc.)
  hooks/            # usePersistentState, useFilteredDeck, useHaptic
  actions/          # API calls (Claude draft/chat), calendar, email, share
  data/             # 22 hardcoded civic cards, chat scripts, profile data
  theme/            # Design tokens, typography, shadows
  types/            # TypeScript interfaces (Card, SavedItem, ChatMessage, etc.)
  backend/          # FastAPI server (server.py)
```

## AI Architecture

Claude powers two features through the FastAPI backend:

1. **Email Drafting** (`/api/draft`) -- generates personalized emails from students to their reps, grounded in the card's bill/issue context
2. **Policy Chat** (`/api/chat`) -- answers questions about civic issues with concise, factual responses

Both use a three-tier fallback: Claude API -> scripted instant replies -> hardcoded fallbacks. The app never shows an error state.

## Built by

- [Ricky Chen](https://github.com/HackedRico)
- [Princeobiuto Aguguo](https://github.com/agugoat)
- [Emmanuel Adedeji](https://github.com/eadedeji8)
- [Nimi Ojikutu](https://github.com/Nimi-Ojikutu)

## License

MIT

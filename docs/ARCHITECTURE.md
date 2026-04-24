# PoliSwipe -- Architecture

This document describes the full system architecture of PoliSwipe, a civic
engagement app built with Expo / React Native. It covers the file tree, routing,
state management, component hierarchy, data flow, and navigation.

---

## 1. Complete File Tree

```
PoliSwipe/
|
|-- app/                        # Expo Router -- file-based routing
|   |-- _layout.tsx             # Root layout: providers + Stack navigator
|   |-- index.tsx               # Route "/"  -> renders StackScreen
|   |-- wrap.tsx                # Route "/wrap" -> renders CivicWrap
|
|-- screens/                    # Full-screen view orchestrators
|   |-- StackScreen.tsx         # Main swipe deck, owns all state + sheet refs
|   |-- CivicWrap.tsx           # End-of-session recap (paging ScrollView)
|
|-- card/                       # Swipe card subsystem
|   |-- SwipeCard.tsx           # Animated wrapper with GestureDetector
|   |-- CardFace.tsx            # Visual card content (chip, headline, stats)
|   |-- SwipeOverlay.tsx        # Directional color tint + stamp text
|   |-- useSwipeGesture.ts      # Pan gesture logic + haptics + fly-off anim
|
|-- components/                 # Reusable presentational components
|   |-- TopBar.tsx              # Brand bar with menu, logo, Ask pill, avatar
|   |-- NavChips.tsx            # Horizontal chip row: Filter, Saved, Post, Recap
|   |-- ActionButtons.tsx       # Bottom bar: Skip / Share / Care circles
|   |-- Chip.tsx                # Category pill (CONGRESS, UMD, etc.)
|   |-- StatPill.tsx            # Stat badge on non-rally cards
|   |-- ProgressBar.tsx         # Animated fill bar (used in CivicWrap)
|   |-- SectionLabel.tsx        # Uppercase section heading
|   |-- TypingDots.tsx          # Three-dot animation for chat loading
|   |-- EndOfStack.tsx          # "All caught up" empty state
|   |-- MapPreview.tsx          # Stylized map placeholder for rally cards
|
|-- sheets/                     # Bottom sheet modals (@gorhom/bottom-sheet)
|   |-- ActionDrawer.tsx        # Post-swipe-right: AI draft editor + send
|   |-- ChatSheet.tsx           # Conversational Q&A (global or card-scoped)
|   |-- DetailsSheet.tsx        # Deep-dive on a card: facts, sources, body
|   |-- FilterSheet.tsx         # Category multi-select filter
|   |-- SavedSheet.tsx          # List of right-swiped (cared) cards
|   |-- PostSheet.tsx           # User-submitted content (3-step form)
|   |-- Backdrop.tsx            # Shared dimmed backdrop for all sheets
|
|-- hooks/                      # Custom React hooks
|   |-- usePersistentState.ts   # AsyncStorage-backed useState
|   |-- useFilteredDeck.ts      # Memoized card filtering by category
|   |-- useHaptic.ts            # Haptic feedback presets
|
|-- data/                       # Static / seed data
|   |-- cards.ts                # 22 Card objects (the full deck)
|   |-- categories.ts           # 7 category definitions (id, emoji, label)
|   |-- chatScripts.ts          # Scripted AI replies + global prompts + fallback
|   |-- profile.ts              # Demo user profile + Wrap panel data
|
|-- actions/                    # Side-effect functions (API, OS integrations)
|   |-- api.ts                  # fetchAIDraft(), fetchAIChat() -> backend
|   |-- calendar.ts             # addRallyToCalendar() via expo-calendar
|   |-- email.ts                # emailRep() via mailto: link
|   |-- share.ts                # shareCard() via RN Share API
|
|-- theme/                      # Design tokens
|   |-- tokens.ts               # Colors, chip palette, semantic tokens
|   |-- typography.ts           # Font families + TEXT style presets
|   |-- shadow.ts               # Platform-specific shadow/elevation presets
|
|-- types/
|   |-- index.ts                # All TypeScript interfaces and type aliases
|
|-- backend/                    # Python FastAPI server (AI proxy)
|   |-- server.py               # /api/draft, /api/chat, /health endpoints
|
|-- assets/
|   |-- fonts/                  # (reserved for custom fonts)
|   |-- images/                 # App icon, splash, adaptive icon
|
|-- app.json                    # Expo config (name, plugins, permissions)
|-- babel.config.js             # Babel: expo preset + reanimated plugin
|-- tsconfig.json               # TypeScript: strict, @/* path alias
|-- package.json                # Dependencies and scripts
|-- start.sh                    # Dev launcher: backend + Expo in parallel
|-- .gitignore
|-- .gitattributes
```

---

## 2. Routing System

PoliSwipe uses **expo-router** with file-based routing. Every file inside `app/`
becomes a route.

### Route Table

| File              | URL Path  | Component Rendered | Purpose                    |
| ----------------- | --------- | ------------------ | -------------------------- |
| `app/_layout.tsx` | --        | `RootLayout`       | Wraps all routes in providers |
| `app/index.tsx`   | `/`       | `StackScreen`      | Main swipe deck screen     |
| `app/wrap.tsx`    | `/wrap`   | `CivicWrap`        | End-of-session recap       |

### How It Works

```
app/_layout.tsx
  |
  |-- GestureHandlerRootView        (react-native-gesture-handler)
  |     |-- SafeAreaProvider         (react-native-safe-area-context)
  |           |-- BottomSheetModalProvider  (@gorhom/bottom-sheet)
  |                 |-- StatusBar    (dark style)
  |                 |-- Stack        (expo-router Stack navigator)
  |                       |-- Stack.Screen name="index"
  |                       |-- Stack.Screen name="wrap"
```

The `Stack` navigator uses `headerShown: false` and `animation: 'fade'` for
both screens. There is no tab bar; the app has exactly two routes.

**Navigation between routes:**

- `/` -> `/wrap`: Triggered by the "Recap" chip in `NavChips`, which calls
  `router.push('/wrap')`.
- `/wrap` -> `/`: Triggered by the "Start over" button in `CivicWrap`, which
  calls `router.replace('/')` after resetting the card index to 0.

---

## 3. Data Flow Diagram

### State Ownership

All persistent and ephemeral state lives in `StackScreen`. It passes data and
callbacks down to children via props. There is no global store (no Redux,
Zustand, or Context).

```
                      +--------------------------+
                      |      StackScreen         |
                      |  (screens/StackScreen)   |
                      |                          |
                      |  PERSISTENT STATE:       |
                      |    idx        (number)   |  card deck position
                      |    careCount  (number)   |  total right-swipes
                      |    saved      (SavedItem[])|  cared cards list
                      |    filters    (CardType[])|  active category filters
                      |                          |
                      |  LOCAL STATE:            |
                      |    activeCard (Card|null)|  card for sheets
                      |    chatMode   (string)   |  'global' | 'card'
                      |                          |
                      |  REFS (BottomSheetModal):|
                      |    actionRef             |
                      |    chatRef               |
                      |    detailsRef            |
                      |    filterRef             |
                      |    savedRef              |
                      |    postRef               |
                      +-----------+--------------+
                                  |
          +-----------+-----------+-----------+-----------+
          |           |           |           |           |
          v           v           v           v           v
      TopBar      NavChips   SwipeCard   ActionBtns   [6 Sheets]
     (onAsk)    (callbacks)  (onSwipe)   (onLeft,     (refs, data,
                             (onMore)    onShare,      callbacks)
                                         onRight)
```

### Data Flow on Swipe Right (User "cares" about a card)

```
 User swipes card right
         |
         v
 useSwipeGesture detects dir === 'right'
         |
         v
 Haptic feedback (Medium impact)
         |
         v
 Card flies off screen (withTiming)
         |
         v
 handleSwipe(card, 'right') called in StackScreen
         |
         +-----> setCareCount(c => c + 1)           [persistent]
         +-----> setSaved(s => [newItem, ...s])      [persistent]
         +-----> setActiveCard(card)                 [local]
         +-----> actionRef.current.present()         [opens ActionDrawer]
                          |
                          v
                  ActionDrawer opens
                          |
                          v
                  fetchAIDraft(card) called -> backend /api/draft
                          |
                          +-- success: show editable draft
                          +-- failure: fall back to card.draft (pre-written)
                          |
                          v
                  User taps "Send" or "Edit later"
                          |
                          v
                  actionRef.dismiss() + setIdx(i => i + 1)
```

### Data Flow on Swipe Left (User skips)

```
 User swipes card left
         |
         v
 Haptic feedback (Warning notification)
         |
         v
 Card flies off screen
         |
         v
 handleSwipe(card, 'left')
         |
         v
 setIdx(i => i + 1)     [persistent, advances deck]
```

### Data Flow on Swipe Down (User asks a question)

```
 User swipes card down
         |
         v
 Card snaps back to center (does NOT fly off)
         |
         v
 handleSwipe(card, 'down')
         |
         +-----> setActiveCard(card)
         +-----> setChatMode('card')
         +-----> chatRef.current.present()    [opens ChatSheet in card mode]
```

### Data Flow on Filter Change

```
 User taps "Filter" chip in NavChips
         |
         v
 filterRef.current.present()    [opens FilterSheet]
         |
         v
 User toggles categories, taps "Apply"
         |
         v
 FilterSheet calls onChange(localFilters)
         |
         v
 StackScreen.setFilters(newFilters)   [persistent]
         |
         v
 useFilteredDeck(filters) recomputes
         |
         v
 deck = filters.length === 0 ? CARDS : CARDS.filter(...)
         |
         v
 SwipeCard stack re-renders with filtered deck
```

---

## 4. State Management Strategy

### Persistent State (survives app restart)

The `usePersistentState` hook wraps React `useState` with `AsyncStorage`
read/write. On mount, it reads the stored value; on every update, it writes
back.

| Key          | Type           | Purpose                            |
| ------------ | -------------- | ---------------------------------- |
| `idx`        | `number`       | Current position in the card deck  |
| `careCount`  | `number`       | Total number of right-swipes       |
| `saved`      | `SavedItem[]`  | Array of cared cards with timestamps |
| `filters`    | `CardType[]`   | Active category filter selections  |

These four values persist across app restarts. The `CivicWrap` screen reads
`careCount` and `idx` using the same hook (shared via AsyncStorage key, not via
React context).

### Local State (ephemeral, resets on remount)

| Variable      | Type             | Owner          | Purpose                        |
| ------------- | ---------------- | -------------- | ------------------------------ |
| `activeCard`  | `Card \| null`   | StackScreen    | Card currently shown in a sheet |
| `chatMode`    | `'global'\|'card'`| StackScreen   | Whether chat is about a specific card |
| `state`       | DrawerState      | ActionDrawer   | 'loading' / 'editable' / 'sent' |
| `draftText`   | string           | ActionDrawer   | Editable email draft text       |
| `messages`    | ChatMessage[]    | ChatSheet      | Conversation history            |
| `inputText`   | string           | ChatSheet      | Current chat input              |
| `loading`     | boolean          | ChatSheet      | Whether AI is thinking          |
| `local`       | CardType[]       | FilterSheet    | Uncommitted filter selections   |
| `step`        | 0 \| 1 \| 2     | PostSheet      | Current step in post wizard     |
| `displayCount`| number           | CivicWrap      | Animated counter value          |

### Bottom Sheet Refs

Six `BottomSheetModal` refs are created in `StackScreen` and passed to sheet
components via `forwardRef`. Sheets are opened by calling `ref.current.present()`
and dismissed with `ref.current.dismiss()`.

```
actionRef  -> ActionDrawer     (82% snap)
chatRef    -> ChatSheet        (90% snap)
detailsRef -> DetailsSheet     (92% snap)
filterRef  -> FilterSheet      (55% snap)
savedRef   -> SavedSheet       (90% snap)
postRef    -> PostSheet        (85% snap)
```

All six sheets use the shared `Backdrop` component (42% opacity, press-to-close).

---

## 5. Component Hierarchy

### Main Screen (`/`)

```
RootLayout (app/_layout.tsx)
  |-- GestureHandlerRootView
        |-- SafeAreaProvider
              |-- BottomSheetModalProvider
                    |-- Stack (expo-router)
                          |
                          |-- Index (app/index.tsx)
                                |
                                |-- StackScreen (screens/StackScreen.tsx)
                                      |
                                      |-- TopBar
                                      |     |-- menu button (Ionicons)
                                      |     |-- diamond + "PoliSwipe" brand
                                      |     |-- "Ask" pill -> opens ChatSheet (global)
                                      |     |-- avatar circle
                                      |
                                      |-- NavChips
                                      |     |-- Filter pill   -> opens FilterSheet
                                      |     |-- Saved pill    -> opens SavedSheet
                                      |     |-- + Post pill   -> opens PostSheet
                                      |     |-- Recap pill    -> navigates to /wrap
                                      |
                                      |-- [deck area]
                                      |     |-- SwipeCard (x3 stacked, top is interactive)
                                      |     |     |-- GestureDetector (Pan)
                                      |     |     |     |-- Animated.View
                                      |     |     |           |-- CardFace
                                      |     |     |                 |-- Chip
                                      |     |     |                 |-- headline (Text)
                                      |     |     |                 |-- summary (Text)
                                      |     |     |                 |-- [rally: map + when/where tiles + weather]
                                      |     |     |                 |-- [non-rally: StatPill]
                                      |     |     |                 |-- footer (action hint + Details button)
                                      |     |     |                 |-- source chips
                                      |     |     |                 |-- SwipeOverlay (color tint + stamp)
                                      |     |
                                      |     |-- [empty state if no cards match filters]
                                      |
                                      |-- ActionButtons
                                      |     |-- Skip circle (X)
                                      |     |-- Share circle (up arrow)
                                      |     |-- Care circle (heart)
                                      |
                                      |-- ActionDrawer   (BottomSheetModal, 82%)
                                      |-- ChatSheet      (BottomSheetModal, 90%)
                                      |-- DetailsSheet   (BottomSheetModal, 92%)
                                      |-- FilterSheet    (BottomSheetModal, 55%)
                                      |-- SavedSheet     (BottomSheetModal, 90%)
                                      |-- PostSheet      (BottomSheetModal, 85%)
```

### Wrap Screen (`/wrap`)

```
RootLayout
  |-- ...providers...
        |-- Stack
              |-- Wrap (app/wrap.tsx)
                    |-- CivicWrap (screens/CivicWrap.tsx)
                          |-- ScrollView (pagingEnabled, vertical)
                                |
                                |-- Panel 0: Hero Count
                                |     |-- date label
                                |     |-- animated counter (displayCount)
                                |     |-- "scroll down" hint
                                |
                                |-- Panel 1: Top Issues
                                |     |-- ProgressBar (x3, Housing/Energy/Education)
                                |
                                |-- Panel 2: Your Wins
                                |     |-- rep cards (avatar + name + tag)
                                |
                                |-- Panel 3: Up Next
                                |     |-- todo rows (emoji + label + sub)
                                |
                                |-- Panel 4: Civic Vibe (dark)
                                      |-- motivational message
                                      |-- Share button
                                      |-- "Start over" button -> router.replace('/')
                                      |-- footer credit
```

---

## 6. Navigation Flow

```
+==================+                           +==================+
|                  |    "Recap" chip            |                  |
|   / (index)      | ----------------------->  |   /wrap           |
|   StackScreen    |    router.push('/wrap')    |   CivicWrap      |
|                  |                           |                  |
|  Swipe deck +    |    "Start over" button    |  5-panel paging  |
|  bottom sheets   | <-----------------------  |  vertical scroll |
|                  |    router.replace('/')     |                  |
+==================+                           +==================+

Within the main screen (/), navigation is handled entirely by
bottom sheets. No route changes occur when sheets open or close.

+-------------------------------------------------------------------+
|                     StackScreen (/)                                |
|                                                                   |
|  User Action              Opens Sheet          Trigger            |
|  ------------------------------------------------                |
|  Tap "Ask" pill        -> ChatSheet (global)   TopBar.onAsk       |
|  Tap "Filter" chip     -> FilterSheet          NavChips.onFilter  |
|  Tap "Saved" chip      -> SavedSheet           NavChips.onSaved   |
|  Tap "+ Post" chip     -> PostSheet            NavChips.onPost    |
|  Tap "Details" button  -> DetailsSheet         CardFace.onMore    |
|  Swipe right           -> ActionDrawer         handleSwipe        |
|  Swipe down            -> ChatSheet (card)     handleSwipe        |
|  Swipe left            -> (no sheet)           advances deck      |
|  Swipe up              -> (no sheet)           share action*      |
|                                                                   |
|  * Swipe up calls handleSwipe with 'up' which currently triggers  |
|    the same path as 'right' (care + ActionDrawer).                |
+-------------------------------------------------------------------+
```

### Swipe Direction Map

```
                         UP
                    [ SHARE ]
                    blue tint
                    card flies up
                         |
            LEFT ------- + ------- RIGHT
          [ SKIP ]               [ CARE ]
          red tint               green tint
          card flies left        card flies right
                         |       + ActionDrawer opens
                        DOWN
                      [ ASK ]
                      dark tint
                      card snaps back
                      + ChatSheet opens
```

Swipe threshold: 90px of translation in any direction. Below that, the card
springs back to center. The overlay stamp (CARE / SKIP / SHARE / ASK) fades
in proportionally as the user drags.

---

## 7. Backend Architecture

```
+--------------+         HTTP POST          +------------------+
|              |  ----------------------->  |                  |
|  Expo App    |  /api/draft                |  FastAPI Server  |
|  (actions/   |  /api/chat                 |  (backend/       |
|   api.ts)    |                            |   server.py)     |
|              |  <-----------------------  |                  |
+--------------+    JSON response           +--------+---------+
                                                     |
                                                     | HTTP POST
                                                     v
                                            +------------------+
                                            |  Ollama          |
                                            |  (localhost:11434)|
                                            |  llama3.2:latest |
                                            +------------------+
```

The backend is a thin FastAPI proxy. The mobile app discovers the backend URL
by reading `Constants.expoConfig.hostUri` (the dev machine's LAN IP) and
connecting on port 8000. If the backend or Ollama is unavailable, the app
gracefully falls back:

- **Draft generation**: Falls back to `card.draft` (pre-written text in
  `data/cards.ts`).
- **Chat**: Falls back to scripted replies in `data/chatScripts.ts`, then to
  `FALLBACK_REPLY`.

### Chat Reply Resolution Order

```
1. Check SCRIPTED[cardId][userMessage]     -> instant, card-specific
2. Check GLOBAL_REPLIES[userMessage]       -> instant, global prompts
3. Call fetchAIChat() -> backend -> Ollama -> live AI response
4. Fall back to FALLBACK_REPLY constant    -> generic fallback
```

---

## 8. Type System

All types are defined in `types/index.ts`:

| Type           | Description                                           |
| -------------- | ----------------------------------------------------- |
| `CardType`     | Union: federal, state, local, campus, rally, petition, election |
| `Card`         | Full card data: headline, summary, rep, draft, sources, etc. |
| `Source`        | News source: title, date, optional URL                |
| `CardWhen`     | Date/time metadata for rally cards                    |
| `CardWhere`    | Location metadata: place, address, walk time          |
| `CardWeather`  | Weather display: icon, temp, description              |
| `CardStat`     | Stat badge: icon, text, tone                          |
| `SwipeDir`     | Union: 'left' \| 'right' \| 'up' \| 'down'           |
| `SavedItem`    | Card + savedAtISO timestamp + sent boolean            |
| `PostType`     | Union: rally, petition, election, discussion          |
| `PostDraft`    | User-created post: type, title, summary, when, where  |
| `ChatMessage`  | Chat bubble: role (user/ai), text, optional sources   |

---

## 9. Design Token System

The theme layer in `theme/` provides three modules:

- **tokens.ts** -- Color palette: brand red (#E63946), accent yellow (#FFD23F),
  ink grays, semantic colors (success/danger/share), per-category chip colors,
  and surface/divider colors.

- **typography.ts** -- Named text style presets (cardHeadline, sheetTitle,
  wrapHuge, chatBody, chip, buttonLabel, etc.) using system fonts with precise
  size, weight, line-height, and letter-spacing.

- **shadow.ts** -- Platform-specific (iOS shadowX / Android elevation) presets
  for cards, buttons, sheets, and soft rows.

---

## 10. Key Architectural Decisions

1. **No global state store.** All state lives in `StackScreen` and flows down
   via props. The `usePersistentState` hook provides persistence without a
   store. `CivicWrap` reads the same AsyncStorage keys independently.

2. **Bottom sheets instead of routes.** Six different panels (action, chat,
   details, filter, saved, post) are bottom sheets, not separate routes. This
   keeps the URL space minimal (two routes) and avoids navigation state
   complexity.

3. **Ref-based sheet control.** Each sheet is controlled by a
   `BottomSheetModal` ref. The parent (`StackScreen`) owns all six refs and
   calls `.present()` / `.dismiss()` imperatively.

4. **Fallback-first AI.** The AI backend (Ollama) is optional. Every AI-driven
   feature (draft generation, chat) has a local fallback: pre-written drafts
   in the card data, scripted chat replies, and a generic fallback message.

5. **Circular deck.** The deck wraps around using `idx % deck.length`. The user
   never hits a dead end; they cycle back through cards. Three cards are
   rendered at a time (stacked visually).

6. **Static card data.** All 22 cards are hardcoded in `data/cards.ts`. There
   is no backend fetch for card data; the only network calls are for AI draft
   and chat features.

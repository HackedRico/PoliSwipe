# PoliSwipe Data Model

Complete reference for every TypeScript type, persistent state key, and runtime data-flow in the PoliSwipe app.

---

## 1. TypeScript Types and Interfaces

### Source File: `types/index.ts`

```ts
export type CardType =
  | 'federal' | 'state' | 'local' | 'campus'
  | 'rally' | 'petition' | 'election';

export interface Source {
  title: string;
  date: string;
  url?: string;
}

export interface CardWhen  { dateLabel: string; time: string; isoStart?: string; isoEnd?: string }
export interface CardWhere { place: string; address: string; walkMin: number; lat?: number; lng?: number }
export interface CardWeather { icon: string; temp: string; desc: string }
export interface CardStat  { icon: string; text: string; tone: CardType }

export interface Card {
  id: string;
  type: CardType;
  emoji: string;
  chipLabel: string;
  headline: string;
  summary: string;
  stat?: CardStat;
  when?: CardWhen;
  where?: CardWhere;
  weather?: CardWeather;
  going?: number;
  majorGoing?: number;
  actionHint: string;
  rep: string;
  repTitle: string;
  draft: string;
  peer: string;
  prompts: string[];
  sources: Source[];
  detailsBody?: string;
  updatedAgo?: string;
}

export type SwipeDir = 'left' | 'right' | 'up' | 'down';

export interface SavedItem { card: Card; savedAtISO: string; sent: boolean }

export type PostType = 'rally' | 'petition' | 'election' | 'discussion';
export interface PostDraft {
  type: PostType; title: string; summary: string;
  when?: string; where?: string;
}

export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
  sources?: Source[];
}
```

---

## 2. Card Schema -- Field-by-Field

### `Card` interface

| Field | Type | Required | Purpose |
|---|---|---|---|
| `id` | `string` | Yes | Unique identifier for the card (e.g. `"card_01"`). Used as the React `key` in the deck rendering loop. |
| `type` | `CardType` | Yes | One of `'federal'`, `'state'`, `'local'`, `'campus'`, `'rally'`, `'petition'`, or `'election'`. Determines the color theme of the chip badge and which filter categories the card belongs to. |
| `emoji` | `string` | Yes | Single emoji shown at the top of the card face to provide a quick visual cue of the card's category. |
| `chipLabel` | `string` | Yes | Short uppercase string displayed in the colored chip badge on the card (e.g. `"PETITION"`, `"RALLY"`). |
| `headline` | `string` | Yes | Bold, primary text on the card. This is the main thing users read before deciding to swipe. |
| `summary` | `string` | Yes | 1-3 sentence body text below the headline. Explains why this issue matters to the user. |
| `stat` | `CardStat` | No | An optional stat callout shown on the card face. Contains an `icon` (emoji), a `text` label (e.g. `"20,247 signatures in 2 weeks"`), and a `tone` that maps back to a `CardType` for color-coding. Only present on cards where a quantitative statistic is relevant. |
| `when` | `CardWhen` | No | Date/time information for time-bound cards (rallies, elections). `dateLabel` is a human-friendly string like `"This Saturday"`. `time` is the display time like `"2:00 PM"`. `isoStart`/`isoEnd` are optional ISO-8601 timestamps used when adding the event to a calendar. Only present on rally and election cards. |
| `where` | `CardWhere` | No | Location information for in-person events. `place` is a short venue name, `address` is the full street address, and `walkMin` is the estimated walk time in minutes from campus. `lat`/`lng` are optional coordinates for map display. Only present on rally cards and similar location-bound items. |
| `weather` | `CardWeather` | No | Weather forecast snippet for event cards. `icon` is a weather emoji, `temp` is a temperature string like `"72F"`, and `desc` is a short forecast like `"Clear skies"`. Only present when `when` and `where` are also present. |
| `going` | `number` | No | Total RSVP count displayed on event cards (e.g. `403`). Only present on rally/event cards. |
| `majorGoing` | `number` | No | Number of students from the user's major who have RSVP'd. Shown as a social-proof nudge. Only present alongside `going`. |
| `actionHint` | `string` | Yes | Label for the primary action button in the ActionDrawer (e.g. `"Sign petition"`, `"RSVP + add to calendar"`). Tells the user what swiping right will do. |
| `rep` | `string` | Yes | Name of the relevant representative or organizer (e.g. `"Councilmember Franklin"`, `"CEEJH Organizers"`). Shown in the ActionDrawer. |
| `repTitle` | `string` | Yes | Title or role of the `rep` (e.g. `"PG County Council, District 5"`). Shown beneath the rep name. |
| `draft` | `string` | Yes | Pre-written message template for contacting the representative or sharing the issue. Shown in the ActionDrawer for one-tap sending. |
| `peer` | `string` | Yes | Social-proof label shown on the card (e.g. `"14 CS students also cared"`). Encourages action by showing peer engagement. |
| `prompts` | `string[]` | Yes | Array of 2-4 suggested follow-up questions displayed as tappable chips in the ChatSheet (e.g. `["What's the timeline?", "How does this affect my rent?"]`). |
| `sources` | `Source[]` | Yes | Array of source citations shown at the bottom of the card and in the DetailsSheet. Each has a `title`, `date`, and optional `url`. |
| `detailsBody` | `string` | No | Extended body text shown in the DetailsSheet when the user taps "More details". Provides deeper context beyond the `summary`. |
| `updatedAgo` | `string` | No | Freshness indicator shown on the card face (e.g. `"2h ago"`). Omitted for cards where recency is not meaningful. |

### Supporting Interfaces

**`CardStat`** -- A quantitative callout on the card face.

| Field | Type | Purpose |
|---|---|---|
| `icon` | `string` | Emoji icon for the stat (e.g. chart emoji). |
| `text` | `string` | The stat label itself (e.g. `"20,247 signatures in 2 weeks"`). |
| `tone` | `CardType` | Used to color-code the stat badge by mapping to theme colors. |

**`CardWhen`** -- Date/time data for events.

| Field | Type | Required | Purpose |
|---|---|---|---|
| `dateLabel` | `string` | Yes | Human-friendly date (e.g. `"This Saturday"`). |
| `time` | `string` | Yes | Display time (e.g. `"2:00 PM"`). |
| `isoStart` | `string` | No | ISO-8601 start datetime, used when adding to calendar. |
| `isoEnd` | `string` | No | ISO-8601 end datetime, used when adding to calendar. |

**`CardWhere`** -- Location data for in-person events.

| Field | Type | Required | Purpose |
|---|---|---|---|
| `place` | `string` | Yes | Short venue name (e.g. `"Hornbake Plaza"`). |
| `address` | `string` | Yes | Full street address for maps and directions. |
| `walkMin` | `number` | Yes | Estimated walking time from campus in minutes. |
| `lat` | `number` | No | Latitude for map pin. |
| `lng` | `number` | No | Longitude for map pin. |

**`CardWeather`** -- Forecast snippet for events.

| Field | Type | Purpose |
|---|---|---|
| `icon` | `string` | Weather emoji (e.g. sun, cloud). |
| `temp` | `string` | Temperature string (e.g. `"72F"`). |
| `desc` | `string` | Short forecast description (e.g. `"Clear skies"`). |

**`Source`** -- A citation reference.

| Field | Type | Required | Purpose |
|---|---|---|---|
| `title` | `string` | Yes | Publication and headline (e.g. `"Washington Post - PG rezoning hearing draws 600"`). |
| `date` | `string` | Yes | Publication date string (e.g. `"Apr 18"`). |
| `url` | `string` | No | Link to the source article. |

**`SavedItem`** -- Wrapper for a card the user swiped right on.

| Field | Type | Purpose |
|---|---|---|
| `card` | `Card` | Full copy of the saved card. |
| `savedAtISO` | `string` | ISO-8601 timestamp of when the user saved it. |
| `sent` | `boolean` | Whether the user has sent/completed the action for this card. |

**`PostDraft`** -- User-created community post.

| Field | Type | Required | Purpose |
|---|---|---|---|
| `type` | `PostType` | Yes | One of `'rally'`, `'petition'`, `'election'`, or `'discussion'`. |
| `title` | `string` | Yes | Title of the post. |
| `summary` | `string` | Yes | Body text of the post. |
| `when` | `string` | No | Date/time string for events. |
| `where` | `string` | No | Location string for events. |

**`ChatMessage`** -- A single message in the AI chat.

| Field | Type | Required | Purpose |
|---|---|---|---|
| `role` | `'user' \| 'ai'` | Yes | Who sent the message. |
| `text` | `string` | Yes | The message content. |
| `sources` | `Source[]` | No | Citations attached to AI responses. |

---

## 3. Persistent State (AsyncStorage)

### Source File: `hooks/usePersistentState.ts`

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';

export function usePersistentState<T>(key: string, initial: T) {
  const [v, setV] = useState<T>(initial);
  const loaded = useRef(false);
  useEffect(() => {
    AsyncStorage.getItem(key).then(raw => {
      if (raw) setV(JSON.parse(raw));
      loaded.current = true;
    });
  }, [key]);
  useEffect(() => {
    if (loaded.current) AsyncStorage.setItem(key, JSON.stringify(v));
  }, [v, key]);
  return [v, setV] as const;
}
```

### How It Works

`usePersistentState` is a drop-in replacement for `useState` that automatically syncs to `AsyncStorage`. On mount, it reads the stored JSON value for the given `key`. Once loaded (`loaded.current = true`), every subsequent state change writes back to AsyncStorage. The `loaded` ref gate prevents the initial default value from overwriting a previously saved value before the async read completes.

### All Persistent State Keys

There are exactly four persistent keys used across the app. They are all created in `StackScreen` except where noted.

| Key | Type | Default | Where Used | Purpose |
|---|---|---|---|---|
| `'idx'` | `number` | `0` | `StackScreen`, `CivicWrap` | Current position in the card deck. Incremented on every swipe (left, up, or after closing the ActionDrawer on a right swipe). Persisted so the user resumes where they left off. Reset to `0` by the CivicWrap screen. |
| `'careCount'` | `number` | `0` | `StackScreen`, `CivicWrap` | Running count of how many times the user swiped right ("cared about" a card). Displayed in the NavChips bar and animated in the CivicWrap recap screen. |
| `'saved'` | `SavedItem[]` | `[]` | `StackScreen` | Array of saved cards (swiped right). New items are prepended to the front of the array (most recent first). Shown in the SavedSheet. |
| `'filters'` | `CardType[]` | `[]` | `StackScreen` | Currently active category filters. An empty array means "show all cards." Changed via the FilterSheet. |

---

## 4. Filtering

### Source File: `hooks/useFilteredDeck.ts`

```ts
import { useMemo } from 'react';
import { CARDS } from '@/data/cards';
import type { Card, CardType } from '@/types';

export function useFilteredDeck(filters: CardType[]): Card[] {
  return useMemo(() => (
    filters.length === 0 ? CARDS : CARDS.filter(c => filters.includes(c.type))
  ), [filters]);
}
```

### How Filtering Works

1. **All cards live in `CARDS`** -- a static array exported from `data/cards.ts`. This is the single source of truth for card content.

2. **`useFilteredDeck(filters)`** takes the current `filters` array (a `CardType[]`) and returns a filtered subset of `CARDS`.

3. **Empty filters = no filtering.** When `filters` is an empty array (`[]`), the hook returns the full `CARDS` array unchanged. This is the default state.

4. **Non-empty filters = inclusion filter.** When `filters` contains one or more `CardType` values (e.g. `['rally', 'petition']`), only cards whose `type` field matches one of the filter values are returned.

5. **Memoized.** The result is wrapped in `useMemo` keyed on the `filters` array, so the filtered deck is only recomputed when filters actually change.

### Source File: `data/categories.ts`

```ts
export const ALL_CATEGORIES = [
  { id: 'federal',  emoji: '\u{1F3DB}\uFE0F', label: 'Federal' },
  { id: 'state',    emoji: '\u{1F4DC}', label: 'Maryland' },
  { id: 'local',    emoji: '\u{1F4CD}', label: 'PG County' },
  { id: 'campus',   emoji: '\u{1F393}', label: 'UMD' },
  { id: 'rally',    emoji: '\u270A', label: 'Rally' },
  { id: 'petition', emoji: '\u270D\uFE0F', label: 'Petition' },
  { id: 'election', emoji: '\u{1F5F3}\uFE0F', label: 'Ballot' },
] as const;
```

`ALL_CATEGORIES` defines the filter chips shown in the FilterSheet. Each entry has:

| Field | Type | Purpose |
|---|---|---|
| `id` | `string` | Matches a `CardType` value. Toggling a chip adds/removes this ID from the `filters` array. |
| `emoji` | `string` | Emoji displayed inside the filter chip. |
| `label` | `string` | Human-readable label for the chip (e.g. `"PG County"` instead of `"local"`). |

The `id` values in `ALL_CATEGORIES` correspond exactly to the members of the `CardType` union. Selecting a chip adds its `id` to the persistent `'filters'` array; deselecting removes it.

---

## 5. Deck Index and Card Cycling

### The Index Model

The deck position is tracked by a single persistent integer: `idx` (stored under the AsyncStorage key `'idx'`). The filtered deck is a plain array called `deck`.

The key formula used throughout `StackScreen` is:

```
deck[idx % deck.length]
```

This modulo operation means the deck **cycles infinitely**. When `idx` exceeds `deck.length`, it wraps back to the beginning. The user never hits a dead end -- cards repeat in the same order.

### How Cards Are Rendered

The deck renders up to 3 cards as a visual stack:

```ts
deck
  .slice(idx % deck.length, (idx % deck.length) + 3)
  .reverse()
  .map((c, i, arr) => (
    <SwipeCard
      key={c.id + '-' + Math.floor(idx / deck.length)}
      card={c}
      isTop={i === arr.length - 1}
      stackIndex={arr.length - 1 - i}
      onSwipe={handleSwipe}
      onMoreDetails={(cd) => { ... }}
    />
  ))
```

Step by step:

1. **`.slice(idx % deck.length, (idx % deck.length) + 3)`** -- Grabs the current card and up to two cards behind it from the deck array.
2. **`.reverse()`** -- Reverses the slice so the top card (the one the user interacts with) renders last in the React tree and therefore sits on top visually (higher z-index).
3. **`key={c.id + '-' + Math.floor(idx / deck.length)}`** -- The key includes the "cycle number" (`Math.floor(idx / deck.length)`) so that when a card reappears in a later cycle, React treats it as a new component and re-animates it.
4. **`isTop={i === arr.length - 1}`** -- Only the last element in the reversed array (the current card) is interactive.
5. **`stackIndex={arr.length - 1 - i}`** -- Used for the stacked card visual offset (cards behind the top card are scaled down and shifted).

### When `idx` Advances

| User Action | What Happens to `idx` |
|---|---|
| **Swipe left** (dismiss) | `idx` increments by 1 immediately via `setIdx(i => i + 1)`. |
| **Swipe up** (share) | Same as swipe left -- `idx` increments by 1 immediately. |
| **Swipe right** (care) | The card is saved, the ActionDrawer opens, and `idx` does **not** advance yet. It advances by 1 when the user closes the ActionDrawer (`closeActionDrawer`). |
| **Swipe down** (ask AI) | The ChatSheet opens. `idx` does **not** advance. The user stays on the same card. |

### Interaction with Filters

When filters change, the `deck` array changes (different cards, different length). Because `idx` is not reset when filters change, the modulo operation (`idx % deck.length`) gracefully handles the new deck length. The user lands on whatever position `idx % newDeckLength` points to in the filtered array.

### Reset

The CivicWrap (recap) screen reads `careCount` and resets `idx` to `0` when the user starts a new session, bringing them back to the first card.

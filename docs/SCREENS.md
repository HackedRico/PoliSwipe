# Screens Reference

This document covers the two primary screens in PoliSwipe -- **StackScreen** (the main swiping interface) and **CivicWrap** (the end-of-session recap) -- plus the three Expo Router files that mount them.

---

## Table of Contents

1. [App Routing Files](#app-routing-files)
   - [app/\_layout.tsx](#app_layouttsx)
   - [app/index.tsx](#appindextsx)
   - [app/wrap.tsx](#appwraptsx)
2. [StackScreen (Main Swiping Screen)](#stackscreen-main-swiping-screen)
   - [State and Refs](#state-and-refs)
   - [Card Deck Cycling with Modulo Arithmetic](#card-deck-cycling-with-modulo-arithmetic)
   - [Bottom Sheet Orchestration](#bottom-sheet-orchestration)
   - [Swipe Handlers](#swipe-handlers)
   - [Render Tree](#render-tree)
   - [Complete Source Code](#stackscreen-complete-source-code)
3. [CivicWrap (Recap Screen)](#civicwrap-recap-screen)
   - [5-Panel Scroll Layout](#5-panel-scroll-layout)
   - [Animated Counter](#animated-counter)
   - [Panel Breakdown](#panel-breakdown)
   - [Complete Source Code](#civicwrap-complete-source-code)

---

## App Routing Files

PoliSwipe uses Expo Router (file-based routing). There are two routes -- `/` for the swiping screen and `/wrap` for the recap. The root layout wraps everything in the providers that the app depends on.

### app/\_layout.tsx

The root layout establishes the provider hierarchy that the entire app requires:

1. **GestureHandlerRootView** -- required by `react-native-gesture-handler` (and therefore by bottom sheets and swipe cards) to intercept touch events at the root.
2. **SafeAreaProvider** -- provides safe-area inset values to any descendant that calls `useSafeAreaInsets()`.
3. **BottomSheetModalProvider** -- required by `@gorhom/bottom-sheet` so that `BottomSheetModal` components can present/dismiss correctly.
4. **StatusBar** -- set to `dark` style so the status bar text is dark on a light background.
5. **Stack** -- Expo Router's stack navigator with `headerShown: false` (no built-in header) and a `fade` animation between routes. Two screens are declared: `index` and `wrap`.

```tsx
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <BottomSheetModalProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="wrap" />
          </Stack>
        </BottomSheetModalProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
```

### app/index.tsx

The index route (`/`) renders the main swiping screen. It is a thin wrapper that imports and returns `StackScreen`.

```tsx
import { StackScreen } from '@/screens/StackScreen';

export default function Index() {
  return <StackScreen />;
}
```

### app/wrap.tsx

The wrap route (`/wrap`) renders the recap screen. It is a thin wrapper that imports and returns `CivicWrap`.

```tsx
import { CivicWrap } from '@/screens/CivicWrap';

export default function Wrap() {
  return <CivicWrap />;
}
```

---

## StackScreen (Main Swiping Screen)

`StackScreen` is the heart of the app. It renders a card deck that the user swipes through, a top bar, navigation chips, action buttons, and six bottom sheets that present contextual UI.

### State and Refs

**Persistent state** (survives app restarts via `usePersistentState`):

| Key          | Type           | Default | Purpose                                         |
|--------------|----------------|---------|--------------------------------------------------|
| `idx`        | `number`       | `0`     | Current position in the card deck                |
| `careCount`  | `number`       | `0`     | How many cards the user swiped right ("cared about") |
| `saved`      | `SavedItem[]`  | `[]`    | Array of saved cards with timestamps             |
| `filters`    | `CardType[]`   | `[]`    | Active category filters applied to the deck      |

**Ephemeral state** (resets each mount):

| Key          | Type                    | Default    | Purpose                                        |
|--------------|-------------------------|------------|-------------------------------------------------|
| `activeCard` | `Card \| null`          | `null`     | The card currently focused for a bottom sheet   |
| `chatMode`   | `'global' \| 'card'`    | `'global'` | Whether the chat sheet shows global or card-specific context |

**Refs** (six `BottomSheetModal` refs):

| Ref          | Sheet Component | Trigger                                |
|--------------|-----------------|----------------------------------------|
| `actionRef`  | `ActionDrawer`  | Swipe right on a card                  |
| `chatRef`    | `ChatSheet`     | Swipe down on a card, or tap "Ask" in TopBar |
| `detailsRef` | `DetailsSheet`  | Tap "More Details" on a card           |
| `filterRef`  | `FilterSheet`   | Tap filter chip in NavChips            |
| `savedRef`   | `SavedSheet`    | Tap saved chip in NavChips             |
| `postRef`    | `PostSheet`     | Tap post chip in NavChips              |

### Card Deck Cycling with Modulo Arithmetic

The deck is an array of `Card` objects returned by the `useFilteredDeck(filters)` hook. The key line is:

```tsx
deck.slice(idx % deck.length, (idx % deck.length) + 3)
```

Here is how this works:

- `idx` is a monotonically increasing integer. Every time the user advances past a card (swipe left, or close the action drawer after a swipe right), `idx` increments by 1.
- `idx % deck.length` maps that ever-increasing index back into the bounds of the deck array. When the user reaches the end of the deck, the modulo wraps around to 0 and the cards cycle again.
- `.slice(..., ... + 3)` takes up to 3 cards starting at the current position. These three cards form the visible "stack" -- the top card is interactive, the two behind it provide visual depth.
- `.reverse()` flips the order so the card at position `idx % deck.length` renders last (on top in z-order). React Native renders later elements on top.
- The `key` prop includes `Math.floor(idx / deck.length)` so that when the deck wraps around to the same card on a second pass, React treats it as a new component instance and re-mounts it with fresh animation state.

The `isTop` prop (true only for the last element after `.reverse()`) tells `SwipeCard` whether to enable gesture handling. Only the topmost card is swipeable. `stackIndex` controls the visual offset of cards behind it (scale and vertical position).

When the deck is empty (all cards filtered out), a placeholder empty state renders instead.

### Bottom Sheet Orchestration

StackScreen manages six bottom sheets. Each is a `BottomSheetModal` component rendered at the bottom of the component tree (they portal above everything). The orchestration pattern is:

1. A user action sets `activeCard` to the relevant card (or leaves it null for global sheets).
2. The corresponding ref's `.present()` method is called to slide the sheet up.
3. The sheet receives props it needs (the active card, callbacks, etc.).
4. When the sheet is dismissed (by the user dragging it down, or programmatically via `.dismiss()`), the card deck may advance.

Specific flows:

- **Swipe right** -> sets `activeCard`, increments `careCount`, pushes to `saved`, presents `ActionDrawer`. When `ActionDrawer` closes via `closeActionDrawer`, it dismisses the sheet and increments `idx` to advance the deck.
- **Swipe down** -> sets `activeCard`, sets `chatMode` to `'card'`, presents `ChatSheet` with card-specific context.
- **Swipe left** -> simply increments `idx` to skip the card. No sheet opens.
- **Tap "Ask" in TopBar** -> sets `chatMode` to `'global'`, presents `ChatSheet` without card context.
- **Tap "More Details" on a card** -> sets `activeCard`, presents `DetailsSheet`.
- **NavChips** -> each chip presents its respective sheet (`FilterSheet`, `SavedSheet`, `PostSheet`), or navigates to `/wrap` for the recap.

### Render Tree

```
View (container, paddingTop = safe area)
  TopBar                        -- logo + "Ask" button
  NavChips                      -- horizontal filter/saved/post/recap chips
  View (deck)
    [empty state]               -- when deck.length === 0
    [SwipeCard x3]              -- up to 3 stacked cards
  ActionButtons                 -- left/share/right buttons below the deck (hidden when deck empty)
  ActionDrawer (bottom sheet)   -- post-swipe-right actions
  ChatSheet (bottom sheet)      -- AI chat (global or card-scoped)
  DetailsSheet (bottom sheet)   -- full details for a card
  FilterSheet (bottom sheet)    -- category filter toggles
  SavedSheet (bottom sheet)     -- list of saved cards
  PostSheet (bottom sheet)      -- compose a post
```

### StackScreen Complete Source Code

```tsx
import { useRef, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';

import TopBar from '@/components/TopBar';
import NavChips from '@/components/NavChips';
import ActionButtons from '@/components/ActionButtons';
import { SwipeCard } from '@/card/SwipeCard';

import { ActionDrawer } from '@/sheets/ActionDrawer';
import { ChatSheet } from '@/sheets/ChatSheet';
import { DetailsSheet } from '@/sheets/DetailsSheet';
import { FilterSheet } from '@/sheets/FilterSheet';
import { SavedSheet } from '@/sheets/SavedSheet';
import { PostSheet } from '@/sheets/PostSheet';

import { usePersistentState } from '@/hooks/usePersistentState';
import { useFilteredDeck } from '@/hooks/useFilteredDeck';
import type { Card, CardType, SavedItem, SwipeDir } from '@/types';
import { PS_TOKENS } from '@/theme/tokens';

export function StackScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [idx, setIdx] = usePersistentState<number>('idx', 0);
  const [careCount, setCareCount] = usePersistentState<number>('careCount', 0);
  const [saved, setSaved] = usePersistentState<SavedItem[]>('saved', []);
  const [filters, setFilters] = usePersistentState<CardType[]>('filters', []);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [chatMode, setChatMode] = useState<'global' | 'card'>('global');

  const actionRef = useRef<BottomSheetModal>(null);
  const chatRef = useRef<BottomSheetModal>(null);
  const detailsRef = useRef<BottomSheetModal>(null);
  const filterRef = useRef<BottomSheetModal>(null);
  const savedRef = useRef<BottomSheetModal>(null);
  const postRef = useRef<BottomSheetModal>(null);

  const deck = useFilteredDeck(filters);

  const handleSwipe = useCallback(
    (card: Card, dir: SwipeDir) => {
      if (dir === 'right') {
        setCareCount((c) => c + 1);
        setSaved((s) => [
          { card, savedAtISO: new Date().toISOString(), sent: false },
          ...s,
        ]);
        setActiveCard(card);
        actionRef.current?.present();
      } else if (dir === 'down') {
        setActiveCard(card);
        setChatMode('card');
        chatRef.current?.present();
      } else {
        setIdx((i) => i + 1);
      }
    },
    [],
  );

  const closeActionDrawer = useCallback(() => {
    actionRef.current?.dismiss();
    setIdx((i) => i + 1);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TopBar
        onAsk={() => {
          setChatMode('global');
          chatRef.current?.present();
        }}
      />
      <NavChips
        activeFilters={filters}
        savedCount={saved.length}
        careCount={careCount}
        onFilter={() => filterRef.current?.present()}
        onSaved={() => savedRef.current?.present()}
        onPost={() => postRef.current?.present()}
        onRecap={() => router.push('/wrap')}
      />

      <View style={styles.deck}>
        {deck.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>{'🔍'}</Text>
            <Text style={styles.emptyTitle}>No cards match your filters</Text>
            <Text style={styles.emptySub}>Try clearing your filters above</Text>
          </View>
        ) : (
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
                onMoreDetails={(cd) => {
                  setActiveCard(cd);
                  detailsRef.current?.present();
                }}
              />
            ))
        )}
      </View>

      {deck.length > 0 && (
        <ActionButtons
          onLeft={() => handleSwipe(deck[idx % deck.length], 'left')}
          onShare={() => handleSwipe(deck[idx % deck.length], 'up')}
          onRight={() => handleSwipe(deck[idx % deck.length], 'right')}
        />
      )}

      <ActionDrawer ref={actionRef} card={activeCard} onClose={closeActionDrawer} />
      <ChatSheet ref={chatRef} card={activeCard} isGlobal={chatMode === 'global'} />
      <DetailsSheet ref={detailsRef} card={activeCard} />
      <FilterSheet ref={filterRef} active={filters} onChange={setFilters} />
      <SavedSheet ref={savedRef} items={saved} />
      <PostSheet
        ref={postRef}
        onSubmit={(d) => console.log('post submitted', d)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PS_TOKENS.bg },
  deck: { flex: 1, paddingHorizontal: 16, paddingTop: 4 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: PS_TOKENS.ink, marginBottom: 6 },
  emptySub: { fontSize: 14, color: PS_TOKENS.ink3 },
});
```

---

## CivicWrap (Recap Screen)

`CivicWrap` is a full-screen, vertically paging scroll view that presents the user's session summary across 5 panels. Each panel occupies exactly one screen height, and the `pagingEnabled` prop on `ScrollView` snaps each panel into view.

### 5-Panel Scroll Layout

The layout uses a `ScrollView` with these critical props:

- **`pagingEnabled`** -- each scroll gesture snaps to the next full-screen panel.
- **`showsVerticalScrollIndicator={false}`** -- hides the scrollbar for a clean full-screen feel.
- **`bounces={false}`** -- prevents over-scroll at the top and bottom.

Each panel is a `View` with `height: SCREEN_H` (the full device screen height from `Dimensions.get('window')`), centered content, and a distinct background color.

### Animated Counter

Panel 0 features an animated count-up effect for the "You cared about X things tonight" number:

1. On mount, a `useEffect` fires once (guarded by `countStarted` ref to prevent re-runs).
2. It calculates a target value from `careCount` (read from persistent state).
3. It divides the animation into `steps` (capped at 30) over a total duration of 600ms.
4. A `setInterval` increments `displayCount` by `Math.ceil(target / steps)` each tick.
5. When the counter reaches or exceeds the target, it clamps to the exact target and clears the interval.

This creates a fast count-up animation that takes about 0.6 seconds regardless of the final number.

### Panel Breakdown

| Panel | Section Label       | Background | Content                                                                 |
|-------|---------------------|------------|-------------------------------------------------------------------------|
| 0     | (Hero)              | `#FAFAF7`  | Date label, "You cared about {N} things tonight", scroll-down hint      |
| 1     | 01 . YOUR TOP ISSUES| `#FFF7DE`  | Headline + progress bars for each issue category (from `WRAP_TOP_ISSUES`) |
| 2     | 02 . YOUR WINS      | `#FFECEC`  | Headline + rep cards with avatar initials, name, title, and action tag  |
| 3     | 03 . UP NEXT        | `#EAF4FF`  | Action items with emoji, label, subtitle, and arrow (from `WRAP_NEXT`)  |
| 4     | 04 . YOUR CIVIC VIBE| `#111111`  | Motivational text, Share button, Start Over button, footer credit       |

**Panel 0 (Hero)** -- Centered layout with the animated counter displayed in a large brand-colored font (`TEXT.wrapHuge`). A "scroll down" hint with a down-arrow sits at the absolute bottom of the panel.

**Panel 1 (Top Issues)** -- Maps over `WRAP_TOP_ISSUES` data to render labeled progress bars. Each bar row shows the issue label on the left, percentage on the right (colored), and a `ProgressBar` component below.

**Panel 2 (Your Wins)** -- Maps over `WRAP_REPS` to render cards for each representative the user contacted. Each card has a circular avatar with initials, name and title, and a colored tag pill (emailed/called/texted). Tag colors are defined in the `TAG_COLORS` map.

**Panel 3 (Up Next)** -- Maps over `WRAP_NEXT` to render action-item rows. Each row has an emoji icon, a label with subtitle, and a right-arrow indicator.

**Panel 4 (Civic Vibe)** -- Dark themed panel with motivational copy. Two buttons: a solid "Share" button (brand accent color) and a ghost "Start over" button with a semi-transparent white border. The "Start over" button calls `handleStartOver`, which resets `idx` to 0 and navigates back to `/` using `router.replace('/')`. A footer credits the UMD x Anthropic Hackathon.

### CivicWrap Complete Source Code

```tsx
import { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import ProgressBar from '@/components/ProgressBar';
import { usePersistentState } from '@/hooks/usePersistentState';
import {
  PROFILE,
  WRAP_TOP_ISSUES,
  WRAP_NEXT,
  WRAP_REPS,
} from '@/data/profile';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';

const { height: SCREEN_H } = Dimensions.get('window');

const TAG_COLORS: Record<string, string> = {
  emailed: PS_TOKENS.success,
  called: PS_TOKENS.share,
  texted: '#F59E0B',
};

export function CivicWrap() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [careCount] = usePersistentState<number>('careCount', 0);
  const [, setIdx] = usePersistentState<number>('idx', 0);

  // Animated counter for panel 0
  const [displayCount, setDisplayCount] = useState(0);
  const countStarted = useRef(false);

  useEffect(() => {
    if (countStarted.current) return;
    countStarted.current = true;

    const target = careCount;
    if (target <= 0) {
      setDisplayCount(0);
      return;
    }

    const totalDuration = 600;
    const steps = Math.min(target, 30);
    const intervalMs = totalDuration / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += Math.ceil(target / steps);
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      setDisplayCount(current);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [careCount]);

  const handleStartOver = () => {
    setIdx(0);
    router.replace('/');
  };

  return (
    <ScrollView
      pagingEnabled
      showsVerticalScrollIndicator={false}
      bounces={false}
      style={styles.scroll}
    >
      {/* Panel 0 -- Hero count */}
      <View
        style={[
          styles.panel,
          { backgroundColor: '#FAFAF7', paddingTop: insets.top + 24 },
        ]}
      >
        <Text style={styles.p0TopLabel}>APR 24 . THURSDAY NIGHT</Text>
        <Text style={styles.p0Subhead}>You cared about</Text>
        <Text style={[TEXT.wrapHuge, { color: PS_TOKENS.brand }]}>
          {displayCount}
        </Text>
        <Text style={styles.p0Below}>things tonight.</Text>
        <View style={styles.p0HintWrap}>
          <Text style={styles.p0Hint}>scroll down</Text>
          <Text style={styles.p0Arrow}>v</Text>
        </View>
      </View>

      {/* Panel 1 -- Top Issues */}
      <View style={[styles.panel, { backgroundColor: '#FFF7DE' }]}>
        <View style={styles.panelContent}>
          <Text style={styles.sectionNum}>01 . YOUR TOP ISSUES</Text>
          <Text style={[TEXT.wrapSection, styles.panelHeadline]}>
            You care most about housing & energy
          </Text>
          <View style={styles.barsWrap}>
            {WRAP_TOP_ISSUES.map((issue) => (
              <View key={issue.label} style={styles.barRow}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.barLabel}>{issue.label}</Text>
                  <Text style={[styles.barPct, { color: issue.color }]}>
                    {issue.pct}%
                  </Text>
                </View>
                <ProgressBar pct={issue.pct} color={issue.color} height={8} />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Panel 2 -- Your Wins */}
      <View style={[styles.panel, { backgroundColor: '#FFECEC' }]}>
        <View style={styles.panelContent}>
          <Text style={styles.sectionNum}>02 . YOUR WINS</Text>
          <Text style={[TEXT.wrapSection, styles.panelHeadline]}>
            You emailed 3 reps tonight
          </Text>
          <View style={styles.repsWrap}>
            {WRAP_REPS.map((rep) => (
              <View key={rep.name} style={styles.repCard}>
                <View style={styles.repAvatar}>
                  <Text style={styles.repInitials}>
                    {rep.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)}
                  </Text>
                </View>
                <View style={styles.repInfo}>
                  <Text style={styles.repName}>{rep.name}</Text>
                  <Text style={styles.repTitle}>{rep.title}</Text>
                </View>
                <View
                  style={[
                    styles.repTag,
                    {
                      backgroundColor:
                        (TAG_COLORS[rep.tag] ?? PS_TOKENS.ink3) + '22',
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.repTagText,
                      { color: TAG_COLORS[rep.tag] ?? PS_TOKENS.ink3 },
                    ]}
                  >
                    {rep.tag}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Panel 3 -- Up Next */}
      <View style={[styles.panel, { backgroundColor: '#EAF4FF' }]}>
        <View style={styles.panelContent}>
          <Text style={styles.sectionNum}>03 . UP NEXT</Text>
          <View style={styles.todosWrap}>
            {WRAP_NEXT.map((todo) => (
              <View key={todo.label} style={styles.todoRow}>
                <Text style={styles.todoEmoji}>{todo.emoji}</Text>
                <View style={styles.todoText}>
                  <Text style={styles.todoLabel}>{todo.label}</Text>
                  <Text style={styles.todoSub}>{todo.sub}</Text>
                </View>
                <Text style={styles.todoArrow}>{'>'}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Panel 4 -- Civic Vibe (dark) */}
      <View
        style={[
          styles.panel,
          { backgroundColor: '#111111', paddingBottom: insets.bottom + 24 },
        ]}
      >
        <View style={styles.panelContent}>
          <Text style={[styles.sectionNum, { color: PS_TOKENS.brandAccent }]}>
            04 . YOUR CIVIC VIBE
          </Text>
          <Text style={[TEXT.wrapSection, styles.darkHeadline]}>
            You showed up.
          </Text>
          <Text style={styles.darkBody}>
            Most people scroll past the news. You stopped, read, and took
            action. That is what civic engagement looks like -- and it matters
            more than you think.
          </Text>
          <Pressable style={styles.shareBtn} onPress={() => {}}>
            <Text style={styles.shareBtnText}>Share</Text>
          </Pressable>
          <Pressable style={styles.ghostBtn} onPress={handleStartOver}>
            <Text style={styles.ghostBtnText}>Start over</Text>
          </Pressable>
          <Text style={styles.footer}>Made at UMD x Anthropic Hackathon</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  panel: {
    height: SCREEN_H,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  panelContent: {
    width: '100%',
    maxWidth: 380,
  },

  /* Panel 0 */
  p0TopLabel: {
    ...TEXT.sectionLabel,
    color: PS_TOKENS.ink3,
    textTransform: 'uppercase',
    marginBottom: 24,
    textAlign: 'center',
  },
  p0Subhead: {
    ...TEXT.wrapSection,
    color: PS_TOKENS.ink,
    textAlign: 'center',
  },
  p0Below: {
    ...TEXT.wrapSection,
    color: PS_TOKENS.ink,
    textAlign: 'center',
    marginTop: -4,
  },
  p0HintWrap: {
    position: 'absolute',
    bottom: 48,
    alignSelf: 'center',
    alignItems: 'center',
  },
  p0Hint: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink3,
    marginBottom: 4,
  },
  p0Arrow: {
    fontSize: 16,
    color: PS_TOKENS.ink3,
    fontWeight: '600',
  },

  /* Section numbers */
  sectionNum: {
    ...TEXT.sectionLabel,
    color: PS_TOKENS.ink3,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  panelHeadline: {
    color: PS_TOKENS.ink,
    marginBottom: 28,
  },

  /* Panel 1 -- bars */
  barsWrap: {
    gap: 20,
  },
  barRow: {
    gap: 8,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: PS_TOKENS.ink,
  },
  barPct: {
    fontSize: 15,
    fontWeight: '800',
  },

  /* Panel 2 -- reps */
  repsWrap: {
    gap: 12,
  },
  repCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  repAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: PS_TOKENS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  repInitials: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  repInfo: {
    flex: 1,
  },
  repName: {
    fontSize: 15,
    fontWeight: '700',
    color: PS_TOKENS.ink,
  },
  repTitle: {
    fontSize: 13,
    color: PS_TOKENS.ink2,
    marginTop: 2,
  },
  repTag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  repTagText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  /* Panel 3 -- todos */
  todosWrap: {
    gap: 12,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    gap: 12,
  },
  todoEmoji: {
    fontSize: 22,
  },
  todoText: {
    flex: 1,
  },
  todoLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: PS_TOKENS.ink,
  },
  todoSub: {
    fontSize: 13,
    color: PS_TOKENS.ink2,
    marginTop: 2,
  },
  todoArrow: {
    fontSize: 18,
    color: PS_TOKENS.ink3,
    fontWeight: '600',
  },

  /* Panel 4 -- dark */
  darkHeadline: {
    color: '#FFFFFF',
    fontSize: 36,
    lineHeight: 40,
    marginBottom: 16,
  },
  darkBody: {
    ...TEXT.detailsBody,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 32,
  },
  shareBtn: {
    backgroundColor: PS_TOKENS.brandAccent,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  shareBtnText: {
    ...TEXT.buttonLabel,
    color: PS_TOKENS.ink,
  },
  ghostBtn: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  ghostBtnText: {
    ...TEXT.buttonLabel,
    color: 'rgba(255,255,255,0.7)',
  },
  footer: {
    ...TEXT.actionHint,
    color: 'rgba(255,255,255,0.35)',
    textAlign: 'center',
  },
});
```

---

## Navigation Flow Summary

```
app/_layout.tsx
  GestureHandlerRootView
    SafeAreaProvider
      BottomSheetModalProvider
        Stack (fade transition)
          /           -> app/index.tsx -> StackScreen
          /wrap       -> app/wrap.tsx  -> CivicWrap
```

The user enters at `/` (StackScreen), swipes through cards, and can tap the "Recap" chip in NavChips to navigate to `/wrap` (CivicWrap). From CivicWrap's final panel, the "Start over" button resets the deck index and navigates back to `/`.

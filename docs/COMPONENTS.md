# PoliSwipe -- UI Components Reference

This document covers every shared UI component in the `components/` directory. Each section includes the props interface, a description of what the component renders, the complete source code, and where it is imported.

---

## Table of Contents

1. [TopBar](#topbar)
2. [NavChips](#navchips)
3. [ActionButtons](#actionbuttons)
4. [Chip](#chip)
5. [StatPill](#statpill)
6. [SectionLabel](#sectionlabel)
7. [ProgressBar](#progressbar)
8. [TypingDots](#typingdots)
9. [MapPreview](#mappreview)
10. [EndOfStack](#endofstack)

---

## TopBar

**File:** `components/TopBar.tsx`

### Purpose

The app-wide top navigation bar. Displays a hamburger menu button on the left, the PoliSwipe brand name with a diamond logo in the center, and an "Ask" pill button plus user avatar on the right.

### Props Interface

| Prop   | Type         | Required | Description                          |
|--------|--------------|----------|--------------------------------------|
| onAsk  | `() => void` | Yes      | Callback when the "Ask" pill is pressed |

### Where It Is Used

- `screens/StackScreen.tsx` -- rendered at the top of the main swipe-card screen.

### Complete Source Code

```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PS_TOKENS } from '@/theme/tokens';

interface TopBarProps {
  onAsk: () => void;
}

export default function TopBar({ onAsk }: TopBarProps) {
  return (
    <View style={styles.row}>
      {/* Left: menu button */}
      <Pressable style={styles.menuBtn}>
        <Ionicons name="menu" size={22} color={PS_TOKENS.ink} />
      </Pressable>

      {/* Center: diamond + brand name */}
      <View style={styles.center}>
        <View style={styles.diamond} />
        <Text style={styles.brandText}>PoliSwipe</Text>
      </View>

      {/* Right: Ask pill + avatar */}
      <View style={styles.rightGroup}>
        <Pressable style={styles.askPill} onPress={onAsk}>
          <Text style={styles.askStar}>{'⭐ '}</Text>
          <Text style={styles.askText}>Ask</Text>
        </Pressable>
        <View style={styles.avatar}>
          <Text style={styles.avatarInitial}>J</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    backgroundColor: PS_TOKENS.bg,
  },
  menuBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  diamond: {
    width: 8,
    height: 8,
    backgroundColor: PS_TOKENS.brand,
    transform: [{ rotate: '45deg' }],
  },
  brandText: {
    fontWeight: '900',
    fontSize: 17,
    color: PS_TOKENS.ink,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  askPill: {
    height: 34,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PS_TOKENS.ink,
    paddingHorizontal: 12,
    borderRadius: 17,
  },
  askStar: {
    fontSize: 12,
    color: PS_TOKENS.brandAccent,
  },
  askText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: PS_TOKENS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
```

---

## NavChips

**File:** `components/NavChips.tsx`

### Purpose

A horizontally scrollable row of filter/action pills displayed below the TopBar. Includes a "Filter" pill (with active-count badge), a "Saved" pill (with saved-count badge), a "+ Post" pill, and a highlighted "Recap" pill. Pills toggle between active (dark) and inactive (white) states based on counts.

### Props Interface

| Prop          | Type         | Required | Description                                      |
|---------------|--------------|----------|--------------------------------------------------|
| activeFilters | `string[]`   | Yes      | Currently active filter names; length drives badge count |
| savedCount    | `number`     | Yes      | Number of saved items; shown as badge on Saved pill      |
| careCount     | `number`     | Yes      | Number of care items; shown as badge on Recap pill       |
| onFilter      | `() => void` | Yes      | Callback when the Filter pill is pressed                 |
| onSaved       | `() => void` | Yes      | Callback when the Saved pill is pressed                  |
| onPost        | `() => void` | Yes      | Callback when the Post pill is pressed                   |
| onRecap       | `() => void` | Yes      | Callback when the Recap pill is pressed                  |

### Where It Is Used

- `screens/StackScreen.tsx` -- rendered directly below the TopBar on the main feed screen.

### Complete Source Code

```tsx
import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';
import { shadow } from '@/theme/shadow';

interface NavChipsProps {
  activeFilters: string[];
  savedCount: number;
  careCount: number;
  onFilter: () => void;
  onSaved: () => void;
  onPost: () => void;
  onRecap: () => void;
}

export default function NavChips({
  activeFilters,
  savedCount,
  careCount,
  onFilter,
  onSaved,
  onPost,
  onRecap,
}: NavChipsProps) {
  const filterCount = activeFilters.length;
  const filterActive = filterCount > 0;
  const savedActive = savedCount > 0;

  return (
    <View style={styles.container}>
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scroll}
    >
      {/* Filter pill */}
      <Pressable
        style={[styles.pill, filterActive && styles.pillActive, shadow.softRow]}
        onPress={onFilter}
      >
        <Text style={[styles.pillText, filterActive && styles.pillTextActive]}>
          Filter
        </Text>
        {filterActive && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{filterCount}</Text>
          </View>
        )}
      </Pressable>

      {/* Saved pill */}
      <Pressable
        style={[styles.pill, savedActive && styles.pillActive, shadow.softRow]}
        onPress={onSaved}
      >
        <Text style={[styles.pillText, savedActive && styles.pillTextActive]}>
          Saved
        </Text>
        {savedActive && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{savedCount}</Text>
          </View>
        )}
      </Pressable>

      {/* Post pill */}
      <Pressable style={[styles.pill, shadow.softRow]} onPress={onPost}>
        <Text style={styles.pillText}>+ Post</Text>
      </Pressable>

      {/* Recap pill */}
      <Pressable style={[styles.pill, styles.recapPill]} onPress={onRecap}>
        <Text style={styles.recapText}>Recap</Text>
        {careCount > 0 && (
          <View style={styles.recapBadge}>
            <Text style={styles.badgeText}>{careCount}</Text>
          </View>
        )}
      </Pressable>
    </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 44,
  },
  scroll: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 6,
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: PS_TOKENS.ink,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    color: PS_TOKENS.ink,
  },
  pillTextActive: {
    color: '#FFFFFF',
  },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: PS_TOKENS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 6,
    position: 'relative',
    top: -2,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  recapPill: {
    backgroundColor: PS_TOKENS.brand,
  },
  recapText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  recapBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
    marginLeft: 6,
  },
});
```

---

## ActionButtons

**File:** `components/ActionButtons.tsx`

### Purpose

The three circular action buttons at the bottom of the swipe-card screen. Provides Skip (red X), Share (blue arrow), and Care (green heart) actions. Each button is a bordered circle with a colored glyph and a label underneath. Platform-specific colored shadows are applied to each circle.

### Props Interface

| Prop     | Type         | Required | Default | Description                             |
|----------|--------------|----------|---------|-----------------------------------------|
| onLeft   | `() => void` | Yes      | --      | Callback for the Skip (X) button        |
| onShare  | `() => void` | Yes      | --      | Callback for the Share (arrow) button   |
| onRight  | `() => void` | Yes      | --      | Callback for the Care (heart) button    |
| disabled | `boolean`    | No       | `false` | When true, disables pointer events on all buttons |

### Where It Is Used

- `screens/StackScreen.tsx` -- rendered below the card stack as the primary interaction controls.

### Complete Source Code

```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';

interface ActionButtonsProps {
  onLeft: () => void;
  onShare: () => void;
  onRight: () => void;
  disabled?: boolean;
}

export default function ActionButtons({
  onLeft,
  onShare,
  onRight,
  disabled,
}: ActionButtonsProps) {
  return (
    <View style={styles.row} pointerEvents={disabled ? 'none' : 'auto'}>
      {/* Skip */}
      <View style={styles.btnWrap}>
        <Pressable
          style={[
            styles.circle,
            styles.skipCircle,
            {
              ...Platform.select({
                ios: { shadowColor: PS_TOKENS.danger, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 14 },
                android: { elevation: 6 },
              }),
            },
          ]}
          onPress={onLeft}
        >
          <Text style={[styles.glyph, { color: PS_TOKENS.danger }]}>{'✕'}</Text>
        </Pressable>
        <Text style={[styles.label, { color: PS_TOKENS.danger }]}>SKIP</Text>
      </View>

      {/* Share */}
      <View style={styles.btnWrap}>
        <Pressable
          style={[
            styles.circle,
            styles.shareCircle,
            {
              ...Platform.select({
                ios: { shadowColor: PS_TOKENS.share, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 14 },
                android: { elevation: 6 },
              }),
            },
          ]}
          onPress={onShare}
        >
          <Text style={[styles.glyph, { color: PS_TOKENS.share }]}>{'↑'}</Text>
        </Pressable>
        <Text style={[styles.label, { color: PS_TOKENS.share }]}>SHARE</Text>
      </View>

      {/* Care */}
      <View style={styles.btnWrap}>
        <Pressable
          style={[
            styles.circle,
            styles.careCircle,
            {
              ...Platform.select({
                ios: { shadowColor: PS_TOKENS.success, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 14 },
                android: { elevation: 6 },
              }),
            },
          ]}
          onPress={onRight}
        >
          <Text style={[styles.careGlyph, { color: PS_TOKENS.success }]}>{'♥'}</Text>
        </Pressable>
        <Text style={[styles.label, { color: PS_TOKENS.success }]}>CARE</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 28,
    paddingVertical: 14,
  },
  btnWrap: {
    alignItems: 'center',
  },
  circle: {
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: PS_TOKENS.danger,
  },
  shareCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: PS_TOKENS.share,
  },
  careCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    borderColor: PS_TOKENS.success,
  },
  glyph: {
    fontSize: 24,
    fontWeight: '700',
  },
  careGlyph: {
    fontSize: 26,
    fontWeight: '700',
  },
  label: {
    fontSize: 10.5,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginTop: 6,
  },
});
```

---

## Chip

**File:** `components/Chip.tsx`

### Purpose

A small colored pill used to display category/topic tags on cards and detail sheets. Each chip shows an emoji icon on the left and an uppercase label on the right. The background color is determined by the `type` prop via `PS_TOKENS.chip`, and the text color adjusts for the "campus" type to use `brandAccent` instead of white.

### Props Interface

| Prop    | Type      | Required | Default | Description                                        |
|---------|-----------|----------|---------|----------------------------------------------------|
| type    | `string`  | Yes      | --      | Category key used to look up background color from `PS_TOKENS.chip` |
| emoji   | `string`  | Yes      | --      | Emoji displayed to the left of the label           |
| label   | `string`  | Yes      | --      | Uppercase text label for the chip                  |
| compact | `boolean` | No       | `false` | When true, reduces padding for a smaller variant   |

### Where It Is Used

- `card/CardFace.tsx` -- displayed on the front face of swipe cards to show issue category.
- `sheets/DetailsSheet.tsx` -- shown in the detail bottom sheet for topic tagging.

### Complete Source Code

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';

interface ChipProps {
  type: string;
  emoji: string;
  label: string;
  compact?: boolean;
}

export default function Chip({ type, emoji, label, compact }: ChipProps) {
  const bg = PS_TOKENS.chip[type] ?? PS_TOKENS.ink;
  const fg = type === 'campus' ? PS_TOKENS.brandAccent : '#FFFFFF';

  return (
    <View style={[styles.pill, { backgroundColor: bg }, compact && styles.compact]}>
      <View style={styles.emojiWrap}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    gap: 5,
  },
  compact: {
    paddingVertical: 3,
    paddingHorizontal: 8,
  },
  emojiWrap: {
    width: 16,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 12,
  },
  label: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.95,
    textTransform: 'uppercase',
  },
});
```

---

## StatPill

**File:** `components/StatPill.tsx`

### Purpose

A read-only statistic indicator pill used on card faces. Displays an icon (emoji/symbol) and a text value with a tinted background. The background is a 13%-opacity version of the tone color (appended with `"22"`), giving each stat pill a subtle colored background that matches its semantic meaning.

### Props Interface

| Prop | Type     | Required | Description                                               |
|------|----------|----------|-----------------------------------------------------------|
| icon | `string` | Yes      | Emoji or symbol displayed to the left of the text         |
| text | `string` | Yes      | The stat value or label text                              |
| tone | `string` | Yes      | Color key looked up from `PS_TOKENS.chip`; tints the pill |

### Where It Is Used

- `card/CardFace.tsx` -- displayed on swipe cards to show engagement stats (e.g. votes, comments).

### Complete Source Code

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';

interface StatPillProps {
  icon: string;
  text: string;
  tone: string;
}

export default function StatPill({ icon, text, tone }: StatPillProps) {
  const toneColor = PS_TOKENS.chip[tone] ?? PS_TOKENS.ink;
  const bg = toneColor + '22';

  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.icon, { color: toneColor }]}>{icon}</Text>
      <Text style={[styles.text, { color: toneColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
    gap: 5,
  },
  icon: {
    fontSize: 13,
  },
  text: {
    fontSize: 13,
    fontWeight: '700',
  },
});
```

---

## SectionLabel

**File:** `components/SectionLabel.tsx`

### Purpose

A simple uppercase section heading used inside bottom sheets and detail views. Renders a styled `<Text>` element using the shared `TEXT.sectionLabel` typography preset in a muted ink color.

### Props Interface

| Prop     | Type     | Required | Description                     |
|----------|----------|----------|---------------------------------|
| children | `string` | Yes      | The section heading text to display |

### Where It Is Used

- `sheets/DetailsSheet.tsx` -- used to label sections (e.g. "Key Points", "Timeline") inside the card detail sheet.

### Complete Source Code

```tsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';

interface SectionLabelProps {
  children: string;
}

export default function SectionLabel({ children }: SectionLabelProps) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    ...TEXT.sectionLabel,
    color: PS_TOKENS.ink3,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 20,
  },
});
```

---

## ProgressBar

**File:** `components/ProgressBar.tsx`

### Purpose

A horizontal progress/percentage bar. Renders an outer track with a semi-transparent background and a colored inner fill whose width is driven by the `pct` prop (clamped to 0--100). Both the track and fill use matching rounded corners based on the bar height.

### Props Interface

| Prop   | Type     | Required | Default | Description                                |
|--------|----------|----------|---------|--------------------------------------------|
| pct    | `number` | Yes      | --      | Fill percentage (0--100); clamped internally |
| color  | `string` | Yes      | --      | Background color of the filled portion     |
| height | `number` | No       | `6`     | Height of the bar in pixels                |

### Where It Is Used

- `screens/CivicWrap.tsx` -- displayed in the Civic Wrap summary screen to visualize engagement statistics.

### Complete Source Code

```tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface ProgressBarProps {
  pct: number;
  color: string;
  height?: number;
}

export default function ProgressBar({ pct, color, height = 6 }: ProgressBarProps) {
  return (
    <View style={[styles.outer, { height, borderRadius: height / 2 }]}>
      <View
        style={[
          styles.inner,
          {
            width: `${Math.min(Math.max(pct, 0), 100)}%`,
            backgroundColor: color,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  inner: {
    height: '100%',
  },
});
```

---

## TypingDots

**File:** `components/TypingDots.tsx`

### Purpose

An animated "typing indicator" showing three dots that pulse in a staggered sequence. Each dot fades between 0.2 and 1.0 opacity in a looping animation with a 150ms stagger between dots, creating the classic "someone is typing" effect. Uses React Native's `Animated` API with `useNativeDriver` for smooth performance.

### Props Interface

This component takes no props.

### Where It Is Used

- `sheets/ChatSheet.tsx` -- shown in the AI chat bottom sheet while waiting for a response.

### Complete Source Code

```tsx
import React, { useRef, useEffect } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';

const DOT_COUNT = 3;
const DURATION = 1200;
const STAGGER = 150;

export default function TypingDots() {
  const anims = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0.2)),
  ).current;

  useEffect(() => {
    const animations = anims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * STAGGER),
          Animated.timing(anim, {
            toValue: 1,
            duration: DURATION / 2,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.2,
            duration: DURATION / 2,
            useNativeDriver: true,
          }),
        ]),
      ),
    );

    const parallel = Animated.parallel(animations);
    parallel.start();

    return () => {
      parallel.stop();
    };
  }, [anims]);

  return (
    <View style={styles.row}>
      {anims.map((anim, i) => (
        <Animated.View key={i} style={[styles.dot, { opacity: anim }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: PS_TOKENS.ink3,
  },
});
```

---

## MapPreview

**File:** `components/MapPreview.tsx`

### Purpose

A decorative, static map placeholder used inside card detail views. Renders a stylized mini-map with a green "park" blob, horizontal and vertical road lines, and a centered pin marker with a fist emoji. This is a purely visual component meant to indicate location context without requiring an actual map SDK.

### Props Interface

This component takes no props.

### Where It Is Used

- Referenced in the UI design spec for use on card detail views to show event/issue location. Currently defined but not imported by any screen or sheet in the codebase.

### Complete Source Code

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';

export default function MapPreview() {
  return (
    <View style={styles.root}>
      {/* Park blob */}
      <View style={styles.park} />

      {/* Horizontal roads */}
      <View style={[styles.hRoad, { top: '30%' }]} />
      <View style={[styles.hRoad, { top: '65%' }]} />

      {/* Vertical road */}
      <View style={[styles.vRoad, { left: '62%' }]} />

      {/* Pin */}
      <View style={styles.pinWrap}>
        <View style={styles.pin}>
          <Text style={styles.pinEmoji}>{'✊'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    height: 118,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E8F0E5',
    position: 'relative',
  },
  park: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 78,
    height: 54,
    borderRadius: 24,
    backgroundColor: '#C3DDB2',
  },
  hRoad: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '-1deg' }],
  },
  vRoad: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#FFFFFF',
  },
  pinWrap: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pin: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: PS_TOKENS.brand,
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinEmoji: {
    fontSize: 12,
  },
});
```

---

## EndOfStack

**File:** `components/EndOfStack.tsx`

### Purpose

A full-screen "all caught up" message displayed when the user has swiped through every card in their feed. Shows a party emoji, a congratulatory headline, descriptive subtext, and a call-to-action button that navigates to the Civic Wrap summary screen.

### Props Interface

| Prop   | Type         | Required | Description                                       |
|--------|--------------|----------|---------------------------------------------------|
| onWrap | `() => void` | Yes      | Callback when "See your Civic Wrap" button is pressed |

### Where It Is Used

- Referenced in the UI design spec as the view shown on `StackScreen` when the card stack is empty. Currently defined but not imported by any screen file in the codebase.

### Complete Source Code

```tsx
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { PS_TOKENS } from '@/theme/tokens';

interface EndOfStackProps {
  onWrap: () => void;
}

export default function EndOfStack({ onWrap }: EndOfStackProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{'🎉'}</Text>
      <Text style={styles.headline}>{"You're all caught up."}</Text>
      <Text style={styles.subtext}>
        You swiped through every card in your feed. Nice work!
      </Text>
      <Pressable style={styles.button} onPress={onWrap}>
        <Text style={styles.buttonText}>See your Civic Wrap</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    color: PS_TOKENS.ink,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtext: {
    fontSize: 15,
    color: PS_TOKENS.ink2,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
  },
  button: {
    backgroundColor: PS_TOKENS.brand,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
```

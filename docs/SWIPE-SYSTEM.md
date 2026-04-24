# Swipe Card System

This document covers the complete swipe card system used in PoliSwipe: gesture detection, animation, card stack rendering, overlay feedback, card layout, and haptic feedback.

The system is built on five files that work together:

| File | Role |
|---|---|
| `card/SwipeCard.tsx` | Top-level card component; wires gesture, animation, and rendering together |
| `card/useSwipeGesture.ts` | Pan gesture hook; owns thresholds, fly-off animation, and haptic triggers |
| `card/SwipeOverlay.tsx` | Directional tint + stamp overlay shown during drag |
| `card/CardFace.tsx` | Card content layout (chip, headline, summary, stat, footer, sources) |
| `hooks/useHaptic.ts` | Reusable haptic feedback map for each swipe direction |

---

## 1. SwipeCard -- Orchestrator

`SwipeCard` is the top-level component rendered for each card in the deck. It connects the pan gesture from `useSwipeGesture`, applies animated transforms, and renders `CardFace` inside a `GestureDetector`.

### 3-Card Stack Rendering

Cards that are **not** on top (`isTop === false`) receive a static transform based on their `stackIndex`:

- **translateY**: `stackIndex * 10` -- each successive card shifts 10pt downward, creating a visible peek behind the top card.
- **scale**: `1 - stackIndex * 0.04` -- each successive card is 4% smaller, reinforcing depth.
- **zIndex**: `10 - stackIndex` -- the top card sits at z-index 10, the next at 9, and so on.

The top card (`isTop === true`) is driven entirely by the shared values `tx`, `ty`, and `pressing` from the gesture hook:

- **translateX / translateY**: follows the finger during drag, then animates to fly-off or spring-back.
- **rotate**: `tx * 0.05` degrees -- a subtle tilt that follows horizontal displacement.
- **scale**: `1 - pressing * 0.015` -- a slight press-down effect (1.5% shrink) that eases in over 120ms when the finger touches down.

### Complete Source -- `card/SwipeCard.tsx`

```tsx
import React from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { GestureDetector } from 'react-native-gesture-handler';
import { CardFace } from './CardFace';
import { useSwipeGesture } from './useSwipeGesture';
import type { Card, SwipeDir } from '@/types';

interface SwipeCardProps {
  card: Card;
  isTop: boolean;
  stackIndex: number;
  onSwipe: (c: Card, d: SwipeDir) => void;
  onMoreDetails: (c: Card) => void;
}

export function SwipeCard({
  card,
  isTop,
  stackIndex,
  onSwipe,
  onMoreDetails,
}: SwipeCardProps) {
  const { pan, tx, ty, pressing } = useSwipeGesture(card, isTop, onSwipe);

  const style = useAnimatedStyle(() => {
    if (!isTop) {
      return {
        transform: [
          { translateY: stackIndex * 10 },
          { scale: 1 - stackIndex * 0.04 },
        ],
      };
    }
    return {
      transform: [
        { translateX: tx.value },
        { translateY: ty.value },
        { rotate: `${tx.value * 0.05}deg` },
        { scale: 1 - pressing.value * 0.015 },
      ],
    };
  });

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10 - stackIndex,
          },
          style,
        ]}
      >
        <CardFace
          card={card}
          tx={tx}
          ty={ty}
          isTop={isTop}
          onMoreDetails={onMoreDetails}
        />
      </Animated.View>
    </GestureDetector>
  );
}
```

---

## 2. useSwipeGesture -- Pan Gesture and Animation

This hook owns the full gesture lifecycle: touch-down, drag tracking, commit-or-cancel decision, fly-off animation, and haptic feedback.

### Configuration Constants

| Constant | Value | Purpose |
|---|---|---|
| `THRESHOLD` | `90` | Minimum px displacement (in either axis) before a swipe is committed. Below this the card springs back. |
| `FLY_X` | `600` | Horizontal fly-off distance (px) for left/right swipes. |
| `FLY_Y` | `700` | Vertical fly-off distance (px) for up swipes. |
| `DURATION` | `280` | Fly-off animation duration in ms (`withTiming`). |

### Gesture Flow

1. **onBegin** -- The `pressing` shared value animates to `1` over 120ms. This drives the subtle scale-down in `SwipeCard`.

2. **onUpdate** -- `tx` and `ty` track the raw `translationX` / `translationY` from the gesture event in real time. No clamping or damping is applied; the card follows the finger 1:1.

3. **onFinalize** -- The commit/cancel decision:
   - If both `|translationX|` and `|translationY|` are below `THRESHOLD` (90px), the card **springs back** to origin with `withSpring`.
   - Otherwise, the dominant axis determines direction:
     - `|X| > |Y|` and `X > 0` --> `right`
     - `|X| > |Y|` and `X < 0` --> `left`
     - `|Y| > |X|` and `Y < 0` --> `up`
     - `|Y| > |X|` and `Y > 0` --> `down`
   - **Down swipe** is special: the card springs back to origin (no fly-off), and the `triggerSwipe` callback fires immediately via `runOnJS`.
   - **All other directions**: the card animates to its fly-off target (`FLY_X` or `-FLY_X` for horizontal, `-FLY_Y` for up) using `withTiming` over 280ms. The `triggerSwipe` callback fires only after the animation completes (`fin === true`).

### Haptic Feedback (inline)

The `triggerSwipe` function fires haptics directly before calling `onSwipe`:

| Direction | Haptic |
|---|---|
| Right (CARE) | `ImpactFeedbackStyle.Medium` |
| Left (SKIP) | `NotificationFeedbackType.Warning` |
| Up (SHARE) | `ImpactFeedbackStyle.Light` |
| Down (ASK) | `ImpactFeedbackStyle.Light` |

### Complete Source -- `card/useSwipeGesture.ts`

```ts
import { Gesture } from 'react-native-gesture-handler';
import {
  runOnJS,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import type { Card, SwipeDir } from '@/types';

const THRESHOLD = 90;
const FLY_X = 600;
const FLY_Y = 700;
const DURATION = 280;

export function useSwipeGesture(
  card: Card,
  isTop: boolean,
  onSwipe: (c: Card, d: SwipeDir) => void,
) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const pressing = useSharedValue(0);

  const triggerSwipe = (dir: SwipeDir) => {
    if (dir === 'right')
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    else if (dir === 'left')
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onSwipe(card, dir);
  };

  const pan = Gesture.Pan()
    .enabled(isTop)
    .onBegin(() => {
      pressing.value = withTiming(1, { duration: 120 });
    })
    .onUpdate((e) => {
      tx.value = e.translationX;
      ty.value = e.translationY;
    })
    .onFinalize((e) => {
      pressing.value = withTiming(0, { duration: 120 });
      const absX = Math.abs(e.translationX);
      const absY = Math.abs(e.translationY);

      if (absX < THRESHOLD && absY < THRESHOLD) {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
        return;
      }

      let dir: SwipeDir;
      if (absX > absY) dir = e.translationX > 0 ? 'right' : 'left';
      else dir = e.translationY < 0 ? 'up' : 'down';

      if (dir === 'down') {
        tx.value = withSpring(0);
        ty.value = withSpring(0);
        runOnJS(triggerSwipe)('down');
      } else {
        const tX = dir === 'right' ? FLY_X : dir === 'left' ? -FLY_X : 0;
        const tY = dir === 'up' ? -FLY_Y : 0;
        tx.value = withTiming(tX, { duration: DURATION });
        ty.value = withTiming(tY, { duration: DURATION }, (fin) => {
          if (fin) runOnJS(triggerSwipe)(dir);
        });
      }
    });

  return { pan, tx, ty, pressing };
}
```

---

## 3. SwipeOverlay -- Visual Feedback

`SwipeOverlay` renders a full-bleed color tint and a directional stamp on top of the card face. It reads `tx` and `ty` to determine direction and strength in real time on the UI thread.

### Derived Values

- **strength**: `min(1, max(|tx|, |ty|) / 120)` -- ramps linearly from 0 to 1 as the finger moves. The divisor (120) means the overlay reaches full intensity at 120px of displacement.
- **direction**: determined by comparing `|tx|` vs `|ty|`, with a 5px dead zone. Returns `'right'`, `'left'`, `'up'`, `'down'`, or `'none'`.

### Tint Colors

| Direction | Color | Meaning |
|---|---|---|
| Right | `#22C55E` (green) | CARE |
| Left | `#EF4444` (red) | SKIP |
| Up | `#3B82F6` (blue) | SHARE |
| Down | `#111111` (near-black) | ASK |

Tint opacity is `strength * 0.72` (max 72% opacity at full displacement).

### Stamp Rendering

All four stamps (CARE, SKIP, SHARE, ASK) are rendered simultaneously. Only the active direction's stamp has opacity 1; the others are at 0. This avoids conditional rendering on the UI thread.

Stamp transform:
- **scale**: `0.6 + strength * 0.4` -- starts at 60% and grows to 100% as the drag progresses.
- **rotation**: `-14deg` for right swipe, `+14deg` for left swipe, `0` for up/down.
- **position**: right stamp is positioned top-left (`top: 40, left: 24`), left stamp is top-right (`top: 40, right: 24`), up/down stamps are centered.

Stamp visual:
- White border (4px), border-radius 12, padding 22h/10v.
- Font size 34, weight 900, letter-spacing 2.
- Each stamp includes an emoji icon and a text label.

| Direction | Emoji | Label |
|---|---|---|
| Right | Heart | CARE |
| Left | Cross | SKIP |
| Up | Up arrow | SHARE |
| Down | Chevron | ASK |

### Complete Source -- `card/SwipeOverlay.tsx`

```tsx
import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  type SharedValue,
} from 'react-native-reanimated';

const STAMP_BORDER = 4;
const STAMP_RADIUS = 12;
const STAMP_PH = 22;
const STAMP_PV = 10;
const STAMP_FONT = 34;
const STAMP_LETTER_SPACING = 2;
const ROTATION_DEG = 14;
const STRENGTH_DIVISOR = 120;
const MAX_TINT_OPACITY = 0.72;

interface SwipeOverlayProps {
  tx: SharedValue<number>;
  ty: SharedValue<number>;
}

export function SwipeOverlay({ tx, ty }: SwipeOverlayProps) {
  const strength = useDerivedValue(() => {
    const absX = Math.abs(tx.value);
    const absY = Math.abs(ty.value);
    return Math.min(1, Math.max(absX, absY) / STRENGTH_DIVISOR);
  });

  const direction = useDerivedValue(() => {
    const absX = Math.abs(tx.value);
    const absY = Math.abs(ty.value);
    if (absX < 5 && absY < 5) return 'none';
    if (absX > absY) return tx.value > 0 ? 'right' : 'left';
    return ty.value < 0 ? 'up' : 'down';
  });

  const tintStyle = useAnimatedStyle(() => {
    let color: string;
    switch (direction.value) {
      case 'right':
        color = '#22C55E';
        break;
      case 'left':
        color = '#EF4444';
        break;
      case 'up':
        color = '#3B82F6';
        break;
      case 'down':
        color = '#111111';
        break;
      default:
        color = '#000000';
        break;
    }
    return {
      backgroundColor: color,
      opacity: strength.value * MAX_TINT_OPACITY,
    };
  });

  const stampStyle = useAnimatedStyle(() => {
    const dir = direction.value;
    const s = strength.value;
    const scale = 0.6 + s * 0.4;

    let rotation = 0;
    let top: number | undefined;
    let left: number | undefined;
    let right: number | undefined;
    let alignSelf: 'flex-start' | 'flex-end' | 'center' = 'center';
    let justifySelf: string | undefined;

    if (dir === 'right') {
      rotation = -ROTATION_DEG;
      top = 40;
      left = 24;
      alignSelf = 'flex-start';
    } else if (dir === 'left') {
      rotation = ROTATION_DEG;
      top = 40;
      right = 24;
      alignSelf = 'flex-end';
    }

    return {
      transform: [{ rotate: `${rotation}deg` }, { scale }],
      opacity: s,
      ...(top !== undefined && { marginTop: top }),
      ...(left !== undefined && { marginLeft: left }),
      ...(right !== undefined && { marginRight: right }),
      alignSelf,
    };
  });

  const stampTextStyle = useAnimatedStyle(() => {
    const dir = direction.value;
    let label: string;
    switch (dir) {
      case 'right':
        label = 'CARE';
        break;
      case 'left':
        label = 'SKIP';
        break;
      case 'up':
        label = 'SHARE';
        break;
      case 'down':
        label = 'ASK';
        break;
      default:
        label = '';
        break;
    }
    // We can't set text content from animated style, so this is a no-op
    // We'll use separate animated components for each label
    return {};
  });

  // Since we can't conditionally render text in animated styles,
  // we render all four stamps and control their visibility
  const rightStampOpacity = useAnimatedStyle(() => ({
    opacity: direction.value === 'right' ? 1 : 0,
  }));

  const leftStampOpacity = useAnimatedStyle(() => ({
    opacity: direction.value === 'left' ? 1 : 0,
  }));

  const upStampOpacity = useAnimatedStyle(() => ({
    opacity: direction.value === 'up' ? 1 : 0,
  }));

  const downStampOpacity = useAnimatedStyle(() => ({
    opacity: direction.value === 'down' ? 1 : 0,
  }));

  return (
    <Animated.View
      pointerEvents="none"
      style={[StyleSheet.absoluteFill, styles.container]}
    >
      {/* Full-bleed tint */}
      <Animated.View
        style={[StyleSheet.absoluteFill, styles.tint, tintStyle]}
      />

      {/* Stamp container */}
      <Animated.View style={[styles.stampPositioner, stampStyle]}>
        {/* CARE stamp - right swipe */}
        <Animated.View style={[styles.stampRow, rightStampOpacity]}>
          <Animated.Text style={styles.stampEmoji}>{'\u2764\uFE0F'}</Animated.Text>
          <Animated.Text style={styles.stampText}>CARE</Animated.Text>
        </Animated.View>

        {/* SKIP stamp - left swipe */}
        <Animated.View
          style={[styles.stampRow, styles.stampAbsolute, leftStampOpacity]}
        >
          <Animated.Text style={styles.stampEmoji}>{'\u2715'}</Animated.Text>
          <Animated.Text style={styles.stampText}>SKIP</Animated.Text>
        </Animated.View>

        {/* SHARE stamp - up swipe */}
        <Animated.View
          style={[styles.stampRow, styles.stampAbsolute, upStampOpacity]}
        >
          <Animated.Text style={styles.stampEmoji}>{'\u2191'}</Animated.Text>
          <Animated.Text style={styles.stampText}>SHARE</Animated.Text>
        </Animated.View>

        {/* ASK stamp - down swipe */}
        <Animated.View
          style={[styles.stampRow, styles.stampAbsolute, downStampOpacity]}
        >
          <Animated.Text style={styles.stampEmoji}>{'\u2304'}</Animated.Text>
          <Animated.Text style={styles.stampText}>ASK</Animated.Text>
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  tint: {
    borderRadius: 24,
  },
  stampPositioner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stampRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: STAMP_BORDER,
    borderColor: '#FFFFFF',
    borderRadius: STAMP_RADIUS,
    paddingVertical: STAMP_PV,
    paddingHorizontal: STAMP_PH,
    gap: 8,
  },
  stampAbsolute: {
    position: 'absolute',
  },
  stampEmoji: {
    fontSize: STAMP_FONT - 6,
    color: '#FFFFFF',
  },
  stampText: {
    fontWeight: '900',
    fontSize: STAMP_FONT,
    color: '#FFFFFF',
    letterSpacing: STAMP_LETTER_SPACING,
  },
});
```

---

## 4. CardFace -- Content Layout

`CardFace` is the visible content of each card. It supports two card variants: standard policy cards and rally (event) cards. The layout is a vertical flex column inside a rounded-corner container.

### Layout Structure (top to bottom)

1. **Chip** -- a small colored badge at the top showing card type, emoji, and label (e.g., "Policy", "Rally").
2. **Headline** -- bold title text, `marginTop: 14`.
3. **Summary** -- secondary description text in `ink2` color, `marginTop: 10`.
4. **Rally section** (rally cards only):
   - Map preview placeholder (120px tall, rounded, tinted background).
   - When/Where tiles in a horizontal row -- each shows a label, value, and sub-value.
   - Weather + attendance row (icon, temp, description, going count).
5. **Stat pill** (non-rally cards only) -- a small pill showing an icon, text, and tone.
6. **Spacer** -- `flex: 1` pushes the footer to the bottom.
7. **Footer** -- dashed top border, contains:
   - Left side: right-arrow icon + action hint text.
   - Right side: "Details" button with a northeast-arrow icon. Tinted background using `PS_TOKENS.share`.
8. **Sources row** -- up to 2 source chips, each showing a northeast-arrow icon and a truncated title (max 130px).
9. **SwipeOverlay** -- rendered last (on top of everything) only when `isTop` is true, inside a `pointerEvents="none"` wrapper.

### Complete Source -- `card/CardFace.tsx`

```tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';
import { shadow } from '@/theme/shadow';
import Chip from '@/components/Chip';
import StatPill from '@/components/StatPill';
import { SwipeOverlay } from './SwipeOverlay';
import type { Card } from '@/types';

interface CardFaceProps {
  card: Card;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  isTop: boolean;
  onMoreDetails: (card: Card) => void;
}

export function CardFace({ card, tx, ty, isTop, onMoreDetails }: CardFaceProps) {
  const isRally = card.type === 'rally';
  const hasRallyMeta = isRally && card.when && card.where;

  return (
    <View style={styles.root}>
      {/* Chip */}
      <Chip type={card.type} emoji={card.emoji} label={card.chipLabel} />

      {/* Headline */}
      <Text style={styles.headline}>{card.headline}</Text>

      {/* Summary */}
      <Text style={styles.summary}>{card.summary}</Text>

      {/* Rally-specific metadata */}
      {hasRallyMeta && (
        <View style={styles.rallySection}>
          {/* Map preview placeholder */}
          <View style={styles.mapPreview}>
            <Text style={styles.mapPlaceholderText}>
              {card.where!.place}
            </Text>
          </View>

          {/* When / Where tiles */}
          <View style={styles.tilesRow}>
            {/* When tile */}
            <View style={styles.tile}>
              <Text style={styles.tileLabel}>WHEN</Text>
              <Text style={styles.tileValue}>{card.when!.dateLabel}</Text>
              <Text style={styles.tileSubValue}>{card.when!.time}</Text>
            </View>

            {/* Where tile */}
            <View style={styles.tile}>
              <Text style={styles.tileLabel}>WHERE</Text>
              <Text style={styles.tileValue}>{card.where!.place}</Text>
              <Text style={styles.tileSubValue}>
                {card.where!.walkMin} min walk
              </Text>
            </View>
          </View>

          {/* Weather + attendance row */}
          {card.weather && (
            <View style={styles.weatherRow}>
              <View style={styles.weatherLeft}>
                <Text style={styles.weatherIcon}>{card.weather.icon}</Text>
                <Text style={styles.weatherTemp}>{card.weather.temp}</Text>
                <Text style={styles.weatherDesc}>{card.weather.desc}</Text>
              </View>
              <Text style={styles.weatherRight}>
                {card.going != null ? `${card.going} going` : ''}
                {card.going != null && card.majorGoing != null ? ' \u00B7 ' : ''}
                {card.majorGoing != null ? `${card.majorGoing} CS` : ''}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Stat pill for non-rally cards */}
      {!isRally && card.stat && (
        <View style={styles.statWrap}>
          <StatPill icon={card.stat.icon} text={card.stat.text} tone={card.stat.tone} />
        </View>
      )}

      {/* Spacer */}
      <View style={styles.spacer} />

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.actionArrow}>{'\u2192'}</Text>
          <Text style={styles.actionHint}>{card.actionHint}</Text>
        </View>
        <Pressable
          style={styles.detailsButton}
          onPress={() => onMoreDetails(card)}
          hitSlop={8}
        >
          <Text style={styles.detailsButtonText}>Details</Text>
          <Text style={styles.detailsArrow}>{'\u2197'}</Text>
        </Pressable>
      </View>
      {card.sources.length > 0 && (
        <View style={styles.sourcesRow}>
          {card.sources.slice(0, 2).map((src, i) => (
            <View key={i} style={styles.sourceChip}>
              <Text style={styles.sourceArrowIcon}>{'\u2197'}</Text>
              <Text style={styles.sourceChipText} numberOfLines={1}>{src.title}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Swipe overlay -- only on top card */}
      {isTop && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <SwipeOverlay tx={tx} ty={ty} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: PS_TOKENS.card,
    borderRadius: 24,
    padding: 22,
    overflow: 'hidden',
    ...shadow.card,
  },
  headline: {
    ...TEXT.cardHeadline,
    color: PS_TOKENS.ink,
    marginTop: 14,
  },
  summary: {
    ...TEXT.cardSummary,
    color: PS_TOKENS.ink2,
    marginTop: 10,
  },

  // Rally section
  rallySection: {
    marginTop: 16,
    gap: 10,
  },
  mapPreview: {
    height: 120,
    borderRadius: 14,
    backgroundColor: PS_TOKENS.tint,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  mapPlaceholderText: {
    fontSize: 13,
    color: PS_TOKENS.ink3,
    fontWeight: '600',
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tile: {
    flex: 1,
    backgroundColor: PS_TOKENS.tint,
    borderRadius: 14,
    padding: 12,
  },
  tileLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    color: PS_TOKENS.ink3,
    marginBottom: 4,
  },
  tileValue: {
    fontSize: 14,
    fontWeight: '700',
    color: PS_TOKENS.ink,
  },
  tileSubValue: {
    fontSize: 12,
    fontWeight: '500',
    color: PS_TOKENS.ink2,
    marginTop: 2,
  },

  // Weather row
  weatherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  weatherLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  weatherIcon: {
    fontSize: 16,
  },
  weatherTemp: {
    fontSize: 13,
    fontWeight: '700',
    color: PS_TOKENS.ink,
  },
  weatherDesc: {
    fontSize: 13,
    fontWeight: '500',
    color: PS_TOKENS.ink2,
  },
  weatherRight: {
    fontSize: 12,
    fontWeight: '600',
    color: PS_TOKENS.ink2,
  },

  // Stat
  statWrap: {
    marginTop: 14,
  },

  // Spacer
  spacer: {
    flex: 1,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderColor: PS_TOKENS.dividerWarm,
    paddingTop: 12,
    marginTop: 12,
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexShrink: 1,
  },
  actionArrow: {
    fontSize: 14,
    color: PS_TOKENS.ink3,
    fontWeight: '600',
  },
  actionHint: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink3,
    fontWeight: '600',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: PS_TOKENS.share + '14',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PS_TOKENS.share + '30',
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: PS_TOKENS.share,
  },
  detailsArrow: {
    fontSize: 11,
    color: PS_TOKENS.share,
    fontWeight: '700',
  },
  sourcesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  sourceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: PS_TOKENS.tint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  sourceArrowIcon: {
    fontSize: 9,
    color: PS_TOKENS.share,
    fontWeight: '700',
  },
  sourceChipText: {
    fontSize: 10,
    fontWeight: '500',
    color: PS_TOKENS.ink2,
    maxWidth: 130,
  },
});
```

---

## 5. useHaptic -- Reusable Haptic Map

`useHaptic` provides a clean interface for triggering haptics from any component, not just the gesture handler. While `useSwipeGesture` fires haptics inline during swipe commit, this hook is available for buttons, bottom sheets, or any other UI that needs direction-specific feedback.

### Haptic Map

| Key | Expo Haptics Call | Feel |
|---|---|---|
| `care` | `impactAsync(Medium)` | Firm thud -- positive confirmation |
| `skip` | `notificationAsync(Warning)` | Double-buzz warning -- dismissal |
| `share` | `impactAsync(Light)` | Gentle tap -- lightweight action |
| `ask` | `impactAsync(Light)` | Gentle tap -- lightweight action |
| `tap` | `selectionAsync()` | Minimal click -- general UI interaction |

### Complete Source -- `hooks/useHaptic.ts`

```ts
import * as Haptics from 'expo-haptics';

export function useHaptic() {
  return {
    care:  () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium),
    skip:  () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
    share: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    ask:   () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
    tap:   () => Haptics.selectionAsync(),
  };
}
```

---

## 6. End-to-End Swipe Lifecycle

Putting it all together, here is what happens during a single swipe from finger-down to card removal:

1. User touches the top card. `GestureDetector` recognizes a pan gesture. `onBegin` fires, animating `pressing` from 0 to 1 over 120ms. The card visually scales down by 1.5%.

2. User drags. `onUpdate` writes raw translation to `tx` and `ty` on every frame. Simultaneously:
   - `SwipeCard` applies `translateX(tx)`, `translateY(ty)`, and `rotate(tx * 0.05 deg)`.
   - `SwipeOverlay` computes `strength` and `direction` from `tx`/`ty`, fading in the appropriate color tint and stamp.

3. User lifts finger. `onFinalize` fires:
   - `pressing` animates back to 0.
   - If displacement is below 90px in both axes, `tx` and `ty` spring back to 0. The overlay fades out naturally as strength drops to 0.
   - If displacement exceeds 90px, the dominant axis determines direction.
   - For down: card springs back, `triggerSwipe('down')` fires immediately.
   - For right/left/up: card flies off-screen (600px horizontal or 700px vertical) over 280ms. On animation completion, `triggerSwipe(dir)` fires.

4. `triggerSwipe` fires the appropriate haptic, then calls `onSwipe(card, dir)`. The parent removes the card from the deck, promoting the next card to `stackIndex: 0` / `isTop: true`.

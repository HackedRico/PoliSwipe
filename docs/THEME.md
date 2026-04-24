# PoliSwipe Theme System

This document is the single source of truth for every design token, typographic preset, and shadow definition used in the PoliSwipe app. The full source code of all three theme files is included at the bottom so the system can be reconstructed from scratch.

---

## 1. Design Tokens (Colors and Spacing)

All color tokens live in `theme/tokens.ts` under the exported constant `PS_TOKENS`.

### Brand Palette

| Token | Hex | Role |
|---|---|---|
| `brand` | `#E63946` | Primary brand red. Used for the main CTA, swipe-right affordance, and any element that needs to "feel like PoliSwipe." |
| `brandDeep` | `#C2282C` | Pressed / active state of brand elements. A darker shade for hover-style feedback on buttons and highlights. |
| `brandAccent` | `#FFD23F` | Warm yellow accent. Used sparingly for badges, highlights, and attention markers that complement the red brand. |

### Ink (Text)

| Token | Hex | Role |
|---|---|---|
| `ink` | `#0A0A0A` | Primary text color. Headlines, body copy, and any text that demands maximum contrast against the light background. |
| `ink2` | `#6B6B6B` | Secondary text. Summaries, timestamps, and supporting copy that should recede behind primary ink. |
| `ink3` | `#A0A0A0` | Tertiary / disabled text. Placeholder text, hints, and de-emphasized metadata. |

### Surfaces

| Token | Hex | Role |
|---|---|---|
| `bg` | `#FAFAF7` | App background. A warm off-white that avoids the clinical feel of pure `#FFFFFF`. |
| `card` | `#FFFFFF` | Card and sheet surfaces. Pure white so cards visually "lift" off the warm background. |
| `tint` | `#F5F4EE` | Tinted surface. Used for section backgrounds, input fields, and any area that needs subtle separation from `bg` without a hard border. |

### Semantic / Feedback

| Token | Hex | Role |
|---|---|---|
| `success` | `#22C55E` | Positive actions and confirmations (e.g., "signed," "passed," vote cast successfully). |
| `danger` | `#EF4444` | Destructive or negative actions (e.g., delete, block, failed state). |
| `share` | `#3B82F6` | Share and social actions. A blue that reads as "outward-facing" without clashing with the red brand. |

### Borders and Dividers

| Token | Value | Role |
|---|---|---|
| `dividerWarm` | `#E5E3DB` | Horizontal rules and section dividers. Warm enough to match the `bg` tone. |
| `borderCool` | `#F0EEE6` | Subtle card borders and input outlines. Slightly cooler than `dividerWarm` for lighter separation. |

### Overlays

| Token | Value | Role |
|---|---|---|
| `overlay` | `rgba(0,0,0,0.42)` | Modal backdrop. Dims the screen behind bottom sheets, dialogs, and full-screen modals. |
| `sheetShadow` | `rgba(0,0,0,0.15)` | Shadow tint for the top edge of a bottom sheet on iOS. Paired with the `shadow.sheet` definition. |

---

## 2. Chip Color Map

The `chip` sub-object inside `PS_TOKENS` maps content-category strings to colors. Every policy card, event, or action is tagged with a category, and the chip rendered on that card pulls its background color from this map.

| Key | Hex | Category |
|---|---|---|
| `federal` | `#7C3AED` | Federal-level policy and legislation (purple). |
| `state` | `#E63946` | State-level policy (matches brand red, reinforcing that state issues are core to the app). |
| `local` | `#F59E0B` | Local / city-level issues (amber). |
| `campus` | `#0A0A0A` | Campus-specific content (black -- bold and distinct). |
| `rally` | `#EC4899` | Rallies and in-person events (pink). |
| `petition` | `#10B981` | Petitions and signature drives (emerald green). |
| `election` | `#06B6D4` | Election info and voter guides (cyan). |

**How it works in code:**

The `chip` object is typed as `Record<string, string>`. Components look up a color like this:

```ts
const chipColor = PS_TOKENS.chip[category] ?? PS_TOKENS.ink3;
```

If a card's category string does not appear in the map, the fallback is `ink3` (the tertiary gray), so unknown categories still render gracefully. To add a new category, add a single key-value pair to the `chip` object -- no other file needs to change.

---

## 3. Typography Scale

All text presets live in `theme/typography.ts`. Two constants are exported: `FONT` (font-family aliases) and `TEXT` (complete style objects ready to spread into a `<Text>` component's style prop).

### Font Families (`FONT`)

| Alias | iOS Value | Android Value | Purpose |
|---|---|---|---|
| `inter500` | `System` | `Roboto` | Medium-weight body text. |
| `inter700` | `System` | `Roboto` | Bold text (not currently used directly in TEXT presets, available for one-offs). |
| `inter800` | `System` | `Roboto` | Extra-bold headlines, labels, and chips. |
| `inter900` | `System` | `Roboto` | Black-weight display type (sheet titles, hero numbers). |
| `mono700` | `Menlo-Bold` | `monospace` | Monospaced bold. Fact callouts or data highlights that need a "data" feel. |

The aliases are named after Inter weights because the design spec targets Inter. At runtime the app uses the platform system font for maximum compatibility (San Francisco on iOS, Roboto on Android). The `fontWeight` value in each `TEXT` preset handles the actual weight selection.

### Text Presets (`TEXT`)

#### Display / Headline Tier

| Preset | Size | Line Height | Letter Spacing | Weight | When to Use |
|---|---|---|---|---|---|
| `wrapHuge` | 120 | 110 | -8 | 900 | Full-screen hero numbers or single-character displays (e.g., the large swipe percentage on the wrap/summary screen). |
| `wrapSection` | 32 | 34 | -1.12 | 900 | Section headers on the wrap/summary screen. |
| `cardHeadline` | 28 | 33 | -0.9 | 800 | The main headline on a swipeable policy card. |
| `sheetTitle` | 24 | 26 | -0.72 | 900 | Title at the top of a bottom sheet or detail view. |

#### Body Tier

| Preset | Size | Line Height | Letter Spacing | Weight | When to Use |
|---|---|---|---|---|---|
| `cardSummary` | 15 | 22 | -0.16 | 500 | Summary paragraph on a policy card. Slightly tighter leading than `detailsBody` for card density. |
| `detailsBody` | 15 | 23 | -0.075 | 500 | Long-form body text inside the detail sheet. More generous leading for readability in longer passages. |
| `chatBody` | 13.5 | 20 | (none) | 500 | Chat bubble text. Slightly smaller than body to fit more conversation on screen. |

#### Label / Utility Tier

| Preset | Size | Line Height | Letter Spacing | Weight | When to Use |
|---|---|---|---|---|---|
| `chip` | 10.5 | (default) | 0.95 | 800 | Category chip text. All-caps with wide tracking for legibility at small size. |
| `sectionLabel` | 10.5 | (default) | 1.26 | 800 | Section divider labels (e.g., "KEY FACTS", "RELATED"). Widest tracking in the system. |
| `factLabel` | 10.5 | (default) | 1.05 | 800 | Inline fact/stat labels. Tracking sits between `chip` and `sectionLabel`. |
| `buttonLabel` | 15 | (default) | -0.15 | 800 | Button text. Same size as body but extra-bold with slight negative tracking for a punchy feel. |
| `actionHint` | 12 | (default) | (none) | 500 | Small helper text below buttons or actions (e.g., "Tap to learn more"). |

---

## 4. Shadow System

All shadows live in `theme/shadow.ts`. Each shadow uses `Platform.select` to return iOS-native shadow properties or an Android `elevation` value.

### Shadow Presets

| Preset | iOS shadowOffset | iOS Opacity | iOS Radius | Android Elevation | When to Use |
|---|---|---|---|---|---|
| `card` | `{0, 14}` | 0.10 | 24 | 8 | The main swipeable card. A tall, soft shadow that makes the card appear to float well above the background. |
| `button` | `{0, 1}` | 0.06 | 3 | 2 | Buttons and small interactive elements. Barely perceptible -- just enough to suggest "tappable." |
| `sheet` | `{0, -12}` | 0.15 | 24 | 16 | Bottom sheets. The **negative Y offset** casts the shadow upward, reinforcing that the sheet slides up from below. |
| `softRow` | `{0, 1}` | 0.04 | 3 | 1 | List rows and subtle card-like containers. The lightest shadow in the system. |

**iOS vs Android behavior:**

On iOS, shadows are rendered with `shadowColor`, `shadowOffset`, `shadowOpacity`, and `shadowRadius`. All four shadows use `#000` as the shadow color. The visual weight is controlled primarily through opacity and radius.

On Android, React Native translates the `elevation` number into a Material-style drop shadow. Higher elevation numbers produce larger, more diffused shadows. The elevation values here (1, 2, 8, 16) align with Material Design guidance for their respective surface types.

---

## 5. Complete Source Code

The three files below are the complete, unmodified source. Copy-paste them into `theme/` to recreate the design system.

### `theme/tokens.ts`

```ts
export const PS_TOKENS = {
  brand: '#E63946',
  brandDeep: '#C2282C',
  brandAccent: '#FFD23F',

  ink: '#0A0A0A',
  ink2: '#6B6B6B',
  ink3: '#A0A0A0',

  bg: '#FAFAF7',
  card: '#FFFFFF',
  tint: '#F5F4EE',

  success: '#22C55E',
  danger: '#EF4444',
  share: '#3B82F6',

  chip: {
    federal:  '#7C3AED',
    state:    '#E63946',
    local:    '#F59E0B',
    campus:   '#0A0A0A',
    rally:    '#EC4899',
    petition: '#10B981',
    election: '#06B6D4',
  } as Record<string, string>,

  dividerWarm: '#E5E3DB',
  borderCool:  '#F0EEE6',

  overlay: 'rgba(0,0,0,0.42)',
  sheetShadow: 'rgba(0,0,0,0.15)',
} as const;
```

### `theme/typography.ts`

```ts
import { Platform } from 'react-native';

const systemFont = Platform.OS === 'ios' ? 'System' : 'Roboto';

export const FONT = {
  inter500: systemFont,
  inter700: systemFont,
  inter800: systemFont,
  inter900: systemFont,
  mono700:  Platform.OS === 'ios' ? 'Menlo-Bold' : 'monospace',
};

export const TEXT = {
  cardHeadline: { fontFamily: FONT.inter800, fontSize: 28, lineHeight: 33, letterSpacing: -0.9, fontWeight: '800' as const },
  sheetTitle:   { fontFamily: FONT.inter900, fontSize: 24, lineHeight: 26, letterSpacing: -0.72, fontWeight: '900' as const },
  wrapHuge:     { fontFamily: FONT.inter900, fontSize: 120, lineHeight: 110, letterSpacing: -8, fontWeight: '900' as const },
  wrapSection:  { fontFamily: FONT.inter900, fontSize: 32, lineHeight: 34, letterSpacing: -1.12, fontWeight: '900' as const },

  cardSummary:  { fontFamily: FONT.inter500, fontSize: 15, lineHeight: 22, letterSpacing: -0.16, fontWeight: '500' as const },
  detailsBody:  { fontFamily: FONT.inter500, fontSize: 15, lineHeight: 23, letterSpacing: -0.075, fontWeight: '500' as const },
  chatBody:     { fontFamily: FONT.inter500, fontSize: 13.5, lineHeight: 20, fontWeight: '500' as const },

  chip:         { fontFamily: FONT.inter800, fontSize: 10.5, letterSpacing: 0.95, fontWeight: '800' as const },
  sectionLabel: { fontFamily: FONT.inter800, fontSize: 10.5, letterSpacing: 1.26, fontWeight: '800' as const },
  factLabel:    { fontFamily: FONT.inter800, fontSize: 10.5, letterSpacing: 1.05, fontWeight: '800' as const },
  buttonLabel:  { fontFamily: FONT.inter800, fontSize: 15, letterSpacing: -0.15, fontWeight: '800' as const },
  actionHint:   { fontFamily: FONT.inter500, fontSize: 12, fontWeight: '500' as const },
};
```

### `theme/shadow.ts`

```ts
import { Platform } from 'react-native';

export const shadow = {
  card: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 14 }, shadowOpacity: 0.10, shadowRadius: 24 },
    android: { elevation: 8 },
  }),
  button: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
    android: { elevation: 2 },
  }),
  sheet: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: -12 }, shadowOpacity: 0.15, shadowRadius: 24 },
    android: { elevation: 16 },
  }),
  softRow: Platform.select({
    ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3 },
    android: { elevation: 1 },
  }),
};
```

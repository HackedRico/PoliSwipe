# Bottom Sheets

PoliSwipe uses seven bottom-sheet modules -- six interactive modals and one shared backdrop -- all built on `@gorhom/bottom-sheet`. This document covers every sheet's **props interface**, **internal state machine**, **user flow**, and **complete source code**.

---

## Table of Contents

1. [ActionDrawer](#1-actiondrawer) -- 3-state email draft flow
2. [ChatSheet](#2-chatsheet) -- AI Q&A with scripted fallback
3. [DetailsSheet](#3-detailssheet) -- full card info with sources
4. [FilterSheet](#4-filtersheet) -- category toggle chips
5. [SavedSheet](#5-savedsheet) -- saved items list
6. [PostSheet](#6-postsheet) -- 3-step post creation
7. [Backdrop](#7-backdrop) -- shared backdrop component

---

## 1. ActionDrawer

**File:** `sheets/ActionDrawer.tsx`

### Props Interface

```ts
interface ActionDrawerProps {
  card: Card | null;   // The currently active card; null guard short-circuits render
  onClose: () => void; // Called by "Edit later" and "Next card" buttons to dismiss
}
```

The component is wrapped in `forwardRef<BottomSheetModal, ActionDrawerProps>` so the parent can call `.present()` / `.dismiss()` on the modal ref.

### Internal State Machine

```
DrawerState = 'loading' | 'editable' | 'sent'
```

| State      | Entry trigger                    | UI rendered                        |
|------------|----------------------------------|------------------------------------|
| `loading`  | `handlePresent` fires on sheet open | Shimmer skeleton bars with pulsing opacity animation |
| `editable` | AI draft (or fallback `card.draft`) resolves | Editable `BottomSheetTextInput` with Send / Edit-later buttons |
| `sent`     | User taps **Send**               | Animated checkmark with "Sent." confirmation |

**Animations:**
- **Shimmer:** `Animated.loop` oscillates bar opacity between 0.3 and 0.7 (800 ms per direction).
- **Checkmark:** Spring-style overshoot -- scales to 1.05 (250 ms) then settles to 1.0 (150 ms).

### User Flow

1. Parent calls `ref.current.present()` -- the sheet opens at 82%.
2. `onChange` fires `handlePresent`, which sets state to `loading` and calls `fetchAIDraft(card)`.
3. If the API call returns a draft, it populates the text input; otherwise falls back to `card.draft`.
4. State becomes `editable` -- user can modify the draft text.
5. **Send** transitions to `sent`, showing the animated checkmark.
6. **Edit later** or **Next card** calls `onClose`, letting the parent dismiss the sheet.

### Source Code

```tsx
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Animated } from 'react-native';
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Backdrop } from './Backdrop';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';
import { fetchAIDraft } from '@/actions/api';
import type { Card } from '@/types';

interface ActionDrawerProps {
  card: Card | null;
  onClose: () => void;
}

type DrawerState = 'loading' | 'editable' | 'sent';

const SHIMMER_WIDTHS = ['100%', '92%', '78%', '100%', '60%'] as const;

const ActionDrawer = forwardRef<BottomSheetModal, ActionDrawerProps>(
  ({ card, onClose }, ref) => {
    const snapPoints = useMemo(() => ['82%'], []);
    const [state, setState] = useState<DrawerState>('loading');
    const [draftText, setDraftText] = useState('');
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Shimmer animation
    const shimmerOpacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerOpacity, {
            toValue: 0.7,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerOpacity, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    }, [shimmerOpacity]);

    // Sent checkmark scale animation
    const checkScale = useRef(new Animated.Value(0)).current;

    const handlePresent = useCallback(async () => {
      setState('loading');
      checkScale.setValue(0);

      if (timerRef.current) clearTimeout(timerRef.current);

      // Try live AI draft, fall back to pre-written draft
      if (card) {
        const aiDraft = await fetchAIDraft(card);
        setDraftText(aiDraft ?? card.draft);
      } else {
        setDraftText('');
      }
      setState('editable');
    }, [card, checkScale]);

    const handleSend = useCallback(() => {
      setState('sent');
      Animated.sequence([
        Animated.timing(checkScale, { toValue: 1.05, duration: 250, useNativeDriver: true }),
        Animated.timing(checkScale, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }, [checkScale]);

    const handleDismiss = useCallback(() => {
      if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    if (!card) return null;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={Backdrop}
        onChange={handlePresent}
        onDismiss={handleDismiss}
        handleIndicatorStyle={{ backgroundColor: PS_TOKENS.ink3 }}
        backgroundStyle={{ backgroundColor: PS_TOKENS.card }}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.heartBadge}>
              <Text style={styles.heartIcon}>{'♥'}</Text>
            </View>
            <Text style={styles.headerLabel}>You cared about this</Text>
          </View>

          <Text style={[TEXT.sheetTitle, styles.title]}>
            Draft message to {card.rep}
          </Text>
          <Text style={styles.subtitle}>{card.repTitle}</Text>

          {/* Loading State */}
          {state === 'loading' && (
            <View style={styles.loadingContainer}>
              <Text style={styles.draftingText}>Claude is drafting your message...</Text>
              <View style={styles.shimmerContainer}>
                {SHIMMER_WIDTHS.map((w, i) => (
                  <Animated.View
                    key={i}
                    style={[
                      styles.shimmerBar,
                      { width: w, opacity: shimmerOpacity },
                    ]}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Editable State */}
          {state === 'editable' && (
            <View style={styles.editableContainer}>
              <BottomSheetTextInput
                style={styles.textInput}
                multiline
                value={draftText}
                onChangeText={setDraftText}
                placeholder="Your message..."
                placeholderTextColor={PS_TOKENS.ink3}
              />
              <View style={styles.buttonRow}>
                <Pressable style={styles.ghostButton} onPress={onClose}>
                  <Text style={[TEXT.buttonLabel, styles.ghostLabel]}>Edit later</Text>
                </Pressable>
                <Pressable style={styles.sendButton} onPress={handleSend}>
                  <Text style={[TEXT.buttonLabel, styles.sendLabel]}>Send</Text>
                </Pressable>
              </View>
              <Text style={styles.peerText}>{card.peer}</Text>
            </View>
          )}

          {/* Sent State */}
          {state === 'sent' && (
            <View style={styles.sentContainer}>
              <Animated.View
                style={[styles.sentCircle, { transform: [{ scale: checkScale }] }]}
              >
                <Text style={styles.checkmark}>{'✓'}</Text>
              </Animated.View>
              <Text style={styles.sentText}>Sent.</Text>
              <Text style={styles.sentPeer}>{card.peer}</Text>
              <Pressable style={styles.nextButton} onPress={onClose}>
                <Text style={[TEXT.buttonLabel, styles.nextLabel]}>Next card</Text>
              </Pressable>
            </View>
          )}
        </View>
      </BottomSheetModal>
    );
  },
);

ActionDrawer.displayName = 'ActionDrawer';
export { ActionDrawer };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  heartBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: PS_TOKENS.success + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heartIcon: {
    fontSize: 13,
    color: PS_TOKENS.success,
  },
  headerLabel: {
    ...TEXT.sectionLabel,
    color: PS_TOKENS.ink2,
    textTransform: 'uppercase',
  },
  title: {
    color: PS_TOKENS.ink,
    marginBottom: 4,
  },
  subtitle: {
    ...TEXT.detailsBody,
    color: PS_TOKENS.ink2,
    marginBottom: 20,
  },
  // Loading
  loadingContainer: {
    marginTop: 8,
  },
  draftingText: {
    ...TEXT.detailsBody,
    color: PS_TOKENS.ink2,
    marginBottom: 16,
  },
  shimmerContainer: {
    gap: 10,
  },
  shimmerBar: {
    height: 10,
    backgroundColor: '#E5E3DB',
    borderRadius: 4,
  },
  // Editable
  editableContainer: {
    flex: 1,
  },
  textInput: {
    minHeight: 180,
    backgroundColor: PS_TOKENS.bg,
    borderRadius: 14,
    padding: 14,
    ...TEXT.detailsBody,
    color: PS_TOKENS.ink,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  ghostButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: PS_TOKENS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostLabel: {
    color: PS_TOKENS.ink,
  },
  sendButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: PS_TOKENS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendLabel: {
    color: '#FFFFFF',
  },
  peerText: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink2,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
  // Sent
  sentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
  },
  sentCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PS_TOKENS.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  checkmark: {
    fontSize: 28,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sentText: {
    ...TEXT.sheetTitle,
    color: PS_TOKENS.ink,
    fontSize: 28,
    marginBottom: 8,
  },
  sentPeer: {
    ...TEXT.detailsBody,
    color: PS_TOKENS.ink2,
    marginBottom: 24,
  },
  nextButton: {
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: PS_TOKENS.ink,
  },
  nextLabel: {
    color: PS_TOKENS.ink,
  },
});
```

---

## 2. ChatSheet

**File:** `sheets/ChatSheet.tsx`

### Props Interface

```ts
interface ChatSheetProps {
  card: Card | null;  // The card being discussed (null when in global mode)
  isGlobal: boolean;  // true = campus-wide "Ask PoliSwipe"; false = card-specific Q&A
}
```

Wrapped in `forwardRef<BottomSheetModal, ChatSheetProps>`.

### Internal State Machine

ChatSheet does not use a named state enum. Instead it tracks three pieces of reactive state that together determine what the UI renders:

| State variable | Type             | Purpose |
|----------------|------------------|---------|
| `messages`     | `ChatMessage[]`  | Running conversation history (excludes the initial AI greeting) |
| `inputText`    | `string`         | Current text in the input field |
| `loading`      | `boolean`        | True while waiting for AI/scripted reply; shows typing dots |

**Reply resolution order:**

1. Check `SCRIPTED[cardId][trimmed]` for a card-specific scripted reply.
2. Check `GLOBAL_REPLIES[trimmed]` if `isGlobal` is true.
3. Fall back to `fetchAIChat(...)` for a live backend call.
4. If all fail, use `FALLBACK_REPLY`.

### User Flow

1. Sheet opens at 90% snap point.
2. An initial AI greeting is displayed:
   - **Global mode:** "Hey there -- ask me about anything on your ballot..."
   - **Card mode:** Short summary of the card + "Ask me anything below."
3. If no user messages yet, tappable **prompt chips** appear (from `card.prompts` or `GLOBAL_PROMPTS`).
4. User taps a chip or types a message and hits send.
5. The user message is appended, `loading` becomes true, and typing dots appear.
6. Reply resolves (scripted, AI, or fallback) and is appended as an AI message with optional sources.
7. On dismiss, all state resets (messages cleared, input emptied).

### Source Code

```tsx
import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Backdrop } from './Backdrop';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';
import TypingDots from '@/components/TypingDots';
import { GLOBAL_PROMPTS, SCRIPTED, GLOBAL_REPLIES, FALLBACK_REPLY } from '@/data/chatScripts';
import { fetchAIChat } from '@/actions/api';
import type { Card, ChatMessage, Source } from '@/types';

interface ChatSheetProps {
  card: Card | null;
  isGlobal: boolean;
}

const ChatSheet = forwardRef<BottomSheetModal, ChatSheetProps>(
  ({ card, isGlobal }, ref) => {
    const snapPoints = useMemo(() => ['90%'], []);
    const scrollRef = useRef<any>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [loading, setLoading] = useState(false);

    const initialMessage: ChatMessage = useMemo(() => {
      if (isGlobal) {
        return {
          role: 'ai',
          text: 'Hey there -- ask me about anything on your ballot, in your county, or happening on campus.',
        };
      }
      return {
        role: 'ai',
        text: `Here's the short version: ${card?.summary ?? ''}\n\nAsk me anything below.`,
        sources: card?.sources,
      };
    }, [isGlobal, card]);

    const allMessages = useMemo(
      () => [initialMessage, ...messages],
      [initialMessage, messages],
    );

    const prompts = useMemo(() => {
      if (isGlobal) return GLOBAL_PROMPTS;
      return card?.prompts ?? [];
    }, [isGlobal, card]);

    const handleSend = useCallback(
      async (text: string) => {
        if (!text.trim() || loading) return;

        const trimmed = text.trim();
        const userMsg: ChatMessage = { role: 'user', text: trimmed };
        setMessages((prev) => [...prev, userMsg]);
        setInputText('');
        setLoading(true);

        // Check scripted replies first for instant demo responses
        const cardId = card?.id ?? '';
        const scriptedEntry = SCRIPTED[cardId]?.[trimmed];
        const globalEntry = isGlobal ? GLOBAL_REPLIES[trimmed] : undefined;

        let replyText: string | null = null;

        if (scriptedEntry) {
          replyText = scriptedEntry.text;
        } else if (globalEntry) {
          replyText = globalEntry;
        } else {
          // Try live AI via backend
          const allMsgs = [...messages, userMsg];
          replyText = await fetchAIChat(trimmed, card, allMsgs);
        }

        const aiMsg: ChatMessage = {
          role: 'ai',
          text: replyText ?? FALLBACK_REPLY,
          sources: scriptedEntry?.sources ?? card?.sources,
        };

        setMessages((prev) => [...prev, aiMsg]);
        setLoading(false);
      },
      [card, isGlobal, loading, messages],
    );

    const handleDismiss = useCallback(() => {
      setMessages([]);
      setInputText('');
      setLoading(false);
    }, []);

    const renderSources = (sources?: Source[]) => {
      if (!sources || sources.length === 0) return null;
      return (
        <View style={styles.sourcesContainer}>
          {sources.map((s, i) => (
            <View key={i} style={styles.sourceRow}>
              <Text style={styles.sourceArrow}>{'>'}</Text>
              <Text style={styles.sourceText} numberOfLines={1}>
                {s.title}
              </Text>
              <Text style={styles.sourceDate}>{s.date}</Text>
            </View>
          ))}
        </View>
      );
    };

    const headerTitle = isGlobal
      ? 'Ask PoliSwipe'
      : `About this ${card?.chipLabel ?? 'item'}`;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={Backdrop}
        onDismiss={handleDismiss}
        handleIndicatorStyle={{ backgroundColor: PS_TOKENS.ink3 }}
        backgroundStyle={{ backgroundColor: PS_TOKENS.card }}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.gradientAvatar}>
                <Text style={styles.sparkle}>{'*'}</Text>
              </View>
              <Text style={[TEXT.sheetTitle, styles.headerTitle]}>{headerTitle}</Text>
            </View>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                if (ref && typeof ref !== 'function' && ref.current) {
                  ref.current.dismiss();
                }
              }}
            >
              <Text style={styles.closeX}>{'x'}</Text>
            </Pressable>
          </View>

          {/* Messages */}
          <BottomSheetScrollView
            ref={scrollRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {allMessages.map((msg, i) => (
              <View
                key={i}
                style={[
                  styles.bubbleWrap,
                  msg.role === 'user' ? styles.bubbleRight : styles.bubbleLeft,
                ]}
              >
                <View
                  style={[
                    styles.bubble,
                    msg.role === 'user' ? styles.userBubble : styles.aiBubble,
                  ]}
                >
                  <Text
                    style={[
                      TEXT.chatBody,
                      msg.role === 'user' ? styles.userText : styles.aiText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                </View>
                {msg.role === 'ai' && renderSources(msg.sources)}
              </View>
            ))}

            {loading && (
              <View style={[styles.bubbleWrap, styles.bubbleLeft]}>
                <View style={[styles.bubble, styles.aiBubble, styles.typingBubble]}>
                  <TypingDots />
                </View>
              </View>
            )}
          </BottomSheetScrollView>

          {/* Prompt Chips */}
          {allMessages.length <= 1 && prompts.length > 0 && (
            <View style={styles.chipsWrap}>
              {prompts.map((p, i) => (
                <Pressable
                  key={i}
                  style={styles.promptChip}
                  onPress={() => handleSend(p)}
                >
                  <Text style={styles.promptChipText}>{p}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Input Row */}
          <View style={styles.inputRow}>
            <BottomSheetTextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask anything..."
              placeholderTextColor={PS_TOKENS.ink3}
              onSubmitEditing={() => handleSend(inputText)}
              returnKeyType="send"
            />
            <Pressable
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled,
              ]}
              onPress={() => handleSend(inputText)}
              disabled={!inputText.trim() || loading}
            >
              <Text style={styles.sendArrow}>{'>'}</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheetModal>
    );
  },
);

ChatSheet.displayName = 'ChatSheet';
export { ChatSheet };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 8,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: PS_TOKENS.borderCool,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  gradientAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PS_TOKENS.brandAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sparkle: {
    fontSize: 16,
    fontWeight: '800',
    color: PS_TOKENS.ink,
  },
  headerTitle: {
    color: PS_TOKENS.ink,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PS_TOKENS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: {
    fontSize: 16,
    fontWeight: '700',
    color: PS_TOKENS.ink2,
  },
  // Messages
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  bubbleWrap: {
    marginBottom: 4,
  },
  bubbleLeft: {
    alignItems: 'flex-start',
  },
  bubbleRight: {
    alignItems: 'flex-end',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  aiBubble: {
    backgroundColor: PS_TOKENS.tint,
  },
  userBubble: {
    backgroundColor: PS_TOKENS.ink,
  },
  aiText: {
    color: PS_TOKENS.ink,
  },
  userText: {
    color: '#FFFFFF',
  },
  typingBubble: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  // Sources
  sourcesContainer: {
    marginTop: 4,
    marginLeft: 6,
    gap: 2,
  },
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  sourceArrow: {
    fontSize: 10,
    color: PS_TOKENS.share,
    fontWeight: '700',
  },
  sourceText: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink2,
    flex: 1,
  },
  sourceDate: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink3,
  },
  // Prompt Chips
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  promptChip: {
    backgroundColor: PS_TOKENS.tint,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: PS_TOKENS.dividerWarm,
  },
  promptChipText: {
    ...TEXT.chatBody,
    color: PS_TOKENS.ink,
    fontWeight: '600',
  },
  // Input Row
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 4,
    borderTopWidth: 1,
    borderTopColor: PS_TOKENS.borderCool,
  },
  textInput: {
    flex: 1,
    height: 42,
    backgroundColor: PS_TOKENS.tint,
    borderRadius: 21,
    paddingHorizontal: 16,
    ...TEXT.chatBody,
    color: PS_TOKENS.ink,
  },
  sendButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: PS_TOKENS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  sendArrow: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
```

---

## 3. DetailsSheet

**File:** `sheets/DetailsSheet.tsx`

### Props Interface

```ts
interface DetailsSheetProps {
  card: Card | null;  // The card to display in full detail; null guard short-circuits render
}
```

Wrapped in `forwardRef<BottomSheetModal, DetailsSheetProps>`.

### Internal State Machine

DetailsSheet is **stateless** -- it is a pure read-only view derived entirely from the `card` prop. There is no internal `useState`. The component builds a `facts` array at render time by inspecting optional fields on the card (`stat`, `when`, `where`, `going`, `peer`, `actionHint`).

### User Flow

1. Sheet opens at 92% snap point -- nearly full-screen.
2. Header shows the card's chip (category/type) and a close button.
3. Headline and an "agent byline" (source count + last-updated timestamp) are displayed.
4. The body text renders `card.detailsBody` (falling back to `card.summary`).
5. **THE FACTS** section shows a card of key-value rows (SCALE, WHEN, WHERE, RSVPS, YOUR CIRCLE, DO NEXT) -- only rows with data are rendered.
6. **SOURCES** section lists each source as a pressable row. Tapping opens the source URL via `Linking.openURL`, falling back to a Google search for the title.
7. A footer disclaimer reminds the user to verify before acting.

### Source Code

```tsx
import React, { forwardRef, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Linking } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { Backdrop } from './Backdrop';
import Chip from '@/components/Chip';
import SectionLabel from '@/components/SectionLabel';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';
import type { Card, Source } from '@/types';

interface DetailsSheetProps {
  card: Card | null;
}

const DetailsSheet = forwardRef<BottomSheetModal, DetailsSheetProps>(
  ({ card }, ref) => {
    const snapPoints = useMemo(() => ['92%'], []);

    if (!card) return null;

    const facts: { label: string; value: string }[] = [];
    if (card.stat) {
      facts.push({ label: 'SCALE', value: card.stat.text });
    }
    if (card.when) {
      facts.push({ label: 'WHEN', value: `${card.when.dateLabel} ${card.when.time}` });
    }
    if (card.where) {
      facts.push({ label: 'WHERE', value: `${card.where.place} (${card.where.walkMin} min walk)` });
    }
    if (card.type === 'rally' && card.going) {
      facts.push({ label: 'RSVPS', value: `${card.going} going${card.majorGoing ? ` · ${card.majorGoing} from your major` : ''}` });
    }
    facts.push({ label: 'YOUR CIRCLE', value: card.peer });
    facts.push({ label: 'DO NEXT', value: card.actionHint });

    const getInitials = (title: string): string => {
      const words = title.split(/[\s·]+/).filter(Boolean);
      if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
      if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
      return '??';
    };

    const openSource = (source: Source) => {
      const url = source.url ?? `https://www.google.com/search?q=${encodeURIComponent(source.title)}`;
      Linking.openURL(url).catch(() => {});
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={Backdrop}
        handleIndicatorStyle={{ backgroundColor: PS_TOKENS.ink3 }}
        backgroundStyle={{ backgroundColor: PS_TOKENS.bg }}
      >
        <BottomSheetScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.headerRow}>
            <Chip
              type={card.type}
              emoji={card.emoji}
              label={card.chipLabel}
              compact
            />
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                if (ref && typeof ref !== 'function' && ref.current) {
                  ref.current.dismiss();
                }
              }}
            >
              <Text style={styles.closeX}>{'x'}</Text>
            </Pressable>
          </View>

          {/* Headline */}
          <Text style={[TEXT.sheetTitle, styles.headline]}>{card.headline}</Text>

          {/* Agent byline */}
          <View style={styles.bylineRow}>
            <View style={styles.agentDot} />
            <Text style={styles.bylineText}>
              Synthesized from {card.sources.length} source{card.sources.length !== 1 ? 's' : ''} {'·'} updated{' '}
              {card.updatedAgo ?? 'today'}
            </Text>
          </View>

          {/* Body */}
          <Text style={[TEXT.detailsBody, styles.body]}>
            {card.detailsBody ?? card.summary}
          </Text>

          {/* The Facts */}
          <SectionLabel>THE FACTS</SectionLabel>
          <View style={styles.factsCard}>
            {facts.map((f, i) => (
              <View
                key={i}
                style={[styles.factRow, i < facts.length - 1 && styles.factDivider]}
              >
                <Text style={[TEXT.factLabel, styles.factLabel]}>{f.label}</Text>
                <Text
                  style={[
                    f.label === 'DO NEXT' ? TEXT.actionHint : TEXT.detailsBody,
                    styles.factValue,
                    f.label === 'DO NEXT' && styles.factValueAction,
                  ]}
                  numberOfLines={2}
                >
                  {f.value}
                </Text>
              </View>
            ))}
          </View>

          {/* Sources */}
          <SectionLabel>SOURCES</SectionLabel>
          {card.sources.map((source, i) => (
            <Pressable
              key={i}
              style={styles.sourceRow}
              onPress={() => openSource(source)}
            >
              <View style={styles.sourceAvatar}>
                <Text style={styles.sourceInitials}>{getInitials(source.title)}</Text>
              </View>
              <View style={styles.sourceInfo}>
                <Text style={styles.sourceTitle} numberOfLines={1}>
                  {source.title}
                </Text>
                <Text style={styles.sourceDate}>{source.date}</Text>
              </View>
              <Text style={styles.sourceLinkIcon}>{'>'}</Text>
            </Pressable>
          ))}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerIcon}>{'i'}</Text>
            <Text style={styles.footerText}>
              This brief was assembled by PoliSwipe's agent from public sources. Always
              verify before taking action.
            </Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  },
);

DetailsSheet.displayName = 'DetailsSheet';
export { DetailsSheet };

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 4,
    paddingBottom: 40,
  },
  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PS_TOKENS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: {
    fontSize: 16,
    fontWeight: '700',
    color: PS_TOKENS.ink2,
  },
  // Headline
  headline: {
    color: PS_TOKENS.ink,
    marginBottom: 10,
  },
  // Byline
  bylineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  agentDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PS_TOKENS.brandAccent,
  },
  bylineText: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink2,
    flex: 1,
  },
  // Body
  body: {
    color: PS_TOKENS.ink,
    marginBottom: 8,
  },
  // Facts
  factsCard: {
    backgroundColor: PS_TOKENS.card,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
  },
  factRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    gap: 12,
  },
  factDivider: {
    borderBottomWidth: 1,
    borderBottomColor: PS_TOKENS.dividerWarm,
  },
  factLabel: {
    color: PS_TOKENS.ink3,
    textTransform: 'uppercase',
    width: 90,
  },
  factValue: {
    color: PS_TOKENS.ink,
    flex: 1,
  },
  factValueAction: {
    color: PS_TOKENS.ink2,
  },
  // Sources
  sourceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PS_TOKENS.card,
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    gap: 10,
  },
  sourceAvatar: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: PS_TOKENS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sourceInitials: {
    ...TEXT.chip,
    color: PS_TOKENS.ink2,
    textTransform: 'uppercase',
  },
  sourceInfo: {
    flex: 1,
  },
  sourceTitle: {
    ...TEXT.chatBody,
    color: PS_TOKENS.ink,
    fontWeight: '600',
    marginBottom: 2,
  },
  sourceDate: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink3,
  },
  sourceLinkIcon: {
    fontSize: 16,
    color: PS_TOKENS.share,
    fontWeight: '700',
  },
  // Footer
  footer: {
    flexDirection: 'row',
    backgroundColor: PS_TOKENS.tint,
    borderRadius: 14,
    padding: 14,
    marginTop: 16,
    gap: 10,
    alignItems: 'flex-start',
  },
  footerIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: PS_TOKENS.ink3 + '33',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 12,
    fontWeight: '700',
    color: PS_TOKENS.ink2,
    overflow: 'hidden',
  },
  footerText: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink2,
    flex: 1,
    lineHeight: 17,
  },
});
```

---

## 4. FilterSheet

**File:** `sheets/FilterSheet.tsx`

### Props Interface

```ts
interface FilterSheetProps {
  active: CardType[];                // Currently active category filters from parent
  onChange: (f: CardType[]) => void;  // Called with the new filter set when user taps Apply
}
```

Wrapped in `forwardRef<BottomSheetModal, FilterSheetProps>`.

### Internal State Machine

FilterSheet maintains a single `local` state (`CardType[]`) that mirrors the parent's `active` prop on entry and diverges as the user toggles chips. It syncs back via `useEffect` whenever `active` changes.

| Action        | Effect on `local`                             |
|---------------|-----------------------------------------------|
| Toggle chip   | Add/remove the `CardType` from `local` array  |
| Clear         | Set `local` to `[]`                           |
| Apply         | Call `onChange(local)` and dismiss the sheet   |

**Subtitle logic:**
- `local.length === 0` displays "Everything".
- Otherwise displays `"{n} category/categories selected"`.

### User Flow

1. Sheet opens at 55% snap point.
2. Title reads "Show me" with a dynamic subtitle.
3. Category chips render from `ALL_CATEGORIES`. Each chip toggles between selected (dark) and unselected (white with shadow) styles.
4. **Clear** resets all selections. **Apply** commits and dismisses.

### Source Code

```tsx
import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Backdrop } from './Backdrop';
import { ALL_CATEGORIES } from '@/data/categories';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';
import { shadow } from '@/theme/shadow';
import type { CardType } from '@/types';

interface FilterSheetProps {
  active: CardType[];
  onChange: (f: CardType[]) => void;
}

const FilterSheet = forwardRef<BottomSheetModal, FilterSheetProps>(
  ({ active, onChange }, ref) => {
    const snapPoints = useMemo(() => ['55%'], []);
    const [local, setLocal] = useState<CardType[]>(active);

    // Sync local state when active prop changes or sheet opens
    useEffect(() => {
      setLocal(active);
    }, [active]);

    const toggle = useCallback((id: CardType) => {
      setLocal((prev) => {
        if (prev.includes(id)) return prev.filter((f) => f !== id);
        return [...prev, id];
      });
    }, []);

    const handleClear = useCallback(() => {
      setLocal([]);
    }, []);

    const handleApply = useCallback(() => {
      onChange(local);
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.dismiss();
      }
    }, [local, onChange, ref]);

    const subtitle =
      local.length === 0
        ? 'Everything'
        : `${local.length} categor${local.length === 1 ? 'y' : 'ies'} selected`;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={Backdrop}
        handleIndicatorStyle={{ backgroundColor: PS_TOKENS.ink3 }}
        backgroundStyle={{ backgroundColor: PS_TOKENS.card }}
      >
        <View style={styles.container}>
          {/* Title */}
          <Text style={[TEXT.sheetTitle, styles.title]}>Show me</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>

          {/* Chips */}
          <View style={styles.chipWrap}>
            {ALL_CATEGORIES.map((cat) => {
              const isSelected = local.includes(cat.id as CardType);
              return (
                <Pressable
                  key={cat.id}
                  style={[
                    styles.chip,
                    isSelected ? styles.chipSelected : styles.chipUnselected,
                  ]}
                  onPress={() => toggle(cat.id as CardType)}
                >
                  <Text style={styles.chipEmoji}>{cat.emoji}</Text>
                  <Text
                    style={[
                      styles.chipLabel,
                      isSelected ? styles.chipLabelSelected : styles.chipLabelUnselected,
                    ]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <Pressable style={styles.clearButton} onPress={handleClear}>
              <Text style={[TEXT.buttonLabel, styles.clearLabel]}>Clear</Text>
            </Pressable>
            <Pressable style={styles.applyButton} onPress={handleApply}>
              <Text style={[TEXT.buttonLabel, styles.applyLabel]}>Apply</Text>
            </Pressable>
          </View>
        </View>
      </BottomSheetModal>
    );
  },
);

FilterSheet.displayName = 'FilterSheet';
export { FilterSheet };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  title: {
    color: PS_TOKENS.ink,
    marginBottom: 4,
  },
  subtitle: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink2,
    marginBottom: 20,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipSelected: {
    backgroundColor: PS_TOKENS.ink,
  },
  chipUnselected: {
    backgroundColor: '#FFFFFF',
    ...shadow.button,
  },
  chipEmoji: {
    fontSize: 14,
  },
  chipLabel: {
    ...TEXT.chip,
    textTransform: 'uppercase',
  },
  chipLabelSelected: {
    color: '#FFFFFF',
  },
  chipLabelUnselected: {
    color: PS_TOKENS.ink,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto' as any,
    paddingBottom: 20,
  },
  clearButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: PS_TOKENS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearLabel: {
    color: PS_TOKENS.ink,
  },
  applyButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: PS_TOKENS.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  applyLabel: {
    color: '#FFFFFF',
  },
});
```

---

## 5. SavedSheet

**File:** `sheets/SavedSheet.tsx`

### Props Interface

```ts
interface SavedSheetProps {
  items: SavedItem[];  // Array of saved cards with metadata (timestamp, sent status)
}
```

Wrapped in `forwardRef<BottomSheetModal, SavedSheetProps>`.

### Internal State Machine

SavedSheet is **stateless** -- it renders directly from its `items` prop. A helper function `formatWhen` converts ISO timestamps into relative time strings ("just now", "3m ago", "2h ago", "1d ago").

### User Flow

1. Sheet opens at 90% snap point.
2. Header shows "Saved" with a count line: "{n} cared -- sorted by most recent".
3. A `BottomSheetFlatList` renders each `SavedItem` as a row with:
   - An icon tile (emoji on a tinted background colored by card type).
   - The card headline (single line).
   - Metadata: chip label, relative timestamp, and a green "contacted" badge if `sent` is true.
   - A chevron indicator.
4. If `items` is empty, a centered empty state is shown: a heart icon, "Nothing saved yet", and "Swipe right on cards you care about".

### Source Code

```tsx
import React, { forwardRef, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { Backdrop } from './Backdrop';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';
import type { SavedItem } from '@/types';

interface SavedSheetProps {
  items: SavedItem[];
}

function formatWhen(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

const SavedSheet = forwardRef<BottomSheetModal, SavedSheetProps>(
  ({ items }, ref) => {
    const snapPoints = useMemo(() => ['90%'], []);

    const renderItem = ({ item }: { item: SavedItem }) => {
      const { card, savedAtISO, sent } = item;
      const chipColor = PS_TOKENS.chip[card.type] ?? PS_TOKENS.ink;

      return (
        <View style={styles.row}>
          <View style={[styles.iconTile, { backgroundColor: chipColor + '22' }]}>
            <Text style={styles.iconEmoji}>{card.emoji}</Text>
          </View>
          <View style={styles.rowContent}>
            <Text style={styles.rowTitle} numberOfLines={1}>
              {card.headline}
            </Text>
            <View style={styles.rowMeta}>
              <Text style={styles.rowChipLabel}>{card.chipLabel}</Text>
              <Text style={styles.rowDot}>{'·'}</Text>
              <Text style={styles.rowWhen}>{formatWhen(savedAtISO)}</Text>
              {sent && (
                <>
                  <Text style={styles.rowDot}>{'·'}</Text>
                  <Text style={styles.sentBadge}>{'✓'} contacted</Text>
                </>
              )}
            </View>
          </View>
          <Text style={styles.chevron}>{'>'}</Text>
        </View>
      );
    };

    const renderEmpty = () => (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyHeart}>{'<3'}</Text>
        <Text style={styles.emptyTitle}>Nothing saved yet</Text>
        <Text style={styles.emptySubtitle}>
          Swipe right on cards you care about
        </Text>
      </View>
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={Backdrop}
        handleIndicatorStyle={{ backgroundColor: PS_TOKENS.ink3 }}
        backgroundStyle={{ backgroundColor: PS_TOKENS.bg }}
      >
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={[TEXT.sheetTitle, styles.headerTitle]}>Saved</Text>
              <Text style={styles.headerCount}>
                {items.length} cared {'·'} sorted by most recent
              </Text>
            </View>
            <Pressable
              style={styles.closeButton}
              onPress={() => {
                if (ref && typeof ref !== 'function' && ref.current) {
                  ref.current.dismiss();
                }
              }}
            >
              <Text style={styles.closeX}>{'x'}</Text>
            </Pressable>
          </View>

          {/* List */}
          <BottomSheetFlatList
            data={items}
            keyExtractor={(item, i) => `${item.card.id}-${i}`}
            renderItem={renderItem}
            ListEmptyComponent={renderEmpty}
            contentContainerStyle={items.length === 0 ? styles.emptyList : styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </BottomSheetModal>
    );
  },
);

SavedSheet.displayName = 'SavedSheet';
export { SavedSheet };

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 22,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: PS_TOKENS.borderCool,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: PS_TOKENS.ink,
    marginBottom: 4,
  },
  headerCount: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink2,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PS_TOKENS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeX: {
    fontSize: 16,
    fontWeight: '700',
    color: PS_TOKENS.ink2,
  },
  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
  },
  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: PS_TOKENS.dividerWarm,
  },
  iconTile: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconEmoji: {
    fontSize: 18,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    ...TEXT.chatBody,
    color: PS_TOKENS.ink,
    fontWeight: '600',
    marginBottom: 3,
  },
  rowMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rowChipLabel: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink2,
  },
  rowDot: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink3,
  },
  rowWhen: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink3,
  },
  sentBadge: {
    ...TEXT.actionHint,
    color: PS_TOKENS.success,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 16,
    color: PS_TOKENS.ink3,
    fontWeight: '600',
  },
  // Empty state
  emptyList: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  emptyHeart: {
    fontSize: 48,
    color: PS_TOKENS.ink3,
    marginBottom: 16,
  },
  emptyTitle: {
    ...TEXT.sheetTitle,
    color: PS_TOKENS.ink,
    marginBottom: 8,
  },
  emptySubtitle: {
    ...TEXT.detailsBody,
    color: PS_TOKENS.ink2,
    textAlign: 'center',
  },
});
```

---

## 6. PostSheet

**File:** `sheets/PostSheet.tsx`

### Props Interface

```ts
interface PostSheetProps {
  onSubmit: (d: PostDraft) => void;  // Called with the assembled draft when user submits
}
```

Wrapped in `forwardRef<BottomSheetModal, PostSheetProps>`.

Additionally, a local type is defined for the type picker options:

```ts
interface PostTypeOption {
  type: PostType;
  emoji: string;
  title: string;
  subtitle: string;
}
```

### Internal State Machine

```
step: 0 | 1 | 2
```

| Step | Name             | UI rendered                                                   |
|------|------------------|---------------------------------------------------------------|
| `0`  | Type Picker      | Four pressable rows (Rally, Petition, Campus referendum, Heads-up post) |
| `1`  | Form             | Type badge with "change" link, Headline/Summary inputs, optional When/Where fields, moderation notice, Submit button |
| `2`  | Confirmation     | Clock icon, "Pending review" title, body text, Done button    |

**Additional state:**

| Variable       | Type                   | Purpose |
|----------------|------------------------|---------|
| `selectedType` | `PostTypeOption | null` | The post type chosen in step 0 |
| `title`        | `string`               | Headline input value |
| `summary`      | `string`               | Summary input value |
| `when`         | `string`               | Optional date/time (shown only for rally and election types) |
| `where`        | `string`               | Optional location (shown only for rally and election types) |

**Submit guard:** The submit button is disabled (`canSubmit = false`) until both `title` and `summary` have non-empty trimmed values.

### User Flow

1. Sheet opens at 85% snap point.
2. **Step 0:** User picks a post type. Tapping a row selects it and advances to step 1.
3. **Step 1:** User fills in headline and summary. For rally/election types, optional When and Where fields appear. A moderation notice explains the review process. Tapping "change" returns to step 0.
4. **Submit for review** calls `onSubmit(draft)` with the assembled `PostDraft` object, then advances to step 2.
5. **Step 2:** Confirmation screen. "Pending review" with a clock icon. **Done** dismisses the sheet.
6. On dismiss, `resetForm` clears all state back to initial values.

### Source Code

```tsx
import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Backdrop } from './Backdrop';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';
import type { PostDraft, PostType } from '@/types';

interface PostSheetProps {
  onSubmit: (d: PostDraft) => void;
}

interface PostTypeOption {
  type: PostType;
  emoji: string;
  title: string;
  subtitle: string;
}

const POST_TYPES: PostTypeOption[] = [
  { type: 'rally', emoji: '\u270A', title: 'Rally / event', subtitle: 'Protest, walkout, teach-in' },
  { type: 'petition', emoji: '\u270D\uFE0F', title: 'Petition', subtitle: 'Signatures for a cause' },
  { type: 'election', emoji: '\u{1F5F3}\uFE0F', title: 'Campus referendum', subtitle: 'SGA / student vote' },
  { type: 'discussion', emoji: '\u{1F4AC}', title: 'Heads-up post', subtitle: 'Bill or news to flag' },
];

const PostSheet = forwardRef<BottomSheetModal, PostSheetProps>(
  ({ onSubmit }, ref) => {
    const snapPoints = useMemo(() => ['85%'], []);
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const [selectedType, setSelectedType] = useState<PostTypeOption | null>(null);
    const [title, setTitle] = useState('');
    const [summary, setSummary] = useState('');
    const [when, setWhen] = useState('');
    const [where, setWhere] = useState('');

    const resetForm = useCallback(() => {
      setStep(0);
      setSelectedType(null);
      setTitle('');
      setSummary('');
      setWhen('');
      setWhere('');
    }, []);

    const handleDismiss = useCallback(() => {
      resetForm();
    }, [resetForm]);

    const handleSelectType = useCallback((opt: PostTypeOption) => {
      setSelectedType(opt);
      setStep(1);
    }, []);

    const handleSubmit = useCallback(() => {
      if (!selectedType || !title.trim() || !summary.trim()) return;

      const draft: PostDraft = {
        type: selectedType.type,
        title: title.trim(),
        summary: summary.trim(),
      };
      if (
        (selectedType.type === 'rally' || selectedType.type === 'election') &&
        when.trim()
      ) {
        draft.when = when.trim();
      }
      if (
        (selectedType.type === 'rally' || selectedType.type === 'election') &&
        where.trim()
      ) {
        draft.where = where.trim();
      }

      onSubmit(draft);
      setStep(2);
    }, [selectedType, title, summary, when, where, onSubmit]);

    const handleDone = useCallback(() => {
      if (ref && typeof ref !== 'function' && ref.current) {
        ref.current.dismiss();
      }
    }, [ref]);

    const canSubmit = title.trim().length > 0 && summary.trim().length > 0;

    const showWhenWhere =
      selectedType?.type === 'rally' || selectedType?.type === 'election';

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={Backdrop}
        onDismiss={handleDismiss}
        handleIndicatorStyle={{ backgroundColor: PS_TOKENS.ink3 }}
        backgroundStyle={{ backgroundColor: PS_TOKENS.card }}
      >
        <View style={styles.container}>
          {/* Step 0 -- Type Picker */}
          {step === 0 && (
            <View style={styles.stepContainer}>
              <Text style={[TEXT.sheetTitle, styles.stepTitle]}>Post something</Text>
              <Text style={styles.stepSubtitle}>
                Posts are reviewed within 24h
              </Text>

              {POST_TYPES.map((opt) => (
                <Pressable
                  key={opt.type}
                  style={styles.typeRow}
                  onPress={() => handleSelectType(opt)}
                >
                  <View style={styles.typeIconTile}>
                    <Text style={styles.typeEmoji}>{opt.emoji}</Text>
                  </View>
                  <View style={styles.typeInfo}>
                    <Text style={styles.typeTitle}>{opt.title}</Text>
                    <Text style={styles.typeSubtitle}>{opt.subtitle}</Text>
                  </View>
                  <Text style={styles.typeChevron}>{'>'}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Step 1 -- Form */}
          {step === 1 && selectedType && (
            <View style={styles.stepContainer}>
              <View style={styles.typeBadgeRow}>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeBadgeEmoji}>{selectedType.emoji}</Text>
                  <Text style={styles.typeBadgeLabel}>{selectedType.title}</Text>
                </View>
                <Pressable onPress={() => setStep(0)}>
                  <Text style={styles.changeText}>change</Text>
                </Pressable>
              </View>

              {/* Headline */}
              <Text style={styles.fieldLabel}>HEADLINE</Text>
              <BottomSheetTextInput
                style={styles.fieldInput}
                value={title}
                onChangeText={setTitle}
                placeholder="What's happening?"
                placeholderTextColor={PS_TOKENS.ink3}
              />

              {/* Summary */}
              <Text style={styles.fieldLabel}>SUMMARY</Text>
              <BottomSheetTextInput
                style={[styles.fieldInput, styles.fieldMultiline]}
                value={summary}
                onChangeText={setSummary}
                placeholder="Give some context..."
                placeholderTextColor={PS_TOKENS.ink3}
                multiline
                numberOfLines={3}
              />

              {/* When / Where (rally or election only) */}
              {showWhenWhere && (
                <View style={styles.whenWhereRow}>
                  <View style={styles.halfField}>
                    <Text style={styles.fieldLabel}>WHEN</Text>
                    <BottomSheetTextInput
                      style={styles.fieldInput}
                      value={when}
                      onChangeText={setWhen}
                      placeholder="e.g. Sat Apr 26 2pm"
                      placeholderTextColor={PS_TOKENS.ink3}
                    />
                  </View>
                  <View style={styles.halfField}>
                    <Text style={styles.fieldLabel}>WHERE</Text>
                    <BottomSheetTextInput
                      style={styles.fieldInput}
                      value={where}
                      onChangeText={setWhere}
                      placeholder="e.g. McKeldin Mall"
                      placeholderTextColor={PS_TOKENS.ink3}
                    />
                  </View>
                </View>
              )}

              {/* Moderation notice */}
              <View style={styles.noticeCard}>
                <Text style={styles.noticeText}>
                  Posts are reviewed by a student moderator before appearing in
                  anyone's stack. Verified orgs (SGA, Sunrise UMD, etc.) get a{' '}
                  {'✓'} badge and post instantly.
                </Text>
              </View>

              {/* Submit button */}
              <Pressable
                style={[styles.submitButton, !canSubmit && styles.submitDisabled]}
                onPress={handleSubmit}
                disabled={!canSubmit}
              >
                <Text style={[TEXT.buttonLabel, styles.submitLabel]}>
                  Submit for review
                </Text>
              </Pressable>
            </View>
          )}

          {/* Step 2 -- Confirmation */}
          {step === 2 && (
            <View style={styles.confirmContainer}>
              <View style={styles.clockCircle}>
                <Text style={styles.clockIcon}>{'\u23F1'}</Text>
              </View>
              <Text style={[TEXT.sheetTitle, styles.confirmTitle]}>
                Pending review
              </Text>
              <Text style={styles.confirmBody}>
                A moderator will approve within 24h. You'll get a ping when it
                goes live.
              </Text>
              <Pressable style={styles.doneButton} onPress={handleDone}>
                <Text style={[TEXT.buttonLabel, styles.doneLabel]}>Done</Text>
              </Pressable>
            </View>
          )}
        </View>
      </BottomSheetModal>
    );
  },
);

PostSheet.displayName = 'PostSheet';
export { PostSheet };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 22,
    paddingTop: 8,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    color: PS_TOKENS.ink,
    marginBottom: 4,
  },
  stepSubtitle: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink2,
    marginBottom: 20,
  },
  // Type rows
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PS_TOKENS.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
    borderWidth: 1,
    borderColor: PS_TOKENS.borderCool,
  },
  typeIconTile: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: PS_TOKENS.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  typeEmoji: {
    fontSize: 20,
  },
  typeInfo: {
    flex: 1,
  },
  typeTitle: {
    ...TEXT.buttonLabel,
    color: PS_TOKENS.ink,
    marginBottom: 2,
  },
  typeSubtitle: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink2,
  },
  typeChevron: {
    fontSize: 18,
    color: PS_TOKENS.ink3,
    fontWeight: '600',
  },
  // Type badge
  typeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: PS_TOKENS.tint,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  typeBadgeEmoji: {
    fontSize: 14,
  },
  typeBadgeLabel: {
    ...TEXT.chip,
    color: PS_TOKENS.ink,
    textTransform: 'uppercase',
  },
  changeText: {
    ...TEXT.actionHint,
    color: PS_TOKENS.share,
    fontWeight: '600',
  },
  // Fields
  fieldLabel: {
    ...TEXT.factLabel,
    color: PS_TOKENS.ink3,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 12,
  },
  fieldInput: {
    backgroundColor: PS_TOKENS.bg,
    borderRadius: 12,
    padding: 14,
    ...TEXT.detailsBody,
    color: PS_TOKENS.ink,
  },
  fieldMultiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  whenWhereRow: {
    flexDirection: 'row',
    gap: 12,
  },
  halfField: {
    flex: 1,
  },
  // Notice
  noticeCard: {
    backgroundColor: PS_TOKENS.tint,
    borderRadius: 12,
    padding: 14,
    marginTop: 18,
  },
  noticeText: {
    ...TEXT.actionHint,
    color: PS_TOKENS.ink2,
    lineHeight: 17,
  },
  // Submit
  submitButton: {
    height: 50,
    borderRadius: 14,
    backgroundColor: PS_TOKENS.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
  },
  submitDisabled: {
    opacity: 0.4,
  },
  submitLabel: {
    color: '#FFFFFF',
  },
  // Confirmation
  confirmContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 60,
  },
  clockCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PS_TOKENS.brandAccent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  clockIcon: {
    fontSize: 28,
  },
  confirmTitle: {
    color: PS_TOKENS.ink,
    marginBottom: 10,
  },
  confirmBody: {
    ...TEXT.detailsBody,
    color: PS_TOKENS.ink2,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  doneButton: {
    height: 50,
    paddingHorizontal: 40,
    borderRadius: 14,
    backgroundColor: PS_TOKENS.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneLabel: {
    color: '#FFFFFF',
  },
});
```

---

## 7. Backdrop

**File:** `sheets/Backdrop.tsx`

### Props Interface

The Backdrop component accepts the standard `BottomSheetBackdropProps` from `@gorhom/bottom-sheet` and passes them through. It adds no custom props.

### Internal State Machine

None -- this is a pure configuration wrapper.

### Behavior

- **`appearsOnIndex={0}`** -- the backdrop fades in when the sheet snaps to index 0 (its first snap point).
- **`disappearsOnIndex={-1}`** -- the backdrop fades out when the sheet is fully dismissed.
- **`opacity={0.42}`** -- the scrim is 42% opaque (dark overlay).
- **`pressBehavior="close"`** -- tapping the backdrop dismisses the sheet.

All six modal sheets pass `backdropComponent={Backdrop}` to `BottomSheetModal`, giving them a consistent dimmed overlay.

### Source Code

```tsx
import { BottomSheetBackdropProps, BottomSheetBackdrop } from '@gorhom/bottom-sheet';

export const Backdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={0.42}
    pressBehavior="close"
  />
);
```

---

## Snap Point Summary

| Sheet         | Snap Point | Background Color   |
|---------------|------------|--------------------|
| ActionDrawer  | 82%        | `PS_TOKENS.card`   |
| ChatSheet     | 90%        | `PS_TOKENS.card`   |
| DetailsSheet  | 92%        | `PS_TOKENS.bg`     |
| FilterSheet   | 55%        | `PS_TOKENS.card`   |
| SavedSheet    | 90%        | `PS_TOKENS.bg`     |
| PostSheet     | 85%        | `PS_TOKENS.card`   |

All sheets use the shared `Backdrop` component with 42% opacity and tap-to-close behavior.

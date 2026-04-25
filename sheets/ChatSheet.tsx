import React, { forwardRef, useCallback, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { Backdrop } from './Backdrop';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';
import TypingDots from '@/components/TypingDots';
import { FormattedText } from '@/components/FormattedText';
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
        <BottomSheetView style={styles.container}>
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
                  {msg.role === 'ai' ? (
                    <FormattedText
                      text={msg.text}
                      color={PS_TOKENS.ink}
                    />
                  ) : (
                    <Text style={[TEXT.chatBody, styles.userText]}>
                      {msg.text}
                    </Text>
                  )}
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
        </BottomSheetView>
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

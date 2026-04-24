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
              <Text style={styles.heartIcon}>{'\u2665'}</Text>
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
                <Text style={styles.checkmark}>{'\u2713'}</Text>
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

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
      facts.push({ label: 'RSVPS', value: `${card.going} going${card.majorGoing ? ` \u00B7 ${card.majorGoing} from your major` : ''}` });
    }
    facts.push({ label: 'YOUR CIRCLE', value: card.peer });
    facts.push({ label: 'DO NEXT', value: card.actionHint });

    const getInitials = (title: string): string => {
      const words = title.split(/[\s\u00B7]+/).filter(Boolean);
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
              Synthesized from {card.sources.length} source{card.sources.length !== 1 ? 's' : ''} {'\u00B7'} updated{' '}
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

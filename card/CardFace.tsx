import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { SharedValue } from 'react-native-reanimated';
import { PS_TOKENS } from '@/theme/tokens';
import { TEXT } from '@/theme/typography';
import { shadow } from '@/theme/shadow';
import Chip from '@/components/Chip';
import StatPill from '@/components/StatPill';
import { SwipeOverlay } from './SwipeOverlay';
import { getCommentBadge } from '@/data/comments';
import type { Card } from '@/types';

interface CardFaceProps {
  card: Card;
  tx: SharedValue<number>;
  ty: SharedValue<number>;
  isTop: boolean;
  onMoreDetails: (card: Card) => void;
  onComments?: (card: Card) => void;
}

export function CardFace({ card, tx, ty, isTop, onMoreDetails, onComments }: CardFaceProps) {
  const isRally = card.type === 'rally';
  const hasRallyMeta = isRally && card.when && card.where;
  const badge = getCommentBadge(card.id);

  return (
    <View style={styles.root}>
      {/* Chip */}
      <Chip type={card.type} emoji={card.emoji} label={card.chipLabel} />

      {/* Comments badge — top-right, tap-only */}
      {badge && badge.count > 0 && (
        <Pressable
          style={styles.commentsBadge}
          onPress={(e) => {
            e.stopPropagation();
            onComments?.(card);
          }}
          hitSlop={6}
        >
          <Text style={styles.commentsBadgeText}>
            {'\ud83d\udcac'} {badge.count}
            {badge.topReactionEmoji ? ` \u00B7 ${badge.topReactionEmoji}` : ''}
          </Text>
        </Pressable>
      )}

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
  commentsBadge: {
    position: 'absolute',
    top: 18,
    right: 18,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: PS_TOKENS.dividerWarm,
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 11,
    minHeight: 44,
    justifyContent: 'center',
    zIndex: 5,
    ...shadow.button,
  },
  commentsBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: PS_TOKENS.ink,
    letterSpacing: -0.2,
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

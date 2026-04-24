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
              <Text style={styles.rowDot}>{'\u00B7'}</Text>
              <Text style={styles.rowWhen}>{formatWhen(savedAtISO)}</Text>
              {sent && (
                <>
                  <Text style={styles.rowDot}>{'\u00B7'}</Text>
                  <Text style={styles.sentBadge}>{'\u2713'} contacted</Text>
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
                {items.length} cared {'\u00B7'} sorted by most recent
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
